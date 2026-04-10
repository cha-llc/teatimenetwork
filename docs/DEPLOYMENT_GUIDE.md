/**
 * DEPLOYMENT GUIDE - AUTHENTICATION & ACCESS CONTROL
 * Tea Time Network
 * 
 * Step-by-step instructions for deploying the auth system to production
 */

// ============================================================================
// PHASE 1: LOCAL DEVELOPMENT SETUP (5 minutes)
// ============================================================================

## 1.1: Install Dependencies

```bash
cd /home/claude/teatimenetwork
npm install
```

## 1.2: Create .env.local

```bash
cp .env.example .env.local
```

Edit .env.local and fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_CJ_UID=uuid-of-cj-user
```

## 1.3: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

# ============================================================================
# PHASE 2: SUPABASE SETUP (15 minutes)
# ============================================================================

## 2.1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: "Tea Time Network"
4. Password: Strong password (saved in secrets manager)
5. Region: Choose closest to your users
6. Wait for project to initialize (5 minutes)

## 2.2: Get API Credentials

1. In Supabase: Settings → API
2. Copy "Project URL" → VITE_SUPABASE_URL
3. Copy "Anon Key" → VITE_SUPABASE_ANON_KEY
4. Copy "Service Role Key" → SUPABASE_SERVICE_ROLE_KEY (save securely)

## 2.3: Update Database Schema

1. In Supabase: SQL Editor
2. Create tables (copy from database schema file):

```sql
-- Example: Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'expired')),
  is_admin BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  subscription_tier TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TEXT DEFAULT '09:00',
  timezone TEXT DEFAULT 'UTC',
  trial_started_at TIMESTAMP,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_status);
```

3. Create other tables (habits, notes, challenges, etc.)
   - Refer to existing Supabase migrations

## 2.4: Apply RLS Policies

1. In Supabase: SQL Editor
2. Copy contents of `supabase/rls_policies.sql`
3. Paste and execute
4. This creates all security policies

## 2.5: Set Up Anon Role Permissions

1. In Supabase: Authentication → Roles and Permissions
2. Set 'anon' role (unauthenticated):
   - Read: public tables only
   - Write: None
3. Set 'authenticated' role:
   - Read: Own data + shared data
   - Write: Own data only

## 2.6: Configure Email Settings

1. In Supabase: Authentication → Email Templates
2. Verify subject lines:
   - Confirm signup: "Verify your email"
   - Password reset: "Reset your password"
   - Magic link: "Your sign-in link"
3. Customize if needed (keep brand tone)

## 2.7: Configure Auth Providers

1. Authentication → Providers
2. Email: ✓ Enabled
3. Social: ✗ Disabled (per spec)
4. Anonymous: ✗ Disabled (per spec)

# ============================================================================
# PHASE 3: STRIPE SETUP (10 minutes)
# ============================================================================

## 3.1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Create Account"
3. Add business details
4. Verify email and phone

## 3.2: Get API Keys

1. Dashboard → Developers → API keys
2. Copy Publishable Key → VITE_STRIPE_PUBLISHABLE_KEY
3. Copy Secret Key → STRIPE_SECRET_KEY (save securely)

## 3.3: Create Products & Prices

1. Dashboard → Products
2. Create product: "Tea Time Network Subscription"
3. Add recurring price:
   - Amount: $9.99 USD (or your price)
   - Billing: Monthly
4. Note Product ID (needed for Edge Functions)

## 3.4: Create Webhook Endpoint

1. Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: https://your-domain.com/api/webhooks/stripe
   (This will be your production domain)
4. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - payment_intent.succeeded
   - payment_intent.payment_failed
5. Copy Webhook Signing Secret → STRIPE_WEBHOOK_SECRET

## 3.5: Enable Subscriptions

1. Settings → Billing settings
2. Enable: Recurring billing
3. Set default payment method requirement

# ============================================================================
# PHASE 4: EDGE FUNCTIONS SETUP (10 minutes)
# ============================================================================

## 4.1: Create Stripe Webhook Function

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.132.0/http/server.ts";
import { Stripe } from "npm:stripe@latest";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "customer.subscription.updated":
      const subscription = event.data.object;
      // Update user subscription_status in database
      // subscription.status = 'active' → update profiles set subscription_status = 'active'
      break;

    case "customer.subscription.deleted":
      // subscription.status = 'canceled' → update to 'expired'
      break;

    case "payment_intent.succeeded":
      // Log successful payment
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

## 4.2: Deploy Function

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

## 4.3: Update Webhook Endpoint URL

1. In Stripe: Webhooks
2. Update endpoint URL to production URL:
   `https://your-domain.com/api/webhooks/stripe`

# ============================================================================
# PHASE 5: TESTING (20 minutes)
# ============================================================================

## 5.1: Test Sign Up Flow

```bash
npm run test
```

Or manually:
1. Visit http://localhost:5173
2. Click "Sign Up"
3. Fill in email, password, name
4. Click "Create Account"
5. Check email inbox for verification link
6. Click link → Verify
7. Sign in with credentials

## 5.2: Test Admin Access

1. In Supabase: Users
2. Find CJ's user UUID
3. In .env.local: Set REACT_APP_CJ_UID=<uuid>
4. Restart server
5. Sign in as CJ
6. Navigate to /admin
7. Should load (no "Admin access required" message)

## 5.3: Test Subscription

