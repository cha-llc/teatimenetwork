/**
 * ACCESS CONTROL - TEA TIME NETWORK
 * 
 * Core access logic for membership tiers.
 * This is not payment processor wiring yet.
 * This is the access logic + app behavior that payment will trigger.
 * 
 * Principles:
 * - Clear (always know what's locked)
 * - Calm (no aggressive paywalls)
 * - Non-pushy (upgrade option visible, not intrusive)
 * - Enforced everywhere (backend + frontend)
 */

// ============================================================================
// ACCESS LEVEL TYPES
// ============================================================================

export type AccessLevel = 'free' | 'paid' | 'admin';
export type ContentRequirement = 'free' | 'paid' | 'admin';

export interface AccessUser {
  id: string;
  accessLevel: AccessLevel;
  email: string;
  createdAt: Date;
  upgradedAt?: Date;
}

export interface ContentAccess {
  contentId: string;
  contentType: 'replay' | 'note' | 'challenge' | 'tool' | 'archive';
  requiresPayment: ContentRequirement;
  isFreeSample?: boolean; // For replays and notes
}

// ============================================================================
// ACCESS RULES BY CONTENT TYPE
// ============================================================================

export const ACCESS_RULES = {
  /**
   * REPLAYS (Video Episodes)
   * 
   * Free: 1-3 sample episodes per show (flagged as "free sample")
   * Paid: All full episodes
   */
  replays: {
    free: {
      maxSamplesPerShow: 3,
      behavior: 'show_with_badge' as const,
      label: 'Free Sample',
    },
    paid: {
      maxSamplesPerShow: Infinity,
      behavior: 'show_all' as const,
      label: null,
    },
  },

  /**
   * TEA TIME NOTES
   * 
   * Free: First 15% visible (preview)
   * Paid: Full Notes
   */
  notes: {
    free: {
      previewPercentage: 15,
      behavior: 'preview' as const,
      label: 'Preview',
    },
    paid: {
      previewPercentage: 100,
      behavior: 'full' as const,
      label: null,
    },
  },

  /**
   * CHALLENGES & PROMPTS
   * 
   * Free: Title + Step 1 only
   * Paid: Full steps + completion tracking
   */
  challenges: {
    free: {
      maxStepsVisible: 1,
      maxPromptsVisible: 1,
      behavior: 'preview' as const,
      label: 'Step 1 Preview',
    },
    paid: {
      maxStepsVisible: Infinity,
      maxPromptsVisible: Infinity,
      behavior: 'full' as const,
      label: null,
    },
  },

  /**
   * TOOLS & FRAMEWORK LIBRARY
   * 
   * Free: Locked view (title, purpose, what's included, upgrade button)
   * Paid: Full access
   */
  tools: {
    free: {
      behavior: 'locked_preview' as const,
      showMetadata: true,
      allowInteraction: false,
    },
    paid: {
      behavior: 'full_access' as const,
      showMetadata: true,
      allowInteraction: true,
    },
  },

  /**
   * ARCHIVES
   * 
   * Free: No access
   * Paid: Full access
   */
  archives: {
    free: {
      behavior: 'locked' as const,
      allowAccess: false,
    },
    paid: {
      behavior: 'full_access' as const,
      allowAccess: true,
    },
  },
} as const;

// ============================================================================
// MEMBERSHIP TIERS
// ============================================================================

export const MEMBERSHIP_TIERS = {
  free: {
    level: 'free' as const,
    name: 'Free',
    cost: 0,
    currency: 'USD',
    billing_cycle: null,
    features: [
      'Limited replay access (samples)',
      'Tea Time Notes previews',
      'Challenge previews (Step 1 only)',
      'Workbook previews',
      'Framework library (locked)',
    ],
  },
  paid: {
    level: 'paid' as const,
    name: 'App Member',
    cost: 19, // TBD by CJ
    currency: 'USD',
    billing_cycle: 'monthly' as const,
    features: [
      'Full replay access (all shows)',
      'Full Tea Time Notes',
      'Full Challenges & prompts',
      'Full execution tools',
      'Progress tracking',
      'All future features',
    ],
  },
  admin: {
    level: 'admin' as const,
    name: 'Admin/Dev',
    cost: 0,
    currency: 'USD',
    billing_cycle: null,
    features: [
      'All features unlocked',
      'Access to admin dashboard',
      'Testing overrides',
      'Development access',
    ],
  },
} as const;

// ============================================================================
// ACCESS CHECK FUNCTIONS
// ============================================================================

/**
 * Check if user can access content
 * 
 * Returns:
 * - canAccess: boolean
 * - reason: string (for locked state UI)
 * - contentToShow: 'full' | 'preview' | 'locked'
 */
