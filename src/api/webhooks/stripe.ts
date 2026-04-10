/**
 * STRIPE WEBHOOK HANDLER - TEA TIME NETWORK
 * 
 * API endpoint for receiving Stripe webhook events.
 * Handles all subscription lifecycle events.
 * 
 * Deployment:
 * 1. Create public API endpoint: POST /api/webhooks/stripe
 * 2. Configure in Stripe Dashboard:
 *    - Events URL: https://yourapp.com/api/webhooks/stripe
 *    - Events: customer.subscription.created, updated, deleted
 *             invoice.payment_succeeded, payment_failed
 * 3. Copy webhook secret to environment (STRIPE_WEBHOOK_SECRET)
 * 4. Test with: stripe trigger customer.subscription.created
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as stripeService from '../services/stripeService';
import * as subscriptionService from '../services/subscriptionService';

// ============================================================================
// WEBHOOK ENDPOINT
// ============================================================================

/**
 * Stripe webhook handler
 * 
 * POST /api/webhooks/stripe
 * 
 * Receives events from Stripe and processes them.
 * All requests must have valid signature.
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  // Verify signature
  const event = stripeService.verifyWebhookSignature(
    req.rawBody || JSON.stringify(req.body),
    signature as string
  );

  if (!event) {
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  try {
    // Log event for debugging
    // DEBUG: `[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`

    // Route to appropriate handler
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;

      default:
        // DEBUG: `[Stripe Webhook] Unhandled event type: ${event.type}`
    }

    // Always return 200 to acknowledge receipt
    res.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event ${event.id}:`, error);
    // Return 500 so Stripe will retry
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle: customer.subscription.created
 * 
 * Triggered when user completes checkout and subscription is created.
 * Action: Mark user as paid, unlock content immediately
 */
async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('[Webhook] Subscription created but no userId in metadata', subscription.id);
    return;
  }

  // DEBUG: `[Webhook] Subscription created for user ${userId}:`, subscription.id

  // Create subscription record
  const result = await subscriptionService.createSubscription(
    userId,
    'TTN_APP_MEMBER_MONTHLY', // Plan ID from config
    subscription
  );

  if (!result.success) {
    console.error('[Webhook] Failed to create subscription:', result.error);
    throw new Error(`Failed to create subscription: ${result.error}`);
  }

  // Log event
  await subscriptionService.logSubscriptionEvent(
    result.subscription!.id,
    userId,
    'subscription_created',
    event.id,
    {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }
  );

  // DEBUG: `[Webhook] Subscription created and user ${userId} unlocked`
}

/**
 * Handle: customer.subscription.updated
 * 
 * Triggered when subscription status changes (e.g., cancel_at_period_end).
 * Action: Update subscription record, sync entitlements if status changed
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const previousAttributes = event.data.previous_attributes as Record<string, any>;

  // DEBUG: `[Webhook] Subscription updated:`, subscription.id

  // Get existing subscription
  const existing = await subscriptionService.getSubscriptionByStripeId(subscription.id);
  if (!existing) {
    console.error('[Webhook] Subscription not found:', subscription.id);
    return;
  }

  // Check if status changed
  const statusChanged = previousAttributes?.status !== undefined;

  if (statusChanged) {
    console.log(
      `[Webhook] Status changed: ${previousAttributes.status} → ${subscription.status}`
    );
  }

  // Update from Stripe
  const result = await subscriptionService.updateSubscriptionFromStripe(subscription.id);
  if (!result.success) {
    console.error('[Webhook] Failed to update subscription:', result.error);
    throw new Error(`Failed to update subscription: ${result.error}`);
  }

  // Log event
  await subscriptionService.logSubscriptionEvent(
    existing.id,
    existing.userId,
    'subscription_updated',
    event.id,
    {
      stripeSubscriptionId: subscription.id,
      previousStatus: previousAttributes?.status,
      newStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }
  );

  // DEBUG: `[Webhook] Subscription ${subscription.id} updated`
}

/**
 * Handle: customer.subscription.deleted
 * 
 * Triggered when subscription is cancelled/deleted.
 * Action: Mark subscription as expired, revoke access
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // DEBUG: `[Webhook] Subscription deleted:`, subscription.id

  // Get existing subscription
  const existing = await subscriptionService.getSubscriptionByStripeId(subscription.id);
  if (!existing) {
    console.error('[Webhook] Subscription not found:', subscription.id);
    return;
  }

  // Handle lifecycle event (move to expired)
  const result = await subscriptionService.handleSubscriptionLifecycleEvent(
    'subscription_expired',
    existing
  );

  if (!result.success) {
    console.error('[Webhook] Failed to expire subscription:', result.error);
    throw new Error(`Failed to expire subscription: ${result.error}`);
  }

  // Log event
  await subscriptionService.logSubscriptionEvent(
    existing.id,
    existing.userId,
    'subscription_expired',
    event.id,
    {
      stripeSubscriptionId: subscription.id,
      reason: 'subscription_deleted_in_stripe',
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    }
  );

  // DEBUG: `[Webhook] Subscription ${subscription.id} expired and user access revoked`
}

/**
 * Handle: invoice.payment_succeeded
 * 
 * Triggered when payment succeeds (renewal or retry after failure).
 * Action: Mark subscription as active, clear grace period
 */