1. Sign up as test user
2. Try accessing /challenges
3. Should see paywall: "This is where the work continues"
4. Click "Upgrade Now"
5. Go to /pricing
6. Click "Subscribe"
7. Use Stripe test card: 4242 4242 4242 4242
8. Complete payment
9. Redirected to /payment-success
10. Subscription status updated
11. Can now access /challenges

## 5.4: Run Full Test Suite

```bash
npm run test:coverage
```

Should see:
- 0 failures
- All auth tests passing
- Access control tests passing
- Paywall tests passing

# ============================================================================
# PHASE 6: PRODUCTION DEPLOYMENT (30 minutes)
# ============================================================================

## 6.1: Prepare Production Environment

1. Set environment variables in hosting provider (Vercel, Netlify, etc.):

```
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
REACT_APP_CJ_UID=cj-uuid
VITE_ENV=production
```

2. Ensure all variables are marked as "sensitive"

## 6.2: Build & Deploy

```bash
npm run build
```

Deploy to your hosting provider:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- Docker: `docker build -t teatimenetwork . && docker push ...`

## 6.3: Verify Production Deployment

1. Visit production URL
2. Verify:
   - [ ] HTTPS working
   - [ ] Auth loading properly
   - [ ] Sign up works
   - [ ] Sign in works
   - [ ] Admin can access /admin
   - [ ] Paywall displaying

## 6.4: Update Stripe Webhook

1. In Stripe: Webhooks
2. Update endpoint URL to production:
   `https://your-production-domain.com/api/webhooks/stripe`

## 6.5: Test Production Payment

1. Create test subscription with real Stripe test keys
2. Verify webhook updates subscription_status
3. Verify user can access content after payment

## 6.6: Monitor & Alert

1. Set up monitoring:
   - Sentry for error tracking
   - LogRocket for session replays
   - Datadog for infrastructure
2. Set up alerts:
   - Failed authentications
   - Stripe webhook failures
   - RLS policy violations
   - 500 errors

# ============================================================================
# PHASE 7: POST-DEPLOYMENT (Ongoing)
# ============================================================================

## 7.1: Monitor Logs

Daily:
- Check Supabase logs for RLS violations
- Check Stripe webhook logs for failures
- Review auth error rates

## 7.2: Update Admin Users

1. In Supabase: Users
2. For each admin user:
   - Set is_admin = true
   - Set role = 'admin'
   - Add to admin_logs as required

## 7.3: Regular Security Audits

Monthly:
- Review auth logs
- Check for suspicious activity
- Verify RLS policies are working
- Audit admin actions

## 7.4: Disaster Recovery

Backup procedures:
1. Export Supabase data weekly
2. Store backups securely
3. Test restore process quarterly
4. Document recovery steps

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

## Issue: "Supabase URL not found"

Fix:
1. Check .env.local has VITE_SUPABASE_URL
2. Verify URL is correct (no extra spaces)
3. Restart dev server

## Issue: "Invalid anon key"

Fix:
1. Copy anon key again from Supabase
2. Ensure it starts with `eyJ`
3. No extra spaces or line breaks

## Issue: "Admin route shows access denied"

Fix:
1. Verify REACT_APP_CJ_UID is set
2. Get correct UUID from Supabase Users
3. Verify user's is_admin = true in database
4. Restart server

## Issue: "Paywall not showing"

Fix:
1. Verify user has subscription_status = 'free'
2. Check ProtectedRoute is configured on route
3. Verify requireSubscription="active" is set
4. Check browser console for JS errors

## Issue: "Stripe webhook not firing"

Fix:
1. Verify webhook endpoint URL is correct
2. Check webhook secret matches in .env
3. Verify function is deployed and running
4. Check Stripe webhook logs for failures
5. Manually test with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5173/api/webhooks/stripe
   stripe trigger customer.subscription.created
   ```

## Issue: "RLS policy preventing access"

Fix:
1. Check Supabase SQL logs
2. Verify user is authenticated
3. Verify role/subscription matches policy
4. Debug by enabling Supabase logging:
   ```sql
   SELECT * FROM pgsql_requests ORDER BY created_at DESC;
   ```

# ============================================================================
# PRODUCTION CHECKLIST
# ============================================================================

Before going live:

- [ ] All tests passing (npm run test)
- [ ] No console errors in production build
- [ ] HTTPS enabled
- [ ] Stripe live keys configured
- [ ] Webhook endpoint working
- [ ] RLS policies applied
- [ ] Admin users configured
- [ ] Email verification working
- [ ] Password reset working
- [ ] Session persistence working
- [ ] Paywall showing correctly
- [ ] Subscription gating enforced
- [ ] Admin routes protected
- [ ] Error messages human-readable
- [ ] Monitoring & alerts configured
- [ ] Backup procedure documented
- [ ] Disaster recovery tested
- [ ] Load testing completed (100+ concurrent users)
- [ ] Security audit passed
- [ ] Compliance check passed (GDPR, etc.)

# ============================================================================
# SUCCESS CRITERIA
# ============================================================================

Deployment is successful when:

✓ Users can sign up and verify email
✓ Users can sign in and out
✓ Admin can access /admin
✓ Free users see paywall
✓ Active subscribers see content
✓ Expired subscribers see read-only
✓ Stripe payments process correctly
✓ Subscription status updates via webhook
✓ Session persists across refreshes
✓ Token auto-refreshes without user action
✓ All error messages are human-readable
✓ No unauthorized access possible
✓ Monitoring is active
✓ Team is trained on system

🎉 **Go Live!**

