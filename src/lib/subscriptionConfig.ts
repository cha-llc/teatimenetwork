/**
 * SUBSCRIPTION CONFIGURATION - TEA TIME NETWORK
 * 
 * Defines subscription plans, billing, and lifecycle.
 * Single plan at launch: TTN_APP_MEMBER_MONTHLY
 * Stripe is the payment provider.
 * 
 * This is infrastructure, not marketing.
 */

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'expired' | 'trial';
export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: string; // Internal ID
  stripeProductId: string; // Stripe Product ID
  stripePriceId: string; // Stripe Price ID
  name: string;
  description: string;
  billingCycle: BillingCycle;
  priceInCents: number; // $19.99 = 1999
  currency: string; // 'usd'
  trialDays?: number; // Optional trial
  isAvailable: boolean;
}

export interface Subscription {
  id: string; // Unique subscription ID
  userId: string;
  planId: string;
  stripeSubscriptionId: string; // Stripe subscription ID
  status: SubscriptionStatus;
  startDate: Date;
  renewalDate?: Date; // Next billing date
  trialEndsAt?: Date; // When trial ends (if applicable)
  cancelledAt?: Date; // When user cancelled
  expiresAt?: Date; // When subscription fully expires
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  paymentMethod?: {
    id: string;
    brand: string;
    last4: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  userId: string;
  eventType:
    | 'subscription_created'
    | 'payment_succeeded'
    | 'payment_failed'
    | 'subscription_cancelled'
    | 'subscription_expired'
    | 'subscription_renewed'
    | 'subscription_updated';
  stripeEventId: string;
  data: Record<string, any>;
  processedAt: Date;
  handledAt?: Date;
}

// ============================================================================
// SUBSCRIPTION PLAN CONFIGURATION (LOCKED)
// ============================================================================

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  TTN_APP_MEMBER_MONTHLY: {
    id: 'TTN_APP_MEMBER_MONTHLY',
    stripeProductId: 'prod_ttn_app_member', // TODO: Replace with real Stripe product ID
    stripePriceId: 'price_ttn_monthly_1999', // TODO: Replace with real Stripe price ID
    name: 'App Member',
    description: 'Full access to all Tea Time Network content and tools',
    billingCycle: 'monthly',
    priceInCents: 1999, // $19.99/month
    currency: 'usd',
    trialDays: 0, // No trial in MVP (optional feature)
    isAvailable: true,
  },
};

// ============================================================================
// SUBSCRIPTION STATUS RULES
// ============================================================================

export const SUBSCRIPTION_STATUS_RULES = {
  /**
   * ACTIVE: Subscription is valid and paid
   * - User has access to paid content
   * - Auto-renews on renewal date
   * - Can be cancelled by user
   */
  active: {
    userHasAccess: true,
    canCancel: true,
    canRestore: false,
    description: 'Active subscription - access granted',
  },

  /**
   * TRIAL: User in trial period (if applicable)
   * - User has access to paid content
   * - Auto-converts to paid unless cancelled
   * - Can be cancelled by user
   */
  trial: {
    userHasAccess: true,
    canCancel: true,
    canRestore: false,
    description: 'Trial period - access granted',
  },

  /**
   * PAST_DUE: Payment failed but grace period active
   * - User keeps access during grace period
   * - Do NOT immediately revoke
   * - Grace period is configurable (e.g., 5 days)
   * - Show warning: "Payment failed, please update"
   */
  past_due: {
    userHasAccess: true,
    canCancel: true,
    canRestore: true,
    description: 'Payment failed - grace period active',
    gracePeriodDays: 5,
  },

  /**
   * CANCELLED: User cancelled subscription
   * - User keeps access until renewal date
   * - Show "Ends on [date]" in account
   * - After renewal date expires, reverts to Free
   * - Can restore/resubscribe before expiration
   */
  cancelled: {
    userHasAccess: true,
    canCancel: false,
    canRestore: true,
    description: 'Subscription ends on [renewal_date]',
  },

  /**
   * EXPIRED: Subscription fully ended
   * - User loses access to paid content
   * - Reverts to Free tier
   * - Can resubscribe
   */
  expired: {
    userHasAccess: false,
    canCancel: false,
    canRestore: true,
    description: 'Subscription ended - access revoked',
  },
} as const;

