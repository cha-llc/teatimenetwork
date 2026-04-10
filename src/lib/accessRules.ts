/**
 * ACCESS RULES & CONTENT DECODER
 * 
 * Defines what content is accessible at each subscription level
 * Non-negotiable specification per Auth & Access Control card
 */

export type SubscriptionStatus = 'free' | 'active' | 'expired';
export type UserRole = 'user' | 'admin';

export interface AccessRule {
  requiredSubscription?: SubscriptionStatus;
  requiredRole?: UserRole;
  readOnly?: boolean; // For expired status
  message?: string;
}

/**
 * CONTENT ACCESS RULES
 * 
 * Free Users Can Access:
 * - Limited replays (flagged episodes only)
 * - App overview
 * - CTA education
 * - App structure preview
 * 
 * Active Subscribers Can Access:
 * - All replays
 * - Tea Time Notes
 * - Challenges
 * - Workbook links
 * - Full execution tools
 * 
 * Expired Subscribers:
 * - Read-only access
 * - Locked screens with clear messaging
 * - No loss of historical progress
 */

export const CONTENT_ACCESS_RULES: Record<string, AccessRule> = {
  // Public routes (no auth required)
  '/': { requiredSubscription: undefined },
  '/privacy': { requiredSubscription: undefined },
  '/terms': { requiredSubscription: undefined },
  '/pricing': { requiredSubscription: undefined },

  // Auth required but free tier allowed
  '/dashboard': { requiredSubscription: 'free' },
  '/profile': { requiredSubscription: 'free' },
  '/habits': { requiredSubscription: 'free' },

  // Subscription gated (active only)
  '/analytics': { requiredSubscription: 'active' },
  '/insights': { requiredSubscription: 'active' },
  '/challenges': { requiredSubscription: 'active' },
  '/notes': { requiredSubscription: 'active' },
  '/workbooks': { requiredSubscription: 'active' },
  '/neuro-feedback': { requiredSubscription: 'active' },
  '/neuro-history': { requiredSubscription: 'active' },
  '/momentum-realm': { requiredSubscription: 'active' },
  '/accountability': { requiredSubscription: 'active' },
  '/community': { requiredSubscription: 'active' },
  '/templates': { requiredSubscription: 'active' },
  '/achievements': { requiredSubscription: 'active' },
  '/teams': { requiredSubscription: 'active' },
  '/categories': { requiredSubscription: 'active' },
  '/incubator': { requiredSubscription: 'active' },
  '/iot': { requiredSubscription: 'active' },
  '/smart-ecosystem': { requiredSubscription: 'active' },

  // Admin only
  '/admin': { requiredRole: 'admin' },
  '/admin/users': { requiredRole: 'admin' },
  '/admin/analytics': { requiredRole: 'admin' },
  '/admin/logs': { requiredRole: 'admin' },
};

/**
 * Feature-level access checker
 * Use in components to conditionally render features
 */
export const canAccessFeature = (
  featureName: string,
  subscription: SubscriptionStatus,
  role: UserRole = 'user'
): boolean => {
  const rule = CONTENT_ACCESS_RULES[`/${featureName}`];
  if (!rule) return true; // No rule = accessible

  if (rule.requiredRole && role !== rule.requiredRole) {
    return false;
  }

  if (rule.requiredSubscription === 'active' && subscription !== 'active') {
    return false;
  }

  return true;
};

/**
 * Access validation with message
 */
export interface AccessValidation {
  allowed: boolean;
  reason?: string;
  readOnly?: boolean;
}

export const validateAccess = (
  subscription: SubscriptionStatus,
  role: UserRole = 'user',
  requiredSubscription?: SubscriptionStatus,
  requiredRole?: UserRole
): AccessValidation => {
  // Role check
  if (requiredRole && role !== requiredRole) {
    return {
      allowed: false,
      reason: 'Admin access required'
    };
  }

  // Subscription check
  if (requiredSubscription === 'active') {
    if (subscription === 'active') {
      return { allowed: true };
    } else if (subscription === 'expired') {
      return {
        allowed: true,
        readOnly: true,
        reason: 'Read-only access. Subscription expired.'
      };
    } else {
      return {
        allowed: false,
        reason: 'Active subscription required'
      };
    }
  }

  return { allowed: true };
};

/**
 * Get appropriate message for access denial
 */
export const getAccessDenialMessage = (
  currentSubscription: SubscriptionStatus,
  requiredSubscription?: SubscriptionStatus
): string => {
  if (currentSubscription === 'free' && requiredSubscription === 'active') {
    return 'This is where the work continues. Upgrade to access this feature.';
  }

  if (currentSubscription === 'expired' && requiredSubscription === 'active') {
    return 'Your subscription has ended. Renew to regain access.';
  }

  return 'This content is not available to your account.';
};

/**
 * FREE TIER LIMITED CONTENT
 * These replays/episodes are available to free users
 */
export const FREE_TIER_EPISODES = {
  flaggedReplays: ['intro', 'getting-started', 'fundamentals'],
  educationalContent: ['how-it-works', 'features-overview', 'getting-started'],
};

/**
 * ACTIVE SUBSCRIPTION FEATURES
 */
export const ACTIVE_SUBSCRIPTION_FEATURES = [
  'all-replays',
  'tea-time-notes',
  'challenges',
  'workbooks',
  'full-tools',
  'priority-support',
  'team-features',
  'advanced-analytics',
];