export function checkContentAccess(
  user: AccessUser | null,
  content: ContentAccess
): {
  canAccess: boolean;
  isLocked: boolean;
  reason: string;
  contentToShow: 'full' | 'preview' | 'locked';
} {
  // Not logged in
  if (!user) {
    return {
      canAccess: false,
      isLocked: true,
      reason: 'sign_in_required',
      contentToShow: 'locked',
    };
  }

  // Admin always has access
  if (user.accessLevel === 'admin') {
    return {
      canAccess: true,
      isLocked: false,
      reason: 'admin_override',
      contentToShow: 'full',
    };
  }

  // Check content requirement
  if (content.requiresPayment === 'paid' && user.accessLevel === 'free') {
    return {
      canAccess: false,
      isLocked: true,
      reason: 'upgrade_required',
      contentToShow: content.isFreeSample ? 'preview' : 'locked',
    };
  }

  // User has access
  return {
    canAccess: true,
    isLocked: false,
    reason: 'access_granted',
    contentToShow: 'full',
  };
}

/**
 * Check if user can access replay content
 */
export function canAccessReplay(
  user: AccessUser | null,
  isFreeSample: boolean
): boolean {
  if (!user) return false;
  if (user.accessLevel === 'admin') return true;
  if (user.accessLevel === 'paid') return true;
  if (user.accessLevel === 'free' && isFreeSample) return true;
  return false;
}

/**
 * Check if user can access note (returns preview or full)
 */
export function getNoteAccessBehavior(user: AccessUser | null): {
  canAccess: boolean;
  behavior: 'full' | 'preview' | 'locked';
  previewPercentage?: number;
} {
  if (!user) {
    return { canAccess: false, behavior: 'locked' };
  }

  if (user.accessLevel === 'admin' || user.accessLevel === 'paid') {
    return { canAccess: true, behavior: 'full' };
  }

  // Free user gets preview
  return {
    canAccess: true,
    behavior: 'preview',
    previewPercentage: ACCESS_RULES.notes.free.previewPercentage,
  };
}

/**
 * Check if user can access challenge (returns full steps or preview)
 */
export function getChallengeAccessBehavior(user: AccessUser | null): {
  canAccess: boolean;
  behavior: 'full' | 'preview' | 'locked';
  maxStepsVisible?: number;
  maxPromptsVisible?: number;
} {
  if (!user) {
    return { canAccess: false, behavior: 'locked' };
  }

  if (user.accessLevel === 'admin' || user.accessLevel === 'paid') {
    return {
      canAccess: true,
      behavior: 'full',
      maxStepsVisible: Infinity,
      maxPromptsVisible: Infinity,
    };
  }

  // Free user gets step 1 only
  return {
    canAccess: true,
    behavior: 'preview',
    maxStepsVisible: ACCESS_RULES.challenges.free.maxStepsVisible,
    maxPromptsVisible: ACCESS_RULES.challenges.free.maxPromptsVisible,
  };
}

/**
 * Check if user can access tool
 */
export function getToolAccessBehavior(user: AccessUser | null): {
  canAccess: boolean;
  behavior: 'full_access' | 'locked_preview' | 'locked';
  allowInteraction: boolean;
} {
  if (!user) {
    return { canAccess: false, behavior: 'locked', allowInteraction: false };
  }

  if (user.accessLevel === 'admin' || user.accessLevel === 'paid') {
    return {
      canAccess: true,
      behavior: 'full_access',
      allowInteraction: true,
    };
  }

  // Free user sees locked preview
  return {
    canAccess: true,
    behavior: 'locked_preview',
    allowInteraction: false,
  };
}

/**
 * Check if user can access archives
 */
export function canAccessArchives(user: AccessUser | null): boolean {
  if (!user) return false;
  if (user.accessLevel === 'admin') return true;
  if (user.accessLevel === 'paid') return true;
  return false;
}

// ============================================================================
// CONTENT FILTERING
// ============================================================================

/**
 * Filter content based on user access level
 * 
 * Returns only content the user can access.
 */
export function filterAccessibleContent<T extends { requiresPayment: ContentRequirement; isFreeSample?: boolean }>(
  content: T[],
  user: AccessUser | null
): T[] {
  if (!user) {
    // Anonymous users: no content
    return [];
  }

  if (user.accessLevel === 'admin') {
    // Admin: all content
    return content;
  }

  // Filter based on access level
  return content.filter((item) => {
    if (item.requiresPayment === 'paid') {
      // If paid required, only show if user is paid or it's a free sample
      return user.accessLevel === 'paid' || item.isFreeSample === true;
    }
    // Free content always visible
    return true;
  });
}

/**
 * Slice content for preview (first N% or N steps)
 * 
 * Used for notes (preview %), challenges (steps)
 */