// ============================================================================
// SUBSCRIPTION LIFECYCLE
// ============================================================================

export const SUBSCRIPTION_LIFECYCLE = {
  /**
   * 1. SUBSCRIPTION CREATED
   * 
   * Triggered by: Stripe webhook (customer.subscription.created)
   * Action:
   * - Create subscription record
   * - Set status = 'active' or 'trial'
   * - Update user.accessLevel = 'paid'
   * - Unlock paid content immediately
   * - Log event
   * 
   * Side effects:
   * - Access control updated
   * - Locked content becomes unlocked
   * - UI shows paid features
   */
  subscription_created: {
    description: 'User just subscribed - unlock immediately',
    updateUserAccessLevel: 'paid',
    unlockContent: true,
    showUI: 'subscription_active',
  },

  /**
   * 2. PAYMENT SUCCEEDED
   * 
   * Triggered by: Stripe webhook (invoice.payment_succeeded)
   * Action:
   * - Update subscription.status = 'active'
   * - Set renewalDate to next billing date
   * - Update lastPaymentDate
   * - Clear grace period (if any)
   * - Log event
   * 
   * Side effects:
   * - If was past_due, remove warning
   * - Continue access
   * - Update UI billing info
   */
  payment_succeeded: {
    description: 'Payment successful - keep access active',
    updateUserAccessLevel: 'paid',
    unlockContent: true,
    clearPastDueWarning: true,
    showUI: 'subscription_active',
  },

  /**
   * 3. PAYMENT FAILED
   * 
   * Triggered by: Stripe webhook (invoice.payment_failed)
   * Action:
   * - Update subscription.status = 'past_due'
   * - DO NOT REVOKE ACCESS YET
   * - Set grace period timer (e.g., 5 days)
   * - Show warning: "Payment failed - update method"
   * - Log event
   * 
   * Side effects:
   * - User keeps access during grace period
   * - Show warning banner in account
   * - Send email to update payment
   * - If grace period expires, move to expired
   */
  payment_failed: {
    description: 'Payment failed - grace period active',
    updateUserAccessLevel: 'paid', // Keep access
    unlockContent: true, // Don't revoke yet
    showWarning: true,
    gracePeriodDays: 5,
    showUI: 'payment_failed_warning',
  },

  /**
   * 4. SUBSCRIPTION CANCELLED
   * 
   * Triggered by:
   * - User clicks "Cancel" button in app
   * - OR Stripe webhook (customer.subscription.updated with cancel_at_period_end)
   * 
   * Action:
   * - Update subscription.status = 'cancelled'
   * - Set cancelledAt = now
   * - Set expiresAt = renewalDate
   * - User keeps access until expiresAt
   * - Log event
   * 
   * Side effects:
   * - Show "Ends on [date]" in account
   * - Access continues (don't revoke)
   * - Send confirmation email
   */
  subscription_cancelled: {
    description: 'User cancelled - access until renewal date',
    updateUserAccessLevel: 'paid', // Keep access
    unlockContent: true,
    expiresAt: 'renewal_date',
    showUI: 'subscription_cancelled',
  },

  /**
   * 5. SUBSCRIPTION EXPIRED
   * 
   * Triggered by: 
   * - Timer or batch job checking expiresAt
   * - OR Stripe webhook (customer.subscription.deleted)
   * 
   * Action:
   * - Update subscription.status = 'expired'
   * - Update user.accessLevel = 'free'
   * - Revoke paid content access
   * - Log event
   * 
   * Side effects:
   * - Locked content reappears
   * - UI shows Free tier
   * - User can resubscribe
   */
  subscription_expired: {
    description: 'Subscription expired - revert to Free',
    updateUserAccessLevel: 'free',
    unlockContent: false,
    revokeContent: true,
    showUI: 'subscription_expired',
  },

  /**
   * 6. SUBSCRIPTION RENEWED
   * 
   * Triggered by: Stripe webhook (customer.subscription.updated)
   * Action:
   * - Update renewalDate to new cycle
   * - Keep status = 'active'
   * - Log event
   * 
   * Side effects:
   * - NO UI INTERRUPTION
   * - Silent continuation
   * - Update billing info
   */
  subscription_renewed: {
    description: 'Automatic renewal - silent continuation',
    updateUserAccessLevel: 'paid',
    unlockContent: true,
    showUI: null, // No interruption
  },
};

