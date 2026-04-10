/**
 * MCP-INTEGRATED STRIPE WEBHOOK HANDLER
 * 
 * Enhanced version that orchestrates all 14 MCPs on subscription events.
 * Every webhook triggers coordinated actions across the entire system.
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as stripeService from '../services/stripeService';
import * as subscriptionService from '../services/subscriptionService';
import * as mcpOrchestration from '../integrations/mcpSubscriptionOrchestration';

// ============================================================================
// MCP-ENHANCED WEBHOOK HANDLER
// ============================================================================

/**
 * Enhanced Stripe webhook handler with MCP orchestration
 */
export async function handleStripeWebhookWithMCP(
  req: Request,
  res: Response
): Promise<void> {
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
    // DEBUG: `[Webhook + MCP] Event: ${event.type} | ID: ${event.id}`

    // Get user info from event
    const userInfo = extractUserInfoFromEvent(event);

    if (!userInfo) {
      // WARN: `[Webhook] No user info found in event ${event.id}`
      res.json({ received: true, eventId: event.id });
      return;
    }

    // Route to appropriate handler
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreatedWithMCP(event, userInfo);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdatedWithMCP(event, userInfo);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeletedWithMCP(event, userInfo);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceededWithMCP(event, userInfo);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailedWithMCP(event, userInfo);
        break;

      default:
        // DEBUG: `[Webhook] Unhandled event type: ${event.type}`
    }

    // Always return 200 to acknowledge receipt
    res.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error(`[Webhook + MCP] Error processing event ${event.id}:`, error);
    // Return 500 so Stripe will retry
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ============================================================================
// MCP-ENHANCED EVENT HANDLERS
// ============================================================================

/**
 * Handle: customer.subscription.created (with MCP)
 * 
 * Orchestrates:
 * 1. Create subscription in database
 * 2. Sync to HubSpot CRM
 * 3. Send welcome email
 * 4. Log to Amplitude
 * 5. Notify Slack
 * 6. Create calendar reminder
 * 7. Grant course access
 * 8. Post to social media (Socialblu)
 */
async function handleSubscriptionCreatedWithMCP(
  event: Stripe.Event,
  userInfo: UserInfo
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // DEBUG: `[Webhook + MCP] Subscription created for user ${userInfo.userId}`

  // 1. Create subscription record (database)
  const result = await subscriptionService.createSubscription(
    userInfo.userId,
    'TTN_APP_MEMBER_MONTHLY',
    subscription
  );

  if (!result.success) {
    console.error('[Webhook] Failed to create subscription:', result.error);
    throw new Error(`Failed to create subscription: ${result.error}`);
  }

  // 2. Log event
  await subscriptionService.logSubscriptionEvent(
    result.subscription!.id,
    userInfo.userId,
    'subscription_created',
    event.id,
    {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      utmSource: userInfo.utmSource,
    }
  );

  // 3. Orchestrate all MCPs
  const mcpResult = await mcpOrchestration.orchestrateSubscriptionEvent('created', {
    userId: userInfo.userId,
    email: userInfo.email,
    accessLevel: 'paid',
    subscriptionStatus: 'active',
    renewalDate: new Date(subscription.current_period_end * 1000),
    utmSource: userInfo.utmSource,
  });

  // DEBUG: `[Webhook + MCP] MCP orchestration complete:`, mcpResult.services

  // 4. Post to social media (Socialblu)
  if (userInfo.email) {
    await mcpOrchestration.postSubscriptionAnnouncementToSocialblu({
      accountId: 'main',
      content: `🎉 New member joined Tea Time Network! Get unlimited access to all content with App Membership. ${mcpOrchestration.buildCheckoutURLWithUTM('https://teatimenetwork.app/upgrade', 'app', 'upgrade_prompt', 'social_announcement')}`,
      platforms: ['tiktok', 'instagram', 'youtube'],
      hashtags: ['#TeaTimeNetwork', '#StructureMatters', '#PersonalGrowth'],
      utmUrl: mcpOrchestration.buildCheckoutURLWithUTM(
        'https://teatimenetwork.app/upgrade',
        'social',
        'upgrade_prompt'
      ),
    });
  }

  console.log(
    `[Webhook + MCP] Subscription created and all integrations triggered for ${userInfo.email}`
  );
}

/**
 * Handle: customer.subscription.updated (with MCP)
 * 
 * Orchestrates:
 * 1. Update subscription in database
 * 2. Update HubSpot CRM
 * 3. Send status change email
 * 4. Log to Amplitude
 * 5. Notify Slack
 */
