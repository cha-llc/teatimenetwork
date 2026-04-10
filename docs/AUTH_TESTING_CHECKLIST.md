/**
 * AUTHENTICATION & ACCESS CONTROL - TESTING CHECKLIST
 * Tea Time Network
 * 
 * Use this checklist to validate the complete auth system
 * All items must pass before production deployment
 */

// ============================================================================
// SECTION 1: AUTHENTICATION FLOW
// ============================================================================

## TEST 1.1: Sign Up Flow

- [ ] User can open sign up modal
- [ ] User enters valid email, password, full name
- [ ] Form validation shows for invalid inputs:
  - [ ] Invalid email format
  - [ ] Password too short (< 8 chars)
  - [ ] Missing required fields
- [ ] User clicks sign up
- [ ] Success message: "Check your email to verify your account"
- [ ] Verification email received (check test email inbox)
- [ ] Click verification link in email
- [ ] User is redirected to app
- [ ] User can sign in with new credentials
- [ ] Profile created in Supabase with defaults:
  - [ ] role = 'user'
  - [ ] subscription_status = 'free'
  - [ ] is_admin = false

## TEST 1.2: Sign In Flow

- [ ] User can open sign in modal
- [ ] User enters email and password
- [ ] Wrong password shows: "Email or password is incorrect"
- [ ] Non-existent email shows: "Email or password is incorrect"
- [ ] Correct credentials sign user in
- [ ] Auth modal closes automatically
- [ ] Dashboard loads
- [ ] User profile displays in header/menu

## TEST 1.3: Magic Link Flow

- [ ] User clicks "Magic Link" option
- [ ] User enters email
- [ ] Success message: "Check your email for a login link"
- [ ] Email received with magic link
- [ ] Click magic link
- [ ] User is logged in automatically
- [ ] Session persists on page refresh

## TEST 1.4: Password Reset

- [ ] User clicks "Forgot password?"
- [ ] Enters email
- [ ] Success message: "Check your email for reset link"
- [ ] Email received with reset link
- [ ] Click link → Password reset page loads
- [ ] User enters new password (8+ chars)
- [ ] User enters confirmation password
- [ ] Passwords match validation
- [ ] Password updated
- [ ] User can sign in with new password
- [ ] Old password no longer works

## TEST 1.5: Session Management

- [ ] User signs in
- [ ] Close browser completely
- [ ] Reopen app → User is still logged in
- [ ] Refresh page → Session persists
- [ ] Wait 5+ minutes → Token auto-refreshes (no action needed)
- [ ] User clicks sign out
- [ ] Redirected to landing page
- [ ] Session cleared from localStorage
- [ ] Trying to access protected page → Redirected to login

## TEST 1.6: Session Timeout

- [ ] Simulate token expiration
- [ ] Try to load protected page
- [ ] See message: "Your session has ended. Please sign in again"
- [ ] Sign in again
- [ ] No data loss
- [ ] Back to original page or home

// ============================================================================
// SECTION 2: ROLE-BASED ACCESS CONTROL
// ============================================================================

## TEST 2.1: User Role (Default)

- [ ] Sign up as new user
- [ ] In Supabase: Check profile, role = 'user'
- [ ] Try to access /admin
- [ ] See: "Admin access required"
- [ ] No admin buttons appear in UI
- [ ] Cannot view admin logs or user list

## TEST 2.2: Admin Role

- [ ] As CJ (admin):
  - [ ] Set REACT_APP_CJ_UID in .env.local
  - [ ] Sign in as CJ's account
  - [ ] In Supabase: Check profile, is_admin = true
  - [ ] Check profile, role = 'admin'
- [ ] Navigate to /admin
- [ ] Admin page loads (no access denied)
- [ ] See admin features:
  - [ ] User list
  - [ ] Analytics
  - [ ] Logs
  - [ ] Content management
- [ ] Can perform admin actions:
  - [ ] Create episodes
  - [ ] Create challenges
  - [ ] Manage users

