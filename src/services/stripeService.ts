/**
 * STRIPE INTEGRATION SERVICE - TEA TIME NETWORK
 * 
 * Handles all Stripe API interactions:
 * - Creating subscriptions
 * - Managing payment methods
 * - Handling webhooks
 * - Syncing subscription status
 */

import Stripe from 'stripe';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  STRIPE_CONFIG,
} from '../lib/subscriptionConfig';

// ============================================================================
// STRIPE INITIALIZATION
// ============================================================================

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!STRIPE_CONFIG.apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(STRIPE_CONFIG.apiKey, {
      apiVersion: STRIPE_CONFIG.apiVersion as any,
    });
  }
  return stripeInstance;
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Create or retrieve Stripe customer for user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    const stripe = getStripe();

    // Try to find existing customer by metadata
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
        ...metadata,
      },
    });

    return customer;
  } catch (error) {
    console.error('Error managing Stripe customer:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION CREATION
// ============================================================================

/**
 * Create subscription for user
 * 
 * Returns: Stripe session URL for checkout
 */
export async function createSubscriptionCheckoutSession(
  userId: string,
  email: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string | null }> {
  try {
    const stripe = getStripe();
    const plan = SUBSCRIPTION_PLANS[planId];

    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    // Get or create customer
    const customer = await getOrCreateStripeCustomer(userId, email);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Get subscription from Stripe
 */
export async function getStripeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return subscription;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return null; // Not found
    }
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Cancel subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Immediately cancel subscription
 */
export async function cancelSubscriptionImmediate(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.del(stripeSubscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
}

// ============================================================================
// PAYMENT METHOD MANAGEMENT
// ============================================================================

/**
 * Get saved payment methods for customer
 */
export async function getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    const stripe = getStripe();
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return methods.data;
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    throw error;
  }
}

/**
 * Update default payment method
 */
export async function updateDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
}

// ============================================================================
// WEBHOOK HANDLING
// ============================================================================

/**
 * Verify and parse webhook event
 */
export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string
): Stripe.Event | null {
  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Extract subscription data from webhook event
 */
export function extractSubscriptionFromWebhook(
  event: Stripe.Event
): {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  userId: string;
  data: Record<string, any>;
} | null {
  try {
    let subscription: Stripe.Subscription | null = null;
    let stripeCustomerId = '';

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription;
        stripeCustomerId = subscription.customer as string;
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        stripeCustomerId = invoice.customer as string;
        subscription = invoice.subscription as any;
        break;

      default:
        return null;
    }

    if (!subscription || !stripeCustomerId) {
      return null;
    }

    // Get customer to find userId
    return {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId,
      userId: (subscription.metadata?.userId || '') as string,
      data: event.data.object,
    };
  } catch (error) {
    console.error('Error extracting subscription from webhook:', error);
    return null;
  }
}

// ============================================================================
// SUBSCRIPTION STATUS CONVERSION
// ============================================================================

/**
 * Convert Stripe subscription status to app status
 */
export function mapStripeStatusToAppStatus(
  stripeSubscription: Stripe.Subscription
): SubscriptionStatus {
  if (stripeSubscription.status === 'trialing') {
    return 'trial';
  }

  if (stripeSubscription.status === 'active') {
    return 'active';
  }

  if (stripeSubscription.status === 'past_due') {
    return 'past_due';
  }

  if (stripeSubscription.status === 'canceled') {
    // Check if cancelled_at is in the future (scheduled cancellation)
    if (stripeSubscription.cancel_at && stripeSubscription.cancel_at * 1000 > Date.now()) {
      return 'cancelled';
    }
    return 'expired';
  }

  if (stripeSubscription.status === 'unpaid') {
    return 'past_due';
  }

  return 'expired';
}

/**
 * Convert Stripe subscription to app Subscription object
 */
export function convertStripeSubscriptionToApp(
  stripeSubscription: Stripe.Subscription,
  userId: string,
  planId: string
): Subscription {
  const status = mapStripeStatusToAppStatus(stripeSubscription);

  let renewalDate: Date | undefined;
  if (stripeSubscription.current_period_end) {
    renewalDate = new Date(stripeSubscription.current_period_end * 1000);
  }

  let trialEndsAt: Date | undefined;
  if (stripeSubscription.trial_end) {
    trialEndsAt = new Date(stripeSubscription.trial_end * 1000);
  }

  let cancelledAt: Date | undefined;
  if (stripeSubscription.canceled_at) {
    cancelledAt = new Date(stripeSubscription.canceled_at * 1000);
  }

  let expiresAt: Date | undefined;
  if (stripeSubscription.cancel_at) {
    expiresAt = new Date(stripeSubscription.cancel_at * 1000);
  }

  return {
    id: stripeSubscription.id,
    userId,
    planId,
    stripeSubscriptionId: stripeSubscription.id,
    status,
    startDate: new Date(stripeSubscription.created * 1000),
    renewalDate,
    trialEndsAt,
    cancelledAt,
    expiresAt,
    createdAt: new Date(stripeSubscription.created * 1000),
    updatedAt: new Date(),
  };
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

/**
 * Get latest invoice for subscription
 */
export async function getLatestInvoice(
  stripeSubscriptionId: string
): Promise<Stripe.Invoice | null> {
  try {
    const stripe = getStripe();
    const invoices = await stripe.invoices.list({
      subscription: stripeSubscriptionId,
      limit: 1,
    });

    return invoices.data[0] || null;
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return null;
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class StripeError extends Error {
  constructor(
    message: string,
    public stripeErrorCode?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

/**
 * Handle Stripe errors gracefully
 */
export function handleStripeError(error: any): StripeError {
  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return new StripeError(
      `Invalid request: ${error.message}`,
      error.code,
      error.status
    );
  }

  if (error instanceof Stripe.errors.StripeAuthenticationError) {
    return new StripeError(
      'Authentication failed with Stripe',
      'authentication_error'
    );
  }

  if (error instanceof Stripe.errors.StripeRateLimitError) {
    return new StripeError(
      'Stripe rate limit exceeded - please try again',
      'rate_limit_error'
    );
  }

  if (error instanceof Stripe.errors.StripeAPIError) {
    return new StripeError(
      `Stripe API error: ${error.message}`,
      error.code,
      error.status
    );
  }

  return new StripeError(error.message || 'Unknown Stripe error');
}

export default {
  getStripe,
  getOrCreateStripeCustomer,
  createSubscriptionCheckoutSession,
  getStripeSubscription,
  cancelSubscriptionAtPeriodEnd,
  cancelSubscriptionImmediate,
  resumeSubscription,
  getPaymentMethods,
  updateDefaultPaymentMethod,
  verifyWebhookSignature,
  extractSubscriptionFromWebhook,
  mapStripeStatusToAppStatus,
  convertStripeSubscriptionToApp,
  getLatestInvoice,
  handleStripeError,
  StripeError,
};
