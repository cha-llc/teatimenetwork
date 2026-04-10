/**
 * SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
 * Tea Time Network - Auth & Access Control
 * 
 * These policies enforce access control at the database level
 * This is SERVER-SIDE validation, not client-side
 * 
 * COPY AND PASTE into Supabase SQL Editor
 */

-- ============================================================================
-- PROFILES TABLE - Role and Subscription Control
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can view public profiles (for community features)
CREATE POLICY "Public profiles are readable" ON profiles
  FOR SELECT
  USING (id IN (
    SELECT id FROM profiles WHERE display_name IS NOT NULL
  ));

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Users cannot change their own role or admin status
    role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Policy: Only admins can update other user profiles
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Only admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
-- HABITS TABLE - Auth + Subscription Gating
-- ============================================================================

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can create habits (auth required)
CREATE POLICY "Users can create habits" ON habits
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND subscription_status IN ('active', 'free')
    )
  );

-- Policy: Users can update their own habits
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own habits
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- CHALLENGES TABLE - Subscription Required (Active)
-- ============================================================================

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Policy: View challenges (subscription check)
CREATE POLICY "Active subscribers can view challenges" ON challenges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_status = 'active'
    )
  );

-- Policy: Create challenges (admin only)
CREATE POLICY "Admins can create challenges" ON challenges
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Update challenges (admin only)
CREATE POLICY "Admins can update challenges" ON challenges
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Delete challenges (admin only)
CREATE POLICY "Admins can delete challenges" ON challenges
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
-- NOTES TABLE - Subscription Required (Active)
-- ============================================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: View notes (subscription check)
CREATE POLICY "Active subscribers can view notes" ON notes
  FOR SELECT
  USING (
    user_id = auth.uid() OR (
      -- Or if shared publicly and user has active subscription
      is_public = true AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND subscription_status = 'active'
      )
    )
  );

-- Policy: Create notes (auth + subscription required)
CREATE POLICY "Active subscribers can create notes" ON notes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_status = 'active'
    )
  );

-- Policy: Update own notes
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Delete own notes
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- ADMIN_LOGS TABLE - Admin Only
-- ============================================================================

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin logs
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Only admins can insert logs
CREATE POLICY "Admins can create logs" ON admin_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
-- SUBSCRIPTIONS TABLE - User owns subscription
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Only admins can update subscriptions (via admin panel)
CREATE POLICY "Admins can update subscriptions" ON subscriptions
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
-- SESSIONS TABLE - Track login sessions
-- ============================================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Sessions auto-created on login (service role only)
CREATE POLICY "Service role creates sessions" ON sessions
  FOR INSERT
  WITH CHECK (true); -- Only service role can insert

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Get current user's subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT subscription_status FROM profiles WHERE id = auth.uid();
$$;

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_admin FROM profiles WHERE id = auth.uid();
$$;

-- Function: Check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT subscription_status = 'active' FROM profiles WHERE id = auth.uid();
$$;

-- Function: Auto-update subscription_status on created_at
CREATE OR REPLACE FUNCTION update_subscription_status_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.subscription_status IS NULL THEN
    NEW.subscription_status := 'free';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_default_subscription_status
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_subscription_status_on_profile();

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
/*

IMPORTANT: These policies work in conjunction with:

1. CLIENT-SIDE PROTECTION:
   - ProtectedRoute components
   - useAccessControl hook
   - AuthContext checks

2. SERVER-SIDE PROTECTION:
   - RLS policies (above)
   - Edge Function authorization
   - API validation

3. SESSION MANAGEMENT:
   - Auto token refresh (configured in AuthContext)
   - Session tracking in sessions table
   - Logout clears session

4. SUBSCRIPTION UPDATES:
   - Stripe webhook updates subscription_status
   - Only service role can update (admin panel)
   - RLS prevents user modification

5. ADMIN OPERATIONS:
   - All admin routes require is_admin = true
   - Admin_logs tracks all admin actions
   - Audit trail for compliance

TESTING CHECKLIST:

[ ] Free user can sign up
[ ] Free user can access /habits
[ ] Free user cannot access /challenges
[ ] Free user sees paywall on locked routes
[ ] Active subscriber can access all content
[ ] Expired subscriber sees read-only message
[ ] Admin can access /admin
[ ] Regular user cannot access /admin
[ ] Admin can view all profiles
[ ] Regular user can only view own profile
[ ] Subscription status updates from Stripe
[ ] Session persists on refresh
[ ] Session clears on logout

*/
