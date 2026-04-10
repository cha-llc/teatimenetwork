# Access Control Test Matrix - Tea Time Network

**Date:** April 10, 2026  
**Status:** Ready for Testing  
**Version:** 1.0  

---

## 🧪 TEST ACCOUNT SETUP

### Account 1: Anonymous (Logged Out)
**Email:** N/A  
**Access Level:** N/A  
**Status:** Not authenticated  
**Purpose:** Test public/anonymous experience  

### Account 2: Free User (Logged In)
**Email:** test.free@teatimenetwork.com  
**Password:** TempPassword123!  
**Access Level:** `free`  
**Status:** Authenticated, no payment  
**Purpose:** Test free tier limitations  

### Account 3: Paid User (Logged In)
**Email:** test.paid@teatimenetwork.com  
**Password:** TempPassword123!  
**Access Level:** `paid`  
**Status:** Authenticated, paid member  
**Purpose:** Test paid tier access  
**Setup:** Manually set in database or via test payment

### Account 4: Admin/Dev (Logged In)
**Email:** admin@teatimenetwork.com  
**Password:** AdminPassword123!  
**Access Level:** `admin`  
**Status:** Authenticated, admin override  
**Purpose:** Test admin access & debugging  
**Setup:** Database edit or admin override flag

---

## 📋 TEST SCENARIOS

### REPLAY ACCESS TESTS

#### T1.1: Anonymous User - Replay Access
**Setup:** Logged out  
**Action:** Navigate to show > episode > replay  
**Expected Result:**
- [ ] Cannot see episode player
- [ ] Sees sign-in prompt
- [ ] "Sign In to Access" modal appears
- [ ] Sign in button visible
- [ ] No hidden content shown

**Actual Result:** _______________  
**Pass:** ☐ ☐ Fail

---

#### T1.2: Free User - Sample Episodes Visible
**Setup:** Logged in as free user  
**Action:** Navigate to show episodes  
**Expected Result:**
- [ ] Can see 1-3 sample episodes per show
- [ ] Samples labeled "Free Sample" badge
- [ ] Other episodes show lock icon
- [ ] Sample episodes have full player
- [ ] Other episodes show locked state

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T1.3: Free User - Can Watch Sample
**Setup:** Logged in as free user  
**Action:** Click play on free sample episode  
**Expected Result:**
- [ ] Player loads
- [ ] Can play/pause
- [ ] Can see progress bar
- [ ] Can resume from where left off (if implemented)
- [ ] No purchase prompt during playback

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T1.4: Free User - Cannot Watch Locked Episode
**Setup:** Logged in as free user  
**Action:** Try to access locked episode (not sample)  
**Expected Result:**
- [ ] Cannot access episode player
- [ ] Sees locked state with:
  - Title
  - Purpose statement
  - What's included (bullet list)
  - Upgrade button
- [ ] No countdown timers
- [ ] No aggressive overlays
- [ ] Can click upgrade button

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T1.5: Paid User - All Episodes Visible
**Setup:** Logged in as paid user  
**Action:** Navigate to show episodes  
**Expected Result:**
- [ ] Can see all episodes
- [ ] No lock icons
- [ ] No "Free Sample" badges
- [ ] All episodes clickable
- [ ] All have full player

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T1.6: Paid User - Can Watch All Episodes
**Setup:** Logged in as paid user  
**Action:** Click any episode  
**Expected Result:**
- [ ] Player loads immediately
- [ ] Full player features available
- [ ] Resume functionality works
- [ ] No upgrade prompts
- [ ] No locked states shown

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T1.7: Admin User - All Episodes Visible & Accessible
**Setup:** Logged in as admin  
**Action:** Navigate to any episode  
**Expected Result:**
- [ ] All episodes visible
- [ ] All episodes fully accessible
- [ ] Can access override/test controls
- [ ] Can switch user access levels
- [ ] No limitations shown

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T1.8: Free → Paid Upgrade - Immediate Access
**Setup:** Start as free user, upgrade to paid  
**Action:** Complete upgrade flow, refresh page  
**Expected Result:**
- [ ] User access level updated to 'paid'
- [ ] All episodes now visible
- [ ] Locked episodes now playable
- [ ] No manual refresh needed (or auto-refresh works)
- [ ] Resume sample playback works

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### TEA TIME NOTES TESTS