async function handleSubscriptionUpdatedWithMCP(
  event: Stripe.Event,
  userInfo: UserInfo
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const previousAttributes = event.data.previous_attributes as Record<string, any>;

  // DEBUG: `[Webhook + MCP] Subscription updated for user ${userInfo.userId}`

  // Check if status changed
  const statusChanged = previousAttributes?.status !== undefined;

  if (statusChanged) {
    console.log(
      `[Webhook + MCP] Status changed: ${previousAttributes.status} → ${subscription.status}`
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
    userInfo.userId,
    userInfo.userId,
    'subscription_updated',
    event.id,
    {
      stripeSubscriptionId: subscription.id,
      previousStatus: previousAttributes?.status,
      newStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  );

  // If cancelled, orchestrate MCP events
  if (subscription.status === 'canceled' && previousAttributes?.status !== 'canceled') {
    await mcpOrchestration.orchestrateSubscriptionEvent('cancelled', {
      userId: userInfo.userId,
      email: userInfo.email,
      accessLevel: 'paid', // Keep access until renewal date
      subscriptionStatus: 'cancelled',
      renewalDate: new Date(subscription.current_period_end * 1000),
    });
  }
}

/**
 * Handle: customer.subscription.deleted (with MCP)
 * 
 * Orchestrates:
 * 1. Mark as expired in database
 * 2. Revoke access in HubSpot
 * 3. Send cancellation confirmation
 * 4. Log to Amplitude (churn event)
 * 5. Notify Slack
 * 6. Revoke course access
 * 7. Create win-back campaign task
 */
async function handleSubscriptionDeletedWithMCP(
  event: Stripe.Event,
  userInfo: UserInfo
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  // DEBUG: `[Webhook + MCP] Subscription deleted for user ${userInfo.userId}`

  // Get existing subscription
  const existing = await subscriptionService.getSubscriptionByStripeId(subscription.id);
  if (!existing) {
    console.error('[Webhook] Subscription not found:', subscription.id);
    return;
  }

  // Handle lifecycle event
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
    userInfo.userId,
    'subscription_expired',
    event.id,
    {
      stripeSubscriptionId: subscription.id,
      reason: 'subscription_deleted_in_stripe',
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    }
  );

  // Orchestrate MCP events (churn)
  await mcpOrchestration.orchestrateSubscriptionEvent('cancelled', {
    userId: userInfo.userId,
    email: userInfo.email,
    accessLevel: 'free',
    subscriptionStatus: 'expired',
  });

  // Revoke course access
  await mcpOrchestration.revokeTicketTailorCourseAccess(userInfo.userId, 'member-courses');

  // TODO: Create win-back campaign task in Linear
  // Segment for win-back email campaign in HubSpot

  // DEBUG: `[Webhook + MCP] Subscription expired and user access revoked for ${userInfo.email}`
}

/**
 * Handle: invoice.payment_succeeded (with MCP)
 * 
 * Orchestrates:
 * 1. Activate subscription
 * 2. Clear grace period in HubSpot
 * 3. Send payment confirmation
 * 4. Log to Amplitude (retention metric)
 * 5. Notify Slack
 */
async function handlePaymentSucceededWithMCP(
  event: Stripe.Event,
  userInfo: UserInfo
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    // DEBUG: '[Webhook] Payment succeeded but no subscription attached'
    return;
  }

  // DEBUG: `[Webhook + MCP] Payment succeeded for subscription ${subscriptionId}`

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
    userInfo.userId,
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

  // Orchestrate (renewal/recovery)
  await mcpOrchestration.orchestrateSubscriptionEvent('renewed', {
    userId: userInfo.userId,
    email: userInfo.email,
    accessLevel: 'paid',
    subscriptionStatus: subscription.status,
  });

  // DEBUG: `[Webhook + MCP] Payment succeeded and subscription activated for ${userInfo.email}`
}

/**
 * Handle: invoice.payment_failed (with MCP)
 * 
 * Orchestrates:
 * 1. Mark as past_due
 * 2. Alert HubSpot to trigger win-back sequence
 * 3. Send payment failure email
 * 4. Log to Amplitude (churn risk event)
 * 5. Notify Slack
 */
async function handlePaymentFailedWithMCP(
  event: Stripe.Event,
  userInfo: UserInfo
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    // DEBUG: '[Webhook] Payment failed but no subscription attached'
    return;
  }

  // DEBUG: `[Webhook + MCP] Payment failed for subscription ${subscriptionId}`

  // Get subscription
  const subscription = await subscriptionService.getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error('[Webhook] Subscription not found:', subscriptionId);
    return;
  }

  // Handle lifecycle event
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
    userInfo.userId,
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

  // Orchestrate (churn risk)
  await mcpOrchestration.notifySlackSubscriptionEvent(
    'payment_failed',
    { email: userInfo.email, userId: userInfo.userId, subscriptionId },
    '#subscription-alerts'
  );

  // Update HubSpot - trigger win-back sequence
  await mcpOrchestration.syncSubscriptionToHubSpot({
    email: userInfo.email,
    accessLevel: 'paid', // Grace period, keep access
    subscriptionStatus: 'past_due',
  });

  // DEBUG: `[Webhook + MCP] Payment failed and grace period activated for ${userInfo.email}`
}

// ============================================================================
// USER INFO EXTRACTION
// ============================================================================

interface UserInfo {
  userId: string;
  email: string;
  utmSource?: string;
}

/**
 * Extract user info from Stripe event
 */
function extractUserInfoFromEvent(event: Stripe.Event): UserInfo | null {
  try {
    let subscription: Stripe.Subscription | null = null;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription;
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        subscription = invoice.subscription as any;
        break;

      default:
        return null;
    }

    if (!subscription || !subscription.metadata?.userId) {
      return null;
    }

    return {
      userId: subscription.metadata.userId as string,
      email: subscription.metadata.userEmail as string,
      utmSource: subscription.metadata.utmSource as string | undefined,
    };
  } catch (error) {
    console.error('[Webhook] Error extracting user info:', error);
    return null;
  }
}

export default {
  handleStripeWebhookWithMCP,
};
