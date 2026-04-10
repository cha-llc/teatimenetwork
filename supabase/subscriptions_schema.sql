/**
 * SUPABASE SCHEMA - SUBSCRIPTIONS
 * 
 * Database tables for subscription management.
 * 
 * Deployment:
 * 1. Copy this entire file content
 * 2. Go to Supabase Dashboard → SQL Editor
 * 3. Create new query and paste this file
 * 4. Run all queries
 * 5. Enable RLS policies as shown
 */

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR NOT NULL,
  stripe_subscription_id VARCHAR NOT NULL UNIQUE,
  stripe_customer_id VARCHAR,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'trial', 'past_due', 'cancelled', 'expired')),
  
  -- Dates
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  renewal_date TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Payment method info (never store full card)
  payment_method_id VARCHAR,
  payment_method_brand VARCHAR,
  payment_method_last4 VARCHAR,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_sub_id (stripe_subscription_id),
  INDEX idx_status (status),
  INDEX idx_updated_at (updated_at)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "Users see own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role manages subscriptions"
  ON subscriptions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- ============================================================================
-- SUBSCRIPTION EVENTS TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL CHECK (
    event_type IN (
      'subscription_created',
      'subscription_updated',
      'subscription_cancelled',
      'subscription_expired',
      'subscription_renewed',
      'payment_succeeded',
      'payment_failed',
      'payment_retried'
    )
  ),
  
  -- Stripe event reference
  stripe_event_id VARCHAR,
  
  -- Event details
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  handled_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_event_type (event_type),
  INDEX idx_stripe_event_id (stripe_event_id),
  INDEX idx_processed_at (processed_at)
);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can see events related to their subscription
CREATE POLICY "Users see own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage
CREATE POLICY "Service role manages subscription events"
  ON subscription_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- UPDATE USERS TABLE TO ADD SUBSCRIPTION FIELDS
-- ============================================================================

-- Add subscription fields to users table (if not already present)
ALTER TABLE users ADD COLUMN IF NOT EXISTS access_level VARCHAR DEFAULT 'free' CHECK (access_level IN ('free', 'paid', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR CHECK (subscription_status IN ('active', 'trial', 'past_due', 'cancelled', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

-- ============================================================================
-- VIEW: User Access Level
-- ============================================================================

-- Create view to quickly check user's access level
-- Syncs subscription status with access level
CREATE OR REPLACE VIEW user_access_levels AS
SELECT
  u.id,
  u.email,
  CASE
    WHEN u.access_level = 'admin' THEN 'admin'
    WHEN s.status IN ('active', 'trial') THEN 'paid'
    WHEN s.status = 'past_due' THEN 'paid' -- Grace period
    ELSE 'free'
  END AS access_level,
  CASE
    WHEN s.id IS NOT NULL THEN true
    ELSE false
  END AS has_active_subscription,
  s.status AS subscription_status,
  s.expires_at AS subscription_expires_at,
  s.renewal_date AS subscription_renewal_date
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status != 'expired';

-- ============================================================================
-- FUNCTION: Get user subscription
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_subscription(user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_id VARCHAR,
  status VARCHAR,
  start_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.plan_id,
    s.status,
    s.start_date,
    s.renewal_date,
    s.expires_at,
    s.cancelled_at
  FROM subscriptions s
  WHERE s.user_id = get_user_subscription.user_id
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Check if user has paid access
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_paid_access(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_status VARCHAR;
BEGIN
  SELECT s.status INTO v_subscription_status
  FROM subscriptions s
  WHERE s.user_id = user_has_paid_access.user_id
    AND s.status IN ('active', 'trial', 'past_due')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  RETURN v_subscription_status IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Expire old subscriptions (Batch job)
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS TABLE (
  expired_count INTEGER
) AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Expire cancelled subscriptions past renewal date
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'cancelled'
    AND renewal_date < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Also expire past_due subscriptions past grace period
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'past_due'
    AND updated_at < NOW() - INTERVAL '5 days';
  
  GET DIAGNOSTICS v_count = v_count + ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Sync user access level from subscription
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_user_access_level(user_id UUID)
RETURNS TABLE (
  new_access_level VARCHAR,
  success BOOLEAN
) AS $$
DECLARE
  v_access_level VARCHAR;
BEGIN
  -- Determine access level based on subscription
  SELECT CASE
    WHEN u.access_level = 'admin' THEN 'admin'
    WHEN s.status IN ('active', 'trial') THEN 'paid'
    WHEN s.status = 'past_due' THEN 'paid'
    ELSE 'free'
  END INTO v_access_level
  FROM users u
  LEFT JOIN subscriptions s ON u.id = s.user_id
  WHERE u.id = sync_user_access_level.user_id;
  
  -- Update user
  UPDATE users
  SET access_level = v_access_level
  WHERE id = sync_user_access_level.user_id;
  
  RETURN QUERY SELECT v_access_level, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date) WHERE status = 'cancelled';
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated ON subscriptions(updated_at) WHERE status IN ('past_due', 'cancelled');
CREATE INDEX IF NOT EXISTS idx_subscription_events_unhandled ON subscription_events(id) WHERE handled_at IS NULL;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Example: Insert test subscription (development only)
-- DO NOT use in production
--
-- INSERT INTO subscriptions (
--   user_id,
--   plan_id,
--   stripe_subscription_id,
--   stripe_customer_id,
--   status,
--   start_date,
--   renewal_date
-- ) VALUES (
--   'test-user-uuid',
--   'TTN_APP_MEMBER_MONTHLY',
--   'sub_test_123',
--   'cus_test_123',
--   'active',
--   NOW(),
--   NOW() + INTERVAL '30 days'
-- );

-- ============================================================================
-- MIGRATION: Add subscription fields to existing users
-- ============================================================================

-- First, set default access level for existing users
UPDATE users
SET access_level = 'free'
WHERE access_level IS NULL;

-- For users with active subscriptions, mark as paid
UPDATE users u
SET access_level = 'paid'
FROM subscriptions s
WHERE u.id = s.user_id
  AND s.status IN ('active', 'trial', 'past_due');

-- ============================================================================
-- SCHEMA VERIFICATION QUERIES
-- ============================================================================

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('subscriptions', 'subscription_events');

-- Check user access levels
-- SELECT id, email, access_level FROM users LIMIT 10;

-- View all active subscriptions
-- SELECT u.email, s.status, s.renewal_date 
-- FROM subscriptions s
-- JOIN users u ON s.user_id = u.id
-- WHERE s.status IN ('active', 'trial', 'past_due');

-- ============================================================================
-- NOTES
-- ============================================================================

-- Status Transitions:
-- - active → cancelled (user initiates, access continues until renewal_date)
-- - active → past_due (payment fails, grace period activated)
-- - past_due → active (payment succeeds, grace period cleared)
-- - past_due → expired (grace period expires, access revoked)
-- - cancelled → expired (renewal_date reached, access revoked)
-- - trial → active (trial ends and payment succeeds)
-- - trial → cancelled (user cancels trial)
--
-- Grace Period:
-- - When payment fails: status → past_due
-- - User keeps access for 5 days (configurable)
-- - If payment succeeds within 5 days: status → active
-- - If 5 days pass without payment: status → expired
--
-- Access Control Integration:
-- - user_access_levels view shows computed access level
-- - user_has_paid_access() function for quick checks
-- - Every subscription change should call sync_user_access_level()
--
-- Audit Trail:
-- - Every subscription event logged to subscription_events
-- - Stripe webhook IDs stored for deduplication
-- - Timestamps for all state changes
--
-- ============================================================================
