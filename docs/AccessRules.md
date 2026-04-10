# Access Rules - Tea Time Network

**Date:** April 10, 2026  
**Status:** Production Ready  
**Version:** 1.0  

---

## 🎯 CORE PRINCIPLE

This app is **structure, not vibes.**

Access must be:
- ✅ Clear (user always knows what's locked and why)
- ✅ Calm (no aggressive paywalls, no countdown timers)
- ✅ Non-pushy (upgrade option visible, not intrusive)
- ✅ Enforced everywhere consistently (backend + frontend)

---

## 👥 MEMBERSHIP TIERS (LOCKED - NO CHANGES WITHOUT DECISION)

### Tier 1: Free (Default)
**Access Level:** `free`  
**Cost:** $0  
**Auto-assigned to:** All new users

**Includes:**
- Limited replay access (1-3 sample episodes per show)
- Tea Time Notes previews (first 15% visible)
- Challenge previews (title + Step 1 only)
- Workbook previews only
- Framework library (locked view with description)
- No archives access
- No progress/streak tracking

**Does NOT include:**
- Full replays
- Full notes
- Full challenges
- Execution tools
- History/progress tracking

### Tier 2: App Member (Paid)
**Access Level:** `paid`  
**Cost:** $19/month (exact price TBD by CJ)  
**How to get:** In-app purchase or upgrade button

**Includes:**
- Full replay access (all shows, all episodes)
- Full Tea Time Notes
- Full Challenges with structured prompts
- Full execution tools access
- Full framework library
- Progress tracking & streak behavior (if implemented later)
- Save/resume functionality
- All future features (auto-included)

**Does NOT include:**
- Patreon content (external, separate tier)
- Admin features

### Tier 3: Patreon Bridge (External)
**Access Level:** `patreon`  
**Cost:** Patreon subscription (varies)  
**How to get:** Subscribe on Patreon separately

**App Behavior:**
- Include "Go deeper" bridge placements
- Never confuse Patreon with app membership
- Patreon is access, not structure
- The app is structure, Patreon deepens it

**Important:** Patreon subscription does NOT automatically unlock app Member features. They are separate.

### Tier 4: Admin/Dev (Testing Only)
**Access Level:** `admin`  
**Cost:** Free (development only)  
**How to get:** Database edit or dev override

**Includes:**
- All features unlocked
- Access to admin dashboard
- Test account overrides
- Never shown in production

---

## 🔐 ACCESS RULES BY CONTENT TYPE

### Rule 1: Replays (Video Episodes)

**Free User:**
- Can view: 1-3 sample episodes per show (maximum)
- Which ones: First episode of each show (or manually selected)
- Labeling: "Free Sample" badge on replay
- Player: Full player with play/pause/timeline
- Behavior: Can watch full episode once, no repeat views without upgrade
- Duration: Limited to 5 minutes (soft cap) — optional, depends on CJ

**Paid User:**
- Can view: All episodes from all shows
- Duration: Unlimited
- Behavior: Full resume-where-you-left-off
- Tracking: Watch history, completion percentage
- Behavior: Can rewatch unlimited times

**Backend Check:**
```typescript
if (user.accessLevel === 'free') {
  // Show only 1-3 sample episodes
  // Add "Free Sample" badge
  // Limit player features (optional)
} else if (user.accessLevel === 'paid') {
  // Show all episodes
  // Full player features
  // Enable tracking
}
```

**UI Behavior:**
```
Free: Episode list shows 1-3 episodes + locked badge
      Other episodes appear with lock icon
      
Paid: All episodes visible
      No lock badges
```

### Rule 2: Tea Time Notes

**Free User:**
- Can view: First 15% of each note
- Rendering: Show preview text + "Continue reading" button
- Behavior: Click button → goes to upgrade screen
- Styling: Dimmed/faded text after preview point

**Paid User:**
- Can view: 100% of all notes
- Rendering: Full note visible
- Behavior: No upgrade prompts

**Backend Check:**
```typescript
if (user.accessLevel === 'free') {
  // Return first 15% of note content
  // Flag as preview: true
} else if (user.accessLevel === 'paid') {
  // Return full note content
  // Flag as preview: false
}
```

**UI Behavior:**
```
Free: "This note preview shows the first 15%. Unlock to read the full note."
      [Upgrade button]
      
Paid: Full note visible
```

### Rule 3: Challenges & Prompts

**Free User:**
- Can view: Challenge title + Step 1 only
- Rendering: Show first step in full, rest are collapsed with lock icons
- Behavior: Click step → goes to upgrade screen
- Prompts: First reflection prompt visible, others hidden

**Paid User:**
- Can view: All steps + all prompts
- Behavior: Full challenge workflow
- Tracking: Can mark steps complete (simple boolean)

**Backend Check:**
```typescript
if (user.accessLevel === 'free') {
  // Return only step[0]
  // Return only prompts[0]
  // Flag others as locked
} else if (user.accessLevel === 'paid') {
  // Return all steps
  // Return all prompts
  // Enable completion tracking
}
```

**UI Behavior:**
```
Free: Step 1 visible + button to upgrade
      Steps 2, 3, 4 shown as locked tiles
      Prompts: Only first visible
      
Paid: All steps visible and interactive
      All prompts visible
      Checkboxes to mark complete
```

### Rule 4: Tools & Framework Library

**Free User:**
- Can view: Locked view with:
  - Tool title
  - Purpose statement ("This is where the structure lives.")
  - What's included (bullet list)
  - One calm upgrade button
- Behavior: Click tool → locked screen
- Features: Preview only, no interaction

**Paid User:**
- Can view: Full tool access
- Behavior: Use tool immediately
- Features: All tool features available

**Backend Check:**
```typescript
if (user.accessLevel === 'free') {
  // Return tool metadata only (locked view)
  // Tool.isLocked = true
} else if (user.accessLevel === 'paid') {
  // Return full tool with features
  // Tool.isLocked = false
}
```

**UI Behavior:**
```
Free: Tool card shows:
      - Title
      - "This is where the structure lives."
      - List of features (read-only)
      - [Upgrade button]
      - No interaction with tool
      
Paid: Full tool interface
      All features interactive
      No upgrade prompts
```

### Rule 5: Archives (if implemented)

**Free User:**
- Can view: None
- Archives are paid-only feature

**Paid User:**
- Can view: Full archives access
- Behavior: Search, filter, access all historical content

---

## 🧱 UI PAYWALL BEHAVIOR RULES

### ✅ Locked Content MUST Show:

1. **Title** — What is this?
2. **Purpose Statement** — Why does this exist?
   - Standard: "This is where the structure lives."
   - Custom: Provided by CJ
3. **What's Included** — Bullet list of benefits
4. **One Calm Upgrade Button** — Clear, non-aggressive

### ❌ Locked Content MUST NOT Have:

- ❌ Countdown timers (no urgency)
- ❌ Aggressive overlays (no dark overlays blocking content)
- ❌ Interrupting modals (no pop-ups on every click)
- ❌ Emojis (unless CJ explicitly provides them)
- ❌ Scarcity language ("Only X spots left")
- ❌ FOMO tactics ("Everyone else upgraded")
- ❌ Aggressive colors (use calm palette)

### Locked Content Examples

**Locked Replay:**
```
┌─────────────────────────────────────┐
│ 🔒 Full Episode Access              │
│                                     │
│ Tea Time with CJ - Episode 5        │
│ "Building Boundaries"               │
│                                     │
│ This is where the structure lives.  │
│                                     │
│ Your membership includes:           │
│ • Full episodes from all shows      │
│ • Resume where you left off         │
│ • Watch history                     │
│ • Access to all challenges          │
│                                     │
│ [Unlock Full Access]                │
└─────────────────────────────────────┘
```

**Locked Challenge:**
```
┌─────────────────────────────────────┐
│ 🔒 Full Challenge Access            │
│                                     │
│ 14-Day Boundary Challenge           │
│                                     │
│ ✓ Step 1: Identify (visible)       │
│ 🔒 Step 2: Practice (locked)        │
│ 🔒 Step 3: Reflect (locked)         │
│ 🔒 Step 4: Integrate (locked)       │
│                                     │
│ This is where the structure lives.  │
│                                     │
│ [Unlock Full Access]                │
└─────────────────────────────────────┘
```

**Locked Tool:**
```
┌─────────────────────────────────────┐
│ 🔒 Framework Library                │
│                                     │
│ Boundary Framework                  │
│                                     │
│ This is where the structure lives.  │
│                                     │
│ Includes:                           │
│ • Interactive worksheet             │
│ • Step-by-step guide                │
│ • Reflection prompts                │
│ • Downloadable template             │
│                                     │
│ [Upgrade to Access]                 │
└─────────────────────────────────────┘
```

---

## 🔌 ENTITLEMENT CHECK REQUIREMENTS

### Every Protected Screen Must:

1. **Check Authentication**
   ```typescript
   if (!user) {
     // Show sign-in prompt
     return <SignInRequired />;
   }
   ```

2. **Check Access Level**
   ```typescript
   if (user.accessLevel === 'free' && content.requiresPaid) {
     // Show locked state
     return <ContentLocked content={content} />;
   }
   ```

3. **Return Appropriate Content**
   ```typescript
   if (user.accessLevel === 'paid') {
     // Return full content
     return <FullContent />;
   } else {
     // Return preview or locked state
     return <PreviewOrLocked />;
   }
   ```

### Entitlement Check Pattern

```typescript
// At service level (backend)
export async function getEpisodeForUser(
  episodeId: string,
  userId: string
): Promise<Episode | EpisodeLocked> {
  const user = await getUser(userId);
  const episode = await getEpisode(episodeId);
  
  // Check entitlement
  if (user.accessLevel === 'free' && !isFreeSample(episode)) {
    // Return locked version
    return {
      id: episode.id,
      title: episode.title,
      isLocked: true,
      lockedReason: 'upgrade_required'
    };
  }
  
  // User has access, return full episode
  return episode;
}

// At component level (frontend)
function EpisodeDetail({ episodeId }) {
  const episode = useEpisode(episodeId);
  const { user } = useAuth();
  
  // Check access before rendering
  const { canAccess, reason } = checkAccess(episode, user);
  
  if (!canAccess) {
    return <ContentLocked episode={episode} reason={reason} />;
  }
  
  return <EpisodePlayer episode={episode} />;
}
```

### Access Check Locations

**Must check access:**
- [ ] Replay/player screens
- [ ] Tea Time Notes detail page
- [ ] Challenge detail page
- [ ] Tool/framework pages
- [ ] Archive access
- [ ] Any protected content fetch

**Never rely on:** Frontend hiding alone. Backend must enforce.

---

## 🧪 TEST MATRIX REQUIREMENTS

### Test Accounts to Create

| Account | Email | Access | Purpose |
|---------|-------|--------|---------|
| Free (Logged Out) | N/A | None | Test anonymous experience |
| Free (Logged In) | test.free@teatimenetwork.com | free | Test free tier limits |
| Paid Member | test.paid@teatimenetwork.com | paid | Test paid tier access |
| Admin/Dev | admin@teatimenetwork.com | admin | Test override/debugging |

### Test Scenarios for Each Account

#### Replay Access
- [ ] Free (out): Cannot view any episode
- [ ] Free (in): Can view 1-3 samples per show, others locked
- [ ] Paid: Can view all episodes
- [ ] Admin: Can view all episodes
- [ ] Free → Paid: Unlock happens immediately on upgrade

#### Tea Time Notes
- [ ] Free (out): Cannot view any notes
- [ ] Free (in): Can view first 15%, rest locked
- [ ] Paid: Can view full notes
- [ ] Admin: Can view full notes
- [ ] Free → Paid: Full text visible immediately on upgrade

#### Challenges
- [ ] Free (out): Cannot view any challenges
- [ ] Free (in): Can see Step 1 only, others locked
- [ ] Paid: Can see all steps + prompts
- [ ] Admin: Can see all steps + prompts
- [ ] Free → Paid: All steps unlocked immediately on upgrade

#### Tools/Frameworks
- [ ] Free (out): Cannot access
- [ ] Free (in): Can see locked preview (title, purpose, list, button)
- [ ] Paid: Full access to all tools
- [ ] Admin: Full access
- [ ] Free → Paid: Full access immediately

#### Locked Screen Behavior
- [ ] All locked screens show: Title, purpose, what's included, upgrade button
- [ ] No countdown timers
- [ ] No aggressive overlays
- [ ] No interrupting modals
- [ ] Button click routes to upgrade flow

#### Upgrade Flow Routing
- [ ] Free user clicks upgrade button → routes to upgrade screen
- [ ] Upgrade screen shows price (placeholder if not finalized)
- [ ] Upgrade screen explains what's included
- [ ] Upgrade button available (even if checkout not wired)
- [ ] After upgrade, access is restored immediately

#### Access Enforcement
- [ ] Try to fetch locked content directly → 403 error
- [ ] Try to bypass frontend → backend still denies
- [ ] Try to call locked endpoints → 403 error
- [ ] RLS policies prevent data access

#### Admin Override
- [ ] Admin account can access everything
- [ ] Can view all tiers of content
- [ ] Can toggle user access levels for testing
- [ ] Admin status never shown to regular users

---

## 📋 ACCESS LEVEL DEFINITIONS

### Field: `user.accessLevel`

**Values:**
```typescript
type AccessLevel = 'free' | 'paid' | 'admin';
```

**Set by:**
- `'free'`: Default for all new users
- `'paid'`: After successful payment/upgrade
- `'admin'`: Database edit (dev/testing only)

**Never changed except:**
- Payment processor (payment success → 'paid')
- Admin override (testing)
- User never self-assigns

### Field: `content.requiresPayment`

**Values:**
```typescript
type ContentRequirement = 'free' | 'paid' | 'admin';
```

**Free content:**
- Sample replays
- Preview notes
- Preview challenges
- Locked tool views

**Paid content:**
- Full replays
- Full notes
- Full challenges
- Full tools
- Tracking features

**Admin content:**
- Admin dashboard
- User management
- Analytics (if implemented)

---

## 🔗 RELATED SYSTEMS

### Payment System (Not in this card)
- Stripe integration
- Payment processing
- Webhook handling
- Access level update (triggered by payment success)

### Authentication System (Separate card)
- User registration
- Login/logout
- Session management
- Email verification

### Subscription Management (Future)
- Renewal tracking
- Cancellation flow
- Pause subscription
- Access level updates on renewal/cancellation

---

## 🎯 CONSISTENCY CHECKLIST

### Everywhere Must Be Same
- [ ] Locked UI appearance (same across app)
- [ ] Upgrade button behavior (same routing)
- [ ] Access checks (same logic)
- [ ] Error messages (same tone)
- [ ] Preview percentages (consistent: 15% notes, Step 1 challenges)
- [ ] Sample count (consistent: 1-3 replays per show)

### Every Screen Must Check
- [ ] Is user logged in? (authentication check)
- [ ] Does user have access? (entitlement check)
- [ ] Show locked or full? (content decision)

### No Edge Cases
- [ ] Free user cannot bypass frontend hiding
- [ ] Paid user cannot lose access without reason
- [ ] Admin override works everywhere
- [ ] Access immediately restored on upgrade
- [ ] Access immediately revoked on downgrade

---

## ✨ FINAL STATUS

**Status:** ✅ **PRODUCTION READY**

**Complete:**
- ✅ 3 membership tiers defined
- ✅ 5 content types ruled
- ✅ UI paywall behavior specified
- ✅ Entitlement check pattern defined
- ✅ Test matrix created
- ✅ Consistency checklist provided

**Ready for:**
- ✅ Frontend implementation
- ✅ Backend enforcement
- ✅ Testing with test matrix
- ✅ Payment integration (later)
- ✅ Production deployment

---

**Document Version:** 1.0  
**Last Updated:** April 10, 2026  
**Status:** Production Ready  
**Approval:** ✅ Ready for Implementation  

🔐 **Tea Time Network - Access Rules & Membership Structure** 🔐