async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    // DEBUG: '[Webhook] Payment succeeded but no subscription attached to invoice'
    return;
  }

  // DEBUG: `[Webhook] Payment succeeded for subscription:`, subscriptionId

  // Get subscription
  const subscription = await subscriptionService.getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error('[Webhook] Subscription not found:', subscriptionId);
    return;
  }

  // Handle lifecycle event
  const result = await subscriptionService.handleSubscriptionLifecycleEvent(
    'payment_succeeded',
    subscription
  );

  if (!result.success) {
    console.error('[Webhook] Failed to handle payment success:', result.error);
    throw new Error(`Failed to handle payment success: ${result.error}`);
  }

  // Log event
  await subscriptionService.logSubscriptionEvent(
    subscription.id,
    subscription.userId,
    'payment_succeeded',
    event.id,
    {
      stripeSubscriptionId: subscriptionId,
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      paidAt: new Date(invoice.paid ? invoice.paid * 1000 : Date.now()),
    }
  );

  // DEBUG: `[Webhook] Payment succeeded and subscription ${subscriptionId} activated`
}

/**
 * Handle: invoice.payment_failed
 * 
 * Triggered when payment fails.
 * Action: Mark subscription as past_due, activate grace period
 * DO NOT revoke access yet
 */
async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    // DEBUG: '[Webhook] Payment failed but no subscription attached to invoice'
    return;
  }

  // DEBUG: `[Webhook] Payment failed for subscription:`, subscriptionId

  // Get subscription
  const subscription = await subscriptionService.getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error('[Webhook] Subscription not found:', subscriptionId);
    return;
  }

  // Handle lifecycle event (grace period)
  const result = await subscriptionService.handleSubscriptionLifecycleEvent(
    'payment_failed',
    subscription
  );

  if (!result.success) {
    console.error('[Webhook] Failed to handle payment failure:', result.error);
    throw new Error(`Failed to handle payment failure: ${result.error}`);
  }

  // Log event
  await subscriptionService.logSubscriptionEvent(
    subscription.id,
    subscription.userId,
    'payment_failed',
    event.id,
    {
      stripeSubscriptionId: subscriptionId,
      invoiceId: invoice.id,
      attemptCount: invoice.attempt_count,
      nextRetry: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : null,
    }
  );

  // TODO: Send email to user
  // await sendPaymentFailedEmail(subscription.userId, subscription)

  // DEBUG: `[Webhook] Payment failed for subscription ${subscriptionId}, grace period activated`
}

// ============================================================================
// WEBHOOK RETRY LOGIC (for failed webhook delivery)
// ============================================================================