## TEST 2.3: Non-Admin Cannot Access Admin

- [ ] Sign in as regular user (non-admin)
- [ ] Try to navigate to /admin
- [ ] See: "Admin access required"
- [ ] Cannot view any admin features
- [ ] No admin buttons in UI
- [ ] Direct URL /admin redirects to /
- [ ] Try to call admin API → Denied by RLS

## TEST 2.4: Profile Visibility

- [ ] Sign in as user A
- [ ] View own profile
- [ ] Can view other users' public profiles
- [ ] Cannot view other users' private data (email, subscription)
- [ ] As admin: Can view all user profiles

// ============================================================================
// SECTION 3: SUBSCRIPTION GATING
// ============================================================================

## TEST 3.1: Free Tier Access

- [ ] Sign up as new user
- [ ] subscription_status = 'free'
- [ ] Can access:
  - [ ] /habits (basic features)
  - [ ] /profile
  - [ ] /pricing
  - [ ] /privacy, /terms
- [ ] CANNOT access (sees paywall):
  - [ ] /analytics
  - [ ] /insights
  - [ ] /challenges
  - [ ] /notes
  - [ ] /neuro-feedback
  - [ ] /community
  - [ ] /teams
  - [ ] /momentum-realm
- [ ] Paywall message: "This is where the work continues"
- [ ] Upgrade button takes to /pricing
- [ ] "Renew" button also on /pricing

## TEST 3.2: Active Subscription Access

- [ ] As free user: Initiate upgrade on /pricing
- [ ] Complete Stripe payment
- [ ] Webhook updates: subscription_status = 'active'
- [ ] User profile now shows: "Active Subscriber"
- [ ] Can now access ALL content:
  - [ ] /analytics
  - [ ] /insights
  - [ ] /challenges
  - [ ] /notes
  - [ ] /neuro-feedback
  - [ ] /community
  - [ ] /teams
  - [ ] /momentum-realm
- [ ] No more paywall messages
- [ ] Can create content:
  - [ ] Write notes
  - [ ] Join challenges
  - [ ] Access full tools

## TEST 3.3: Expired Subscription

- [ ] Manually set subscription_status = 'expired' (in Supabase)
- [ ] Refresh page
- [ ] User sees: "Your subscription has ended"
- [ ] Can view own data (read-only):
  - [ ] View habits
  - [ ] View old notes
  - [ ] View old challenges
- [ ] CANNOT create new content:
  - [ ] New note button disabled
  - [ ] Challenge join blocked
  - [ ] See message: "Renew your subscription"
- [ ] Renew button takes to /pricing
- [ ] After renewal: subscription_status = 'active'
- [ ] Can create content again

## TEST 3.4: Free Tier Limited Content

- [ ] As free user: Look for "flagged" episodes
- [ ] Can view limited replays marked as "free"
- [ ] Cannot view full episode library
- [ ] See message for locked episodes: "Upgrade to watch"
- [ ] Educational content (how-it-works, etc.) available

## TEST 3.5: Subscription Status Persistence

- [ ] User A: subscription_status = 'free'
- [ ] User B: subscription_status = 'active'
- [ ] User C: subscription_status = 'expired'
- [ ] Each sees appropriate access and messages
- [ ] Status persists across sessions
- [ ] Status updates reflect immediately after Stripe webhook

// ============================================================================
// SECTION 4: PROTECTED ROUTES
// ============================================================================

## TEST 4.1: Auth Required Routes

- [ ] Sign out
- [ ] Try to access /habits
- [ ] See: "Sign in to continue"
- [ ] Two buttons: Sign In, Sign Up
- [ ] Click Sign In → Auth modal opens
- [ ] After signing in → Redirected to /habits

## TEST 4.2: Subscription Required Routes

- [ ] As free user: Try /challenges
- [ ] See paywall: "This is where the work continues"
- [ ] Features list shows what's included
- [ ] Upgrade button visible
- [ ] After upgrading: Route loads normally