export function sliceContentForPreview(
  content: string,
  previewPercentage: number
): string {
  const charCount = Math.ceil(content.length * (previewPercentage / 100));
  return content.substring(0, charCount);
}

export function sliceStepsForPreview<T extends { stepNumber: number }>(
  steps: T[],
  maxSteps: number
): T[] {
  return steps.filter((step) => step.stepNumber <= maxSteps);
}

// ============================================================================
// LOCKED CONTENT UI
// ============================================================================

export interface LockedContentUIProps {
  contentType: ContentRequirement;
  title: string;
  description?: string;
  features?: string[];
  purposeStatement?: string;
  upgradeCTAText?: string;
}

export const LOCKED_CONTENT_UI: Record<ContentRequirement, LockedContentUIProps> = {
  free: {
    contentType: 'free',
    title: 'Free Sample',
    purposeStatement: 'This is where the structure lives.',
    upgradeCTAText: 'Upgrade to Access',
  },
  paid: {
    contentType: 'paid',
    title: 'App Member Feature',
    purposeStatement: 'This is where the structure lives.',
    upgradeCTAText: 'Unlock Full Access',
  },
  admin: {
    contentType: 'admin',
    title: 'Admin Only',
    upgradeCTAText: 'Admin Access Required',
  },
};

/**
 * Generate locked state UI props
 * 
 * Used by LockedContent component
 */
export function getLockedUIProps(
  contentType: string,
  userAccessLevel: AccessLevel
): LockedContentUIProps {
  const purposeStatement = 'This is where the structure lives.';

  if (userAccessLevel === 'free') {
    return {
      contentType: 'paid',
      title: `Unlock ${contentType}`,
      purposeStatement,
      features: [
        'Full access to all content',
        'Unlimited video replays',
        'Complete framework access',
        'Progress tracking',
        'All future features',
      ],
      upgradeCTAText: 'Upgrade to App Member',
    };
  }

  // User is paid or admin
  return {
    contentType: 'free',
    title: `${contentType} Available`,
    purposeStatement,
    upgradeCTAText: 'Access Now',
  };
}

// ============================================================================
// VALIDATION & CONSISTENCY CHECKS
// ============================================================================

/**
 * Validate that user access matches business rules
 * 
 * Used in tests and backend validation
 */
export function validateUserAccess(user: AccessUser): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!user.id) errors.push('User ID is required');
  if (!['free', 'paid', 'admin'].includes(user.accessLevel)) {
    errors.push(`Invalid access level: ${user.accessLevel}`);
  }

  // Free users should not have upgradedAt
  if (user.accessLevel === 'free' && user.upgradedAt) {
    errors.push('Free users should not have upgradedAt timestamp');
  }

  // Paid and admin should have creation date
  if (!user.createdAt) {
    errors.push('User creation date is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that content access rules are consistent
 * 
 * Used in tests
 */
export function validateContentAccess(content: ContentAccess): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content.contentId) errors.push('Content ID is required');
  if (!['replay', 'note', 'challenge', 'tool', 'archive'].includes(content.contentType)) {
    errors.push(`Invalid content type: ${content.contentType}`);
  }
  if (!['free', 'paid', 'admin'].includes(content.requiresPayment)) {
    errors.push(`Invalid requirement level: ${content.requiresPayment}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// UPGRADE/DOWNGRADE HANDLERS
// ============================================================================

/**
 * When user upgrades from free to paid
 * (Called by payment processor webhook)
 */
export async function handleUpgradeToUserPaid(
  userId: string,
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Update user access level in database
    // UPDATE users SET accessLevel = 'paid', upgradedAt = NOW() WHERE id = userId

    // TODO: Log upgrade event
    // INSERT INTO access_events (userId, event, details) VALUES (userId, 'upgrade', ...)

    // TODO: Clear any cached access data for this user
    // invalidateUserAccessCache(userId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * When paid subscription ends/cancels
 * (Called by payment processor webhook)
 */
export async function handleDowngradeToFree(
  userId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Update user access level in database
    // UPDATE users SET accessLevel = 'free' WHERE id = userId

    // TODO: Log downgrade event
    // INSERT INTO access_events (userId, event, details) VALUES (userId, 'downgrade', ...)

    // TODO: Clear cached data
    // invalidateUserAccessCache(userId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  checkContentAccess,
  canAccessReplay,
  getNoteAccessBehavior,
  getChallengeAccessBehavior,
  getToolAccessBehavior,
  canAccessArchives,
  filterAccessibleContent,
  sliceContentForPreview,
  sliceStepsForPreview,
  getLockedUIProps,
  validateUserAccess,
  validateContentAccess,
  handleUpgradeToUserPaid,
  handleDowngradeToFree,
  ACCESS_RULES,
  MEMBERSHIP_TIERS,
};