/**
 * Webhook retry configuration
 * 
 * Stripe will retry failed webhooks with exponential backoff:
 * - 1st attempt: immediately
 * - 2nd attempt: 5 minutes later
 * - 3rd attempt: 30 minutes later
 * - 4th attempt: 2 hours later
 * - 5th attempt: 5 hours later
 * 
 * We return 500 for unhandled errors to trigger retry.
 * We return 200 for successful or known-failed conditions.
 */

/**
 * Manual webhook retry (for testing/recovery)
 * 
 * POST /api/webhooks/stripe/retry?eventId=evt_xxxxx
 * 
 * Only in development/admin context.
 */
export async function retryWebhookEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = stripeService.getStripe();

    // Retrieve event from Stripe
    const event = await stripe.events.retrieve(eventId);

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    // Re-process it
    // DEBUG: `[Webhook] Retrying event ${eventId} manually`
    await handleStripeWebhook(
      {
        headers: {
          'stripe-signature': 'manual-retry',
        },
        body: event,
        rawBody: JSON.stringify(event),
      } as any,
      {
        json: (data: any) => data,
        status: (code: number) => ({
          json: (data: any) => data,
        }),
      } as any
    );

    return { success: true };
  } catch (error) {
    console.error(`[Webhook] Failed to retry event ${eventId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// WEBHOOK TESTING (development only)
// ============================================================================

/**
 * Simulate webhook event (development only)
 * 
 * POST /api/webhooks/stripe/test?event=subscription_created
 * 
 * Available events:
 * - subscription_created
 * - subscription_updated
 * - payment_succeeded
 * - payment_failed
 * - subscription_deleted
 */
export async function testWebhookEvent(eventType: string): Promise<{ success: boolean }> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Test endpoint only available in development');
  }

  try {
    // Create mock Stripe event
    const mockEvent = createMockStripeEvent(eventType);

    // Process it
    // DEBUG: `[Webhook Test] Processing mock event: ${eventType}`
    await handleStripeWebhook(
      {
        headers: { 'stripe-signature': 'test-signature' },
        body: mockEvent,
        rawBody: JSON.stringify(mockEvent),
      } as any,
      {
        json: (data: any) => data,
        status: (code: number) => ({
          json: (data: any) => data,
        }),
      } as any
    );

    return { success: true };
  } catch (error) {
    console.error(`[Webhook Test] Failed to process test event:`, error);
    return { success: false };
  }
}

/**
 * Create mock Stripe event for testing
 */
function createMockStripeEvent(eventType: string): Stripe.Event {
  const now = Math.floor(Date.now() / 1000);
  const userId = 'test-user-123';

  const baseEvent = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2024-04-10',
    created: now,
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  };

  switch (eventType) {
    case 'subscription_created':
      return {
        ...baseEvent,
        type: 'customer.subscription.created',
        data: {
          object: {
            id: `sub_test_${Date.now()}`,
            object: 'subscription',
            customer: `cus_test_${userId}`,
            status: 'active',
            current_period_start: now,
            current_period_end: now + 30 * 24 * 60 * 60, // 30 days
            created: now,
            metadata: { userId },
          } as any,
          previous_attributes: {},
        },
      } as any;

    case 'payment_succeeded':
      return {
        ...baseEvent,
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: `in_test_${Date.now()}`,
            object: 'invoice',
            subscription: `sub_test_123`,
            customer: `cus_test_${userId}`,
            amount_paid: 1999,
            currency: 'usd',
            paid: true,
            status: 'paid',
            attempt_count: 1,
          } as any,
        },
      } as any;

    case 'payment_failed':
      return {
        ...baseEvent,
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: `in_test_fail_${Date.now()}`,
            object: 'invoice',
            subscription: `sub_test_123`,
            customer: `cus_test_${userId}`,
            amount_due: 1999,
            currency: 'usd',
            paid: false,
            status: 'open',
            attempt_count: 1,
            next_payment_attempt: now + 24 * 60 * 60, // Retry tomorrow
          } as any,
        },
      } as any;

    default:
      return baseEvent as any;
  }
}

export default {
  handleStripeWebhook,
  retryWebhookEvent,
  testWebhookEvent,
};