## TEST 4.3: Admin Only Routes

- [ ] As regular user: Try /admin
- [ ] See: "Admin access required"
- [ ] No way to bypass (no buttons, no direct access)
- [ ] As admin: /admin loads
- [ ] All admin features visible

## TEST 4.4: Route Protection with Nested Routes

- [ ] /teams/join/:inviteCode requires subscription
- [ ] Joined /teams/join/abc123 as free user
- [ ] See paywall
- [ ] Upgrade → Route loads

// ============================================================================
// SECTION 5: ERROR HANDLING
// ============================================================================

## TEST 5.1: Error Messages (Human & Clear)

Check all error messages are:
- [ ] No jargon ("auth_error_invalid_credentials" ❌)
- [ ] Human language ("Email or password is incorrect" ✓)
- [ ] Clear action (what to do next)
- [ ] Calm tone (no urgency or guilt)

## TEST 5.2: Network Errors

- [ ] Simulate network offline
- [ ] Try to sign in
- [ ] See: "Network error. Please check your connection."
- [ ] Retry button available
- [ ] Back online → Retry works

## TEST 5.3: Rate Limiting

- [ ] Try to sign in 5 times with wrong password
- [ ] 6th attempt shows: "Too many attempts. Try again later."
- [ ] Wait 15 minutes (or check timestamp)
- [ ] Can sign in again
- [ ] Same for sign up and password reset

## TEST 5.4: Server Errors

- [ ] Simulate Supabase down
- [ ] Try to load page
- [ ] See: "Something went wrong. Please try again."
- [ ] Service restored
- [ ] Retry works

// ============================================================================
// SECTION 6: PAYWALL & MESSAGING
// ============================================================================

## TEST 6.1: Paywall Tone

- [ ] Check all paywall copy:
  - [ ] Uses: "This is where the work continues"
  - [ ] NOT: "Don't miss out"
  - [ ] NOT: "Only X spots left"
  - [ ] NOT: "Limited time offer"
  - [ ] Uses: "Support your practice"
  - [ ] Uses calm, confident language

## TEST 6.2: Paywall Components

- [ ] Title displayed
- [ ] Feature list shows benefits
- [ ] Pricing visible
- [ ] "Upgrade" CTA button
- [ ] "View pricing" alternative
- [ ] "Go back" button works
- [ ] Lock icon displayed

## TEST 6.3: Locked Content Indicators

- [ ] Locked content shows lock badge
- [ ] Badge has tooltip: "Active subscription required"
- [ ] Badge position correct (top-right default)
- [ ] Clicking badge doesn't navigate (visual only)

## TEST 6.4: Upgrade Flow

- [ ] Click upgrade on paywall
- [ ] Taken to /pricing
- [ ] See subscription options
- [ ] Click upgrade button
- [ ] Stripe checkout loads
- [ ] Complete payment
- [ ] Redirected to /payment-success
- [ ] Subscription status updated
- [ ] No longer see paywall

// ============================================================================
// SECTION 7: DATABASE & RLS POLICIES
// ============================================================================

## TEST 7.1: RLS Prevents Unauthorized Access

- [ ] In Supabase SQL:
  - [ ] User cannot SELECT other users' private profiles
  - [ ] User cannot UPDATE other users' profiles
  - [ ] User cannot DELETE other users' habits
  - [ ] Non-admin cannot SELECT admin_logs

## TEST 7.2: RLS Enforces Subscription

- [ ] User A (free): Cannot CREATE notes
- [ ] Query fails with RLS error
- [ ] User B (active): Can CREATE notes
- [ ] Query succeeds

## TEST 7.3: RLS Admin Enforcement

- [ ] Non-admin tries to UPDATE user role
- [ ] RLS denies: "new row violates row-level security policy"
- [ ] Admin can UPDATE user profiles
- [ ] Works as expected

## TEST 7.4: RLS Session Validation

- [ ] Session expires
- [ ] Try to query protected table
- [ ] Auth fails (no valid JWT)
- [ ] Redirected to login