// ============================================================================
// GRACE PERIOD CONFIGURATION
// ============================================================================

export const GRACE_PERIOD = {
  enabledFor: ['payment_failed'],
  durationDays: 5,
  checkInterval: 'daily',
  expiryAction: 'move_to_expired',
} as const;

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

export const STRIPE_CONFIG = {
  apiKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  apiVersion: '2024-04-10',

  // Webhook events to handle
  webhookEvents: [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ],

  // Retry configuration for webhook handling
  webhookRetry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
  },

  // Rate limiting
  rateLimitPerMinute: 100,
};

// ============================================================================
// SUBSCRIPTION VALIDATION
// ============================================================================

export function validateSubscriptionPlan(
  plan: SubscriptionPlan
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plan.id) errors.push('Plan ID is required');
  if (!plan.stripeProductId) errors.push('Stripe product ID is required');
  if (!plan.stripePriceId) errors.push('Stripe price ID is required');
  if (!plan.name) errors.push('Plan name is required');
  if (plan.priceInCents <= 0) errors.push('Price must be greater than 0');
  if (!['monthly', 'annual'].includes(plan.billingCycle)) {
    errors.push('Invalid billing cycle');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSubscription(
  subscription: Subscription
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!subscription.id) errors.push('Subscription ID is required');
  if (!subscription.userId) errors.push('User ID is required');
  if (!subscription.stripeSubscriptionId) errors.push('Stripe subscription ID is required');
  if (!['active', 'cancelled', 'past_due', 'expired', 'trial'].includes(subscription.status)) {
    errors.push(`Invalid status: ${subscription.status}`);
  }
  if (!subscription.startDate) errors.push('Start date is required');

  // Validate date logic
  if (subscription.renewalDate && subscription.startDate > subscription.renewalDate) {
    errors.push('Renewal date must be after start date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if subscription grants access
 */
export function subscriptionGrantsAccess(status: SubscriptionStatus): boolean {
  return SUBSCRIPTION_STATUS_RULES[status].userHasAccess;
}

/**
 * Check if subscription can be cancelled
 */
export function canCancelSubscription(status: SubscriptionStatus): boolean {
  return SUBSCRIPTION_STATUS_RULES[status].canCancel;
}

/**
 * Check if subscription can be restored
 */
export function canRestoreSubscription(status: SubscriptionStatus): boolean {
  return SUBSCRIPTION_STATUS_RULES[status].canRestore;
}

/**
 * Get user-friendly status message
 */
export function getSubscriptionStatusMessage(subscription: Subscription): string {
  const rule = SUBSCRIPTION_STATUS_RULES[subscription.status];

  if (subscription.status === 'cancelled' && subscription.renewalDate) {
    const dateStr = subscription.renewalDate.toLocaleDateString();
    return `Subscription ends on ${dateStr}`;
  }

  if (subscription.status === 'past_due') {
    return 'Payment failed - please update your payment method';
  }

  return rule.description;
}

/**
 * Check if subscription is in grace period
 */
export function isInGracePeriod(subscription: Subscription, now: Date = new Date()): boolean {
  if (subscription.status !== 'past_due') return false;
  if (!subscription.updatedAt) return false;

  const gracePeriodEnd = new Date(subscription.updatedAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD.durationDays);

  return now < gracePeriodEnd;
}

/**
 * Check if subscription should be expired
 */
export function shouldExpireSubscription(
  subscription: Subscription,
  now: Date = new Date()
): boolean {
  if (subscription.status === 'cancelled' && subscription.renewalDate) {
    return now >= subscription.renewalDate;
  }

  if (subscription.status === 'past_due' && !isInGracePeriod(subscription, now)) {
    return true;
  }

  return false;
}

export default {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS_RULES,
  SUBSCRIPTION_LIFECYCLE,
  GRACE_PERIOD,
  STRIPE_CONFIG,
  validateSubscriptionPlan,
  validateSubscription,
  subscriptionGrantsAccess,
  canCancelSubscription,
  canRestoreSubscription,
  getSubscriptionStatusMessage,
  isInGracePeriod,
  shouldExpireSubscription,
};