#### T2.1: Anonymous User - Notes Not Accessible
**Setup:** Logged out  
**Action:** Try to access episode notes  
**Expected Result:**
- [ ] Cannot see note content
- [ ] Sign-in prompt shown
- [ ] Cannot preview any notes

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T2.2: Free User - Notes Preview (15%)
**Setup:** Logged in as free user  
**Action:** Open episode with attached notes  
**Expected Result:**
- [ ] Can see first 15% of note
- [ ] Text is readable for 15%
- [ ] Remaining 85% is dimmed/faded
- [ ] "Continue reading" button visible
- [ ] Click button → upgrade screen

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T2.3: Paid User - Full Notes Visible
**Setup:** Logged in as paid user  
**Action:** Open episode with notes  
**Expected Result:**
- [ ] Full note content visible
- [ ] No dimming or fading
- [ ] No "upgrade" prompts
- [ ] All 100% of content readable

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T2.4: Free → Paid Upgrade - Notes Unlock
**Setup:** Start as free user, upgrade  
**Action:** Navigate to same note  
**Expected Result:**
- [ ] Full note now visible
- [ ] No refresh needed (or auto-updates)
- [ ] Dimming removed
- [ ] All content accessible

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### CHALLENGE & PROMPTS TESTS

#### T3.1: Anonymous User - Challenges Not Accessible
**Setup:** Logged out  
**Action:** Try to access challenge  
**Expected Result:**
- [ ] Cannot see challenge
- [ ] Sign-in prompt shown

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T3.2: Free User - Step 1 Only
**Setup:** Logged in as free user  
**Action:** Open challenge with 4 steps  
**Expected Result:**
- [ ] Step 1 fully visible
- [ ] Step 1 title and content readable
- [ ] Steps 2, 3, 4 shown as locked tiles
- [ ] Locked tiles show lock icon
- [ ] Click locked step → upgrade prompt
- [ ] Only first reflection prompt visible

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T3.3: Free User - Cannot Complete Locked Steps
**Setup:** Logged in as free user  
**Action:** Try to mark locked step as complete  
**Expected Result:**
- [ ] Locked step cannot be clicked/selected
- [ ] No checkbox appears on locked steps
- [ ] Only step 1 checkbox available
- [ ] Completion tracking not tracked for locked steps

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T3.4: Paid User - All Steps Visible
**Setup:** Logged in as paid user  
**Action:** Open same challenge  
**Expected Result:**
- [ ] All 4 steps visible
- [ ] No lock icons
- [ ] All steps clickable/interactive
- [ ] All reflection prompts visible
- [ ] Can mark any step complete
- [ ] Completion tracked

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T3.5: Paid User - Can Complete Challenge
**Setup:** Logged in as paid user  
**Action:** Complete all steps  
**Expected Result:**
- [ ] Can mark each step complete
- [ ] Completion status tracked
- [ ] Challenge marked as complete
- [ ] No limits on steps available

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T3.6: Free → Paid Upgrade - Challenge Unlock
**Setup:** Start as free user on challenge, upgrade  
**Action:** Go back to challenge  
**Expected Result:**
- [ ] All steps now visible
- [ ] All prompts now visible
- [ ] Can now complete all steps
- [ ] No refresh needed (or auto-updates)

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### TOOLS & FRAMEWORK TESTS

#### T4.1: Anonymous User - Tools Not Accessible
**Setup:** Logged out  
**Action:** Try to access tool  
**Expected Result:**
- [ ] Cannot access tool
- [ ] Sign-in prompt shown

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T4.2: Free User - Tool Locked View
**Setup:** Logged in as free user  
**Action:** Navigate to tool/framework library  
**Expected Result:**
- [ ] Tool shown with locked state
- [ ] Locked preview shows:
  - [ ] Lock icon
  - [ ] Tool title
  - [ ] Purpose statement
  - [ ] List of features (read-only)
  - [ ] "Unlock" button
- [ ] No interaction with tool possible
- [ ] Cannot open/use tool

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T4.3: Free User - Cannot Interact With Tool
**Setup:** Logged in as free user  
**Action:** Try to interact with locked tool  
**Expected Result:**
- [ ] Tool does not respond to clicks
- [ ] Cannot open worksheets
- [ ] Cannot modify templates
- [ ] Read-only state maintained

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T4.4: Paid User - Full Tool Access
**Setup:** Logged in as paid user  
**Action:** Open tool  
**Expected Result:**
- [ ] Tool opens fully
- [ ] No locked overlays
- [ ] All features interactive
- [ ] Can use worksheets
- [ ] Can download templates
- [ ] No upgrade prompts

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T4.5: Free → Paid Upgrade - Tool Unlock
**Setup:** Start as free user, upgrade  
**Action:** Navigate to tool  
**Expected Result:**
- [ ] Tool now fully accessible
- [ ] No locked preview
- [ ] All features available
- [ ] Interactive immediately

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### LOCKED SCREEN BEHAVIOR TESTS

