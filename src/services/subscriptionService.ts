/**
 * SUBSCRIPTION SERVICE - TEA TIME NETWORK
 * 
 * Handles subscription lifecycle and entitlement sync.
 * Manages the complete flow: creation, updates, cancellation, expiry.
 * Syncs all changes with access control system (Card 6).
 */

import {
  Subscription,
  SubscriptionEvent,
  SubscriptionStatus,
  subscriptionGrantsAccess,
  canCancelSubscription,
  canRestoreSubscription,
  shouldExpireSubscription,
  isInGracePeriod,
} from '../lib/subscriptionConfig';
import * as stripeService from './stripeService';
import * as accessControl from '../lib/accessControl';

// ============================================================================
// SUBSCRIPTION QUERIES
// ============================================================================

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<Subscription | null> {
  try {
    // TODO: Query from database
    // SELECT * FROM subscriptions WHERE id = subscriptionId
    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get active subscription for user
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    // TODO: Query from database
    // SELECT * FROM subscriptions WHERE userId = userId ORDER BY createdAt DESC LIMIT 1
    return null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Get subscription by Stripe ID
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  try {
    // TODO: Query from database
    // SELECT * FROM subscriptions WHERE stripeSubscriptionId = stripeSubscriptionId
    return null;
  } catch (error) {
    console.error('Error fetching subscription by Stripe ID:', error);
    return null;
  }
}

// ============================================================================
// SUBSCRIPTION CREATION
// ============================================================================

/**
 * Create subscription record after successful Stripe subscription
 */
export async function createSubscription(
  userId: string,
  planId: string,
  stripeSubscription: any // Stripe subscription object
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
  try {
    // Convert Stripe subscription to app format
    const subscription = stripeService.convertStripeSubscriptionToApp(
      stripeSubscription,
      userId,
      planId
    );

    // TODO: Insert into database
    // INSERT INTO subscriptions (userId, planId, stripeSubscriptionId, ...) VALUES (...)

    // Sync entitlements: user now has access
    const accessUpdated = await syncUserEntitlements(userId);
    if (!accessUpdated.success) {
      console.error('Failed to sync user entitlements:', accessUpdated.error);
      // Don't fail here, access may update later
    }

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// ENTITLEMENT SYNCHRONIZATION
// ============================================================================

/**
 * Sync user's subscription status with access control
 * 
 * This is called after every subscription state change.
 * Ensures user.accessLevel matches subscription status.
 */
export async function syncUserEntitlements(userId: string): Promise<{
  success: boolean;
  accessLevel?: string;
  error?: string;
}> {
  try {
    // Get user's subscription
    const subscription = await getUserSubscription(userId);

    // Determine access level based on subscription
    let accessLevel: 'free' | 'paid' = 'free';
    if (subscription && subscriptionGrantsAccess(subscription.status)) {
      accessLevel = 'paid';
    }

    // TODO: Update user record
    // UPDATE users SET accessLevel = accessLevel WHERE id = userId

    // TODO: Clear any cached access data for user
    // invalidateUserAccessCache(userId)

    return {
      success: true,
      accessLevel,
    };
  } catch (error) {
    console.error('Error syncing user entitlements:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// SUBSCRIPTION STATUS UPDATES
// ============================================================================

/**
 * Update subscription status from Stripe
 */
export async function updateSubscriptionFromStripe(
  stripeSubscriptionId: string
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
  try {
    // Get current subscription record
    const subscription = await getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      return {
        success: false,
        error: `Subscription ${stripeSubscriptionId} not found in database`,
      };
    }

    // Fetch from Stripe
    const stripeSubscription = await stripeService.getStripeSubscription(
      stripeSubscriptionId
    );
    if (!stripeSubscription) {
      return {
        success: false,
        error: 'Subscription not found in Stripe',
      };
    }

    // Convert to app format
    const updated = stripeService.convertStripeSubscriptionToApp(
      stripeSubscription,
      subscription.userId,
      subscription.planId
    );

    // TODO: Update database
    // UPDATE subscriptions SET status = updated.status, renewalDate = updated.renewalDate, ... WHERE id = subscription.id

    // Sync entitlements
    const syncResult = await syncUserEntitlements(subscription.userId);
    if (!syncResult.success) {
      console.error('Failed to sync entitlements after update:', syncResult.error);
    }

    return {
      success: true,
      subscription: updated,
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle subscription state transitions on lifecycle events
 */
export async function handleSubscriptionLifecycleEvent(
  eventType: string,
  subscription: Subscription
): Promise<{ success: boolean; newStatus?: SubscriptionStatus; error?: string }> {
  try {
    let newStatus = subscription.status;

    switch (eventType) {
      case 'subscription_created':
        // Just created, ensure status is set
        newStatus = 'active';
        break;

      case 'payment_succeeded':
        // Payment went through, activate if past_due
        if (subscription.status === 'past_due') {
          newStatus = 'active';
        }
        break;

      case 'payment_failed':
        // Mark as past_due, grace period starts
        newStatus = 'past_due';
        break;

      case 'subscription_cancelled':
        // User cancelled, access until renewal date
        newStatus = 'cancelled';
        break;

      case 'subscription_expired':
        // Time to fully expire (grace period over or renewal date passed)
        newStatus = 'expired';
        break;

      case 'subscription_renewed':
        // Auto-renewal happened, stay active
        newStatus = 'active';
        break;
    }

    if (newStatus !== subscription.status) {
      // TODO: Update database
      // UPDATE subscriptions SET status = newStatus WHERE id = subscription.id

      // Sync entitlements
      const syncResult = await syncUserEntitlements(subscription.userId);
      if (!syncResult.success) {
        console.error('Failed to sync entitlements:', syncResult.error);
      }
    }

    return {
      success: true,
      newStatus,
    };
  } catch (error) {
    console.error('Error handling lifecycle event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// SUBSCRIPTION ACTIONS
// ============================================================================

/**
 * User initiates cancellation
 */
export async function cancelSubscription(subscriptionId: string): Promise<{
  success: boolean;
  message?: string;
  expiresAt?: Date;
  error?: string;
}> {
  try {
    const subscription = await getSubscription(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    if (!canCancelSubscription(subscription.status)) {
      return {
        success: false,
        error: `Cannot cancel subscription with status: ${subscription.status}`,
      };
    }

    // Cancel at period end in Stripe
    const stripeSubscription = await stripeService.cancelSubscriptionAtPeriodEnd(
      subscription.stripeSubscriptionId
    );

    // Update local status
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.expiresAt = new Date(stripeSubscription.current_period_end * 1000);

    // TODO: Update database
    // UPDATE subscriptions SET status = 'cancelled', cancelledAt = NOW(), expiresAt = ... WHERE id = subscriptionId

    // Sync entitlements (user keeps access until expiry)
    const syncResult = await syncUserEntitlements(subscription.userId);

    return {
      success: true,
      message: `Subscription cancelled. Access will end on ${subscription.expiresAt.toLocaleDateString()}`,
      expiresAt: subscription.expiresAt,
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * User resumes cancelled subscription
 */
export async function restoreSubscription(subscriptionId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const subscription = await getSubscription(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    if (!canRestoreSubscription(subscription.status)) {
      return {
        success: false,
        error: `Cannot restore subscription with status: ${subscription.status}`,
      };
    }

    // Resume in Stripe
    const stripeSubscription = await stripeService.resumeSubscription(
      subscription.stripeSubscriptionId
    );

    // Update local status
    subscription.status = 'active';
    subscription.cancelledAt = undefined;

    // TODO: Update database
    // UPDATE subscriptions SET status = 'active', cancelledAt = NULL WHERE id = subscriptionId

    // Sync entitlements
    const syncResult = await syncUserEntitlements(subscription.userId);

    return {
      success: true,
      message: 'Subscription restored. Your access has been reactivated.',
    };
  } catch (error) {
    console.error('Error restoring subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// GRACE PERIOD & EXPIRY HANDLING
// ============================================================================

/**
 * Check if subscription needs to be expired (grace period over, etc.)
 */
export async function checkAndExpireSubscriptions(): Promise<{
  success: boolean;
  expiredCount?: number;
  error?: string;
}> {
  try {
    // TODO: Query all subscriptions that should be expired
    // SELECT * FROM subscriptions WHERE status IN ('cancelled', 'past_due') AND shouldExpire = true

    let expiredCount = 0;
    // const subscriptions = ...

    // for (const subscription of subscriptions) {
    //   if (shouldExpireSubscription(subscription)) {
    //     subscription.status = 'expired';
    //     // UPDATE database
    //     // Sync entitlements
    //     expiredCount++;
    //   }
    // }

    return {
      success: true,
      expiredCount,
    };
  } catch (error) {
    console.error('Error checking expiry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// SUBSCRIPTION EVENTS LOGGING
// ============================================================================

/**
 * Log subscription event (for audit trail)
 */
export async function logSubscriptionEvent(
  subscriptionId: string,
  userId: string,
  eventType: string,
  stripeEventId: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const event: SubscriptionEvent = {
      id: crypto.randomUUID(),
      subscriptionId,
      userId,
      eventType: eventType as any,
      stripeEventId,
      data,
      processedAt: new Date(),
    };

    // TODO: Insert into database
    // INSERT INTO subscription_events (id, subscriptionId, userId, eventType, ...) VALUES (...)

    return { success: true };
  } catch (error) {
    console.error('Error logging event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// SUBSCRIPTION STATE QUERIES
// ============================================================================

/**
 * Get user's current access level based on subscription
 */
export async function getUserAccessLevel(userId: string): Promise<'free' | 'paid'> {
  try {
    const subscription = await getUserSubscription(userId);
    if (subscription && subscriptionGrantsAccess(subscription.status)) {
      return 'paid';
    }
    return 'free';
  } catch (error) {
    console.error('Error getting user access level:', error);
    return 'free'; // Default to free on error
  }
}

/**
 * Check if user's subscription is in grace period
 */
export async function isUserInGracePeriod(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;
    return isInGracePeriod(subscription);
  } catch (error) {
    console.error('Error checking grace period:', error);
    return false;
  }
}

export default {
  getSubscription,
  getUserSubscription,
  getSubscriptionByStripeId,
  createSubscription,
  syncUserEntitlements,
  updateSubscriptionFromStripe,
  handleSubscriptionLifecycleEvent,
  cancelSubscription,
  restoreSubscription,
  checkAndExpireSubscriptions,
  logSubscriptionEvent,
  getUserAccessLevel,
  isUserInGracePeriod,
};