// ============================================================================
// SECTION 8: SECURITY CHECKS
// ============================================================================

## TEST 8.1: No Client-Side Bypass

- [ ] Open DevTools
- [ ] Check localStorage (auth token present)
- [ ] Try to modify profile role in localStorage
- [ ] Refresh page
- [ ] Role reverts (server is source of truth)
- [ ] Cannot change subscription_status via localStorage

## TEST 8.2: No API Bypass

- [ ] Use REST client (curl, Postman)
- [ ] Try to access admin endpoint without auth
- [ ] Request denied (401 Unauthorized)
- [ ] Try with valid token but user not admin
- [ ] Request denied (403 Forbidden)
- [ ] Valid admin token → Request succeeds

## TEST 8.3: Sensitive Data Not Exposed

- [ ] Check network tab for API calls
- [ ] No passwords in requests
- [ ] No secrets in localStorage
- [ ] No admin status in HTML (loaded dynamically)
- [ ] No subscription hardcoded

## TEST 8.4: HTTPS in Production

- [ ] In production: All requests are HTTPS
- [ ] No HTTP fallback
- [ ] Mixed content warnings: None
- [ ] Certificate valid

// ============================================================================
// SECTION 9: INTEGRATION TESTS
// ============================================================================

## TEST 9.1: Complete Signup + Upgrade Journey

- [ ] New user signs up
- [ ] Receives verification email
- [ ] Clicks link
- [ ] Dashboard loads with free tier
- [ ] Tries to access /challenges
- [ ] Sees paywall
- [ ] Clicks "Upgrade"
- [ ] Completes Stripe payment
- [ ] Redirected to /payment-success
- [ ] Now sees "You're all set!"
- [ ] Can access /challenges
- [ ] Can create content

## TEST 9.2: Admin + User Separation

- [ ] Sign in as admin
- [ ] Can access /admin
- [ ] See all users
- [ ] Sign out
- [ ] Sign in as regular user
- [ ] Cannot access /admin
- [ ] Can only see own profile

## TEST 9.3: Multi-User Scenario

- [ ] User A (free) and User B (active) both online
- [ ] User A tries /challenges → Paywall
- [ ] User B accesses /challenges → Works
- [ ] Both see correct subscription status
- [ ] No cross-user data leakage

## TEST 9.4: Subscription Upgrade Midstream

- [ ] User accessing free content as free user
- [ ] Opens /pricing in new tab
- [ ] Upgrades subscription
- [ ] Returns to first tab
- [ ] Page still shows paywall
- [ ] Refresh → Now shows content
- [ ] No need to restart app

// ============================================================================
// SECTION 10: ACCEPTANCE CRITERIA
// ============================================================================

## Acceptance Criteria (ALL MUST PASS)

- [ ] ✓ Auth flow works end-to-end
  - [ ] Sign up, verify, sign in, sign out all work
  - [ ] Session persists
  - [ ] Token auto-refreshes

- [ ] ✓ Roles function correctly
  - [ ] Admin access works
  - [ ] Non-admin blocked from /admin
  - [ ] Role stored in database
  - [ ] RLS enforces role

- [ ] ✓ Paywall logic is enforced
  - [ ] Free users see paywall
  - [ ] Active subscribers see content
  - [ ] Expired users see read-only
  - [ ] Messages are calm and clear

- [ ] ✓ No unauthorized access paths exist
  - [ ] Cannot bypass /admin
  - [ ] Cannot bypass /challenges as free user
  - [ ] RLS prevents database bypass
  - [ ] API validates on backend

- [ ] ✓ App Dev confirms no ambiguity
  - [ ] All rules documented
  - [ ] All components tested
  - [ ] All scenarios covered
  - [ ] Ready for production

// ============================================================================
// SIGN-OFF
// ============================================================================

Date Tested: ___________
Tested By: ___________
Issues Found: ___ (0 = ready for production)
Sign-Off: ___________