#### T5.1: Locked Screen Shows Required UI
**Setup:** Free user on locked content  
**Action:** View locked state  
**Expected Result:**
- [ ] Title visible
- [ ] Purpose statement visible ("This is where the structure lives.")
- [ ] What's included bullet list visible
- [ ] Upgrade button visible and clickable
- [ ] No countdown timers present
- [ ] No aggressive overlays
- [ ] No interrupting modals
- [ ] Calm, clear design

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T5.2: Locked Screen No Aggressive Elements
**Setup:** Free user on locked content  
**Action:** View locked state  
**Expected Result:**
- [ ] No countdown timers
- [ ] No urgency language ("Only X left!")
- [ ] No FOMO tactics ("Everyone else upgraded")
- [ ] No emojis (unless provided by CJ)
- [ ] No dark aggressive overlays
- [ ] No interrupting popups
- [ ] Clear, calm design

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T5.3: Locked Screen Button Routes Correctly
**Setup:** Free user on locked content  
**Action:** Click upgrade button  
**Expected Result:**
- [ ] Routes to upgrade/pricing page
- [ ] Shows pricing information
- [ ] Shows what's included
- [ ] Checkout button present (even if not wired)
- [ ] Can go back to content

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### UPGRADE FLOW TESTS

#### T6.1: Free User Can Initiate Upgrade
**Setup:** Logged in as free user  
**Action:** Click any upgrade button  
**Expected Result:**
- [ ] Routes to upgrade screen
- [ ] Shows membership tier (App Member)
- [ ] Shows price: $19/month (placeholder if not finalized)
- [ ] Shows what's included
- [ ] Upgrade button present

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T6.2: Upgrade Flow Explains Benefits
**Setup:** On upgrade screen  
**Action:** View benefits/features  
**Expected Result:**
- [ ] Shows full features list
- [ ] Compares free vs paid
- [ ] Clear on what unlocks
- [ ] No hidden costs shown
- [ ] Transparent pricing

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T6.3: Upgrade Button Routes to Checkout
**Setup:** On upgrade screen  
**Action:** Click checkout button  
**Expected Result:**
- [ ] Routes to payment processor (or placeholder)
- [ ] Checkout flow starts
- [ ] Or shows "Not yet connected" if not wired
- [ ] Can proceed (test mode)

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T6.4: Access Restored Immediately After Upgrade
**Setup:** Complete test upgrade  
**Action:** Return to app after successful payment  
**Expected Result:**
- [ ] User access level changed to 'paid'
- [ ] All locked content now accessible
- [ ] Locked overlays gone
- [ ] Full features available
- [ ] No manual refresh needed

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### BACKEND ENFORCEMENT TESTS

#### T7.1: Direct API Call - Free User Blocked
**Setup:** Free user with API token  
**Action:** Call API endpoint for paid content  
**Expected Result:**
- [ ] Returns 403 Forbidden
- [ ] Error message: "Insufficient access level"
- [ ] No content data in response
- [ ] Backend enforces (not frontend)

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T7.2: Frontend Bypass Attempt - Blocked
**Setup:** Free user in browser  
**Action:** Try to access locked content via frontend bypass  
**Expected Result:**
- [ ] Backend still rejects access
- [ ] 403 error returned
- [ ] Frontend protection + backend enforcement
- [ ] No way to bypass both

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T7.3: RLS Policies Enforced
**Setup:** Database with RLS enabled  
**Action:** Try to query locked table as free user  
**Expected Result:**
- [ ] RLS policies block query
- [ ] Database level enforcement
- [ ] Cannot read locked data
- [ ] Authorization enforced at DB

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

### ADMIN OVERRIDE TESTS

#### T8.1: Admin Can Access Everything
**Setup:** Logged in as admin  
**Action:** Navigate to any content  
**Expected Result:**
- [ ] Can access all content
- [ ] All locked content visible
- [ ] All features available
- [ ] No restrictions

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T8.2: Admin Can Toggle User Access
**Setup:** Admin account  
**Action:** Change test user access level  
**Expected Result:**
- [ ] Can set user to free/paid/admin
- [ ] Changes reflected immediately
- [ ] User sees updated access
- [ ] Admin controls work

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

#### T8.3: Admin Status Not Shown to Users
**Setup:** Admin logged in  
**Action:** View user profile/settings  
**Expected Result:**
- [ ] Admin status not displayed
- [ ] Admin features hidden from UI
- [ ] Only admin dashboard shows admin status
- [ ] Regular users never see admin features

**Actual Result:** _______________  
**Pass:** ☐ Fail

---

## 📊 SUMMARY

### Total Tests: 42
### Passed: __/__
### Failed: __/__
### Blocked: __/__

**Pass Rate:** ___%

### Critical Failures (if any):
_______________

### Notes:
_______________

---

## ✅ SIGN-OFF

**Tested By:** _______________  
**Date:** _______________  
**Status:** ☐ PASS ☐ FAIL  

**Approval:** _______________  
**Date:** _______________  

---

**All tests passed = Card complete and ready for merge to main**
