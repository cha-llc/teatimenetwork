/**
 * SUBSCRIPTION & BILLING COMPONENTS - TEA TIME NETWORK
 * 
 * React components for account and billing management.
 * 
 * Components:
 * - SubscriptionPlan: Shows current plan and status
 * - BillingInfo: Shows billing date and payment method
 * - SubscriptionActions: Cancel/Restore buttons
 * - AccountSettings: Full account/billing page
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { Subscription, SubscriptionStatus } from '@/lib/subscriptionConfig';
import * as subscriptionService from '@/services/subscriptionService';

// ============================================================================
// SUBSCRIPTION PLAN DISPLAY
// ============================================================================

interface SubscriptionPlanProps {
  subscription: Subscription | null;
  onUpgradeClick?: () => void;
}

/**
 * SubscriptionPlan
 * 
 * Displays current plan (Free or App Member)
 * Shows status and actions
 */
export const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  subscription,
  onUpgradeClick,
}) => {
  const isFree = !subscription;
  const isPaid = subscription && ['active', 'trial'].includes(subscription.status);
  const isCancelling = subscription?.status === 'cancelled';
  const isExpired = subscription?.status === 'expired';

  return (
    <div className="bg-navy-100/20 border border-navy-400/30 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-cream-50 mb-1">
            {isFree ? 'Free Plan' : 'App Member'}
          </h3>
          <p className="text-cream-400 text-sm">
            {isFree
              ? 'Limited access to content'
              : isPaid
                ? 'Full access to all content'
                : 'Subscription ended'}
          </p>
        </div>

        {isPaid && <CheckCircle className="w-6 h-6 text-gold-400" />}
        {isCancelling && <Clock className="w-6 h-6 text-amber-400" />}
        {isExpired && <AlertCircle className="w-6 h-6 text-crimson-400" />}
      </div>

      {/* Price */}
      <div className="mb-6">
        {isFree ? (
          <p className="text-cream-200">
            <span className="text-2xl font-bold">$0</span>
            <span className="text-cream-400">/month</span>
          </p>
        ) : (
          <p className="text-cream-200">
            <span className="text-2xl font-bold">$19.99</span>
            <span className="text-cream-400">/month</span>
          </p>
        )}
      </div>

      {/* What's included */}
      <div className="mb-6 pb-6 border-b border-navy-400/20">
        <p className="text-cream-400 text-xs mb-2 uppercase">Includes:</p>
        {isFree ? (
          <ul className="space-y-1 text-cream-300 text-sm">
            <li>• Limited replays (1-3 per show)</li>
            <li>• Notes previews (15%)</li>
            <li>• Challenge Step 1</li>
          </ul>
        ) : (
          <ul className="space-y-1 text-cream-300 text-sm">
            <li>• All replays & episodes</li>
            <li>• Full Tea Time Notes</li>
            <li>• All Challenges & steps</li>
            <li>• Full execution tools</li>
            <li>• Progress tracking</li>
          </ul>
        )}
      </div>

      {/* Status and action */}
      {isFree && (
        <button
          onClick={onUpgradeClick}
          className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors flex items-center justify-center gap-2"
        >
          Upgrade to App Member
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {isPaid && (
        <p className="text-center text-cream-400 text-sm">
          Your subscription is active and keeping you in structure.
        </p>
      )}

      {isCancelling && (
        <p className="text-center text-amber-300 text-sm">
          You have access until your next billing date.
        </p>
      )}

      {isExpired && (
        <button
          onClick={onUpgradeClick}
          className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors"
        >
          Reactivate Membership
        </button>
      )}
    </div>
  );
};

// ============================================================================
// BILLING INFO DISPLAY
// ============================================================================

interface BillingInfoProps {
  subscription: Subscription | null;
}

/**
 * BillingInfo
 * 
 * Shows billing date, payment method, renewal date
 */
export const BillingInfo: React.FC<BillingInfoProps> = ({ subscription }) => {
  if (!subscription) {
    return null;
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-navy-100/20 border border-navy-400/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-cream-50 mb-4">Billing</h3>

      <div className="space-y-4">
        {/* Next billing date */}
        {subscription.renewalDate && subscription.status !== 'expired' && (
          <div>
            <p className="text-cream-400 text-sm mb-1">Next billing date</p>
            <p className="text-cream-50 font-semibold">
              {formatDate(subscription.renewalDate)}
            </p>
          </div>
        )}

        {/* Cancellation date */}
        {subscription.status === 'cancelled' && subscription.renewalDate && (
          <div className="p-3 bg-amber-400/20 border border-amber-400/50 rounded">
            <p className="text-amber-200 text-sm">
              Your subscription will end on {formatDate(subscription.renewalDate)}
            </p>
          </div>
        )}

        {/* Payment method */}
        {subscription.paymentMethod && (
          <div>
            <p className="text-cream-400 text-sm mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment method
            </p>
            <p className="text-cream-50 font-semibold">
              {subscription.paymentMethod.brand.toUpperCase()} •••• {subscription.paymentMethod.last4}
            </p>
            {/* TODO: Add "Update payment method" button */}
          </div>
        )}

        {/* Renewal info */}
        {subscription.status === 'active' && (
          <p className="text-cream-400 text-xs">
            Your subscription will automatically renew on {formatDate(subscription.renewalDate)}.
            Cancel anytime from your account settings.
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SUBSCRIPTION ACTIONS
// ============================================================================

interface SubscriptionActionsProps {
  subscription: Subscription | null;
  onCancelClick?: () => void;
  onRestoreClick?: () => void;
  loading?: boolean;
}

/**
 * SubscriptionActions
 * 
 * Cancel/Restore buttons with loading states
 */
export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  subscription,
  onCancelClick,
  onRestoreClick,
  loading = false,
}) => {
  if (!subscription) {
    return null;
  }

  const canCancel = subscription.status === 'active' || subscription.status === 'trial';
  const canRestore =
    subscription.status === 'cancelled' || subscription.status === 'past_due';

  return (
    <div className="space-y-3">
      {canCancel && (
        <button
          onClick={onCancelClick}
          disabled={loading}
          className="w-full px-4 py-2 border border-crimson-400 text-crimson-300 hover:bg-crimson-400/20 font-semibold rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      )}

      {canRestore && (
        <button
          onClick={onRestoreClick}
          disabled={loading}
          className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Restoring...' : 'Restore Subscription'}
        </button>
      )}

      {/* Grace period warning */}
      {subscription.status === 'past_due' && (
        <div className="p-3 bg-crimson-400/20 border border-crimson-400/50 rounded">
          <p className="text-crimson-200 text-sm">
            Your payment failed. Please update your payment method to continue access.
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACCOUNT SETTINGS PAGE
// ============================================================================

interface AccountSettingsProps {
  userId: string;
  subscription: Subscription | null;
  onUpgradeClick: () => void;
  onCheckoutRedirect: (url: string) => void;
}

/**
 * AccountSettings
 * 
 * Full account and billing page
 * Shows plan, billing info, and actions
 */
export const AccountSettings: React.FC<AccountSettingsProps> = ({
  userId,
  subscription,
  onUpgradeClick,
  onCheckoutRedirect,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!subscription) {
        setError('No subscription found');
        return;
      }

      const result = await subscriptionService.cancelSubscription(subscription.id);

      if (!result.success) {
        setError(result.error || 'Failed to cancel subscription');
        return;
      }

      setSuccessMessage(result.message || 'Subscription cancelled');
      // Refresh subscription data
      // TODO: Refetch subscription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!subscription) {
        setError('No subscription found');
        return;
      }

      const result = await subscriptionService.restoreSubscription(subscription.id);

      if (!result.success) {
        setError(result.error || 'Failed to restore subscription');
        return;
      }

      setSuccessMessage(result.message || 'Subscription restored');
      // Refresh subscription data
      // TODO: Refetch subscription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-cream-50 mb-2">Account Settings</h1>
      <p className="text-cream-400 mb-8">Manage your subscription and billing</p>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-gold-400/20 border border-gold-400/50 rounded">
          <p className="text-gold-200">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-crimson-400/20 border border-crimson-400/50 rounded">
          <p className="text-crimson-200">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Left column */}
        <div>
          <SubscriptionPlan subscription={subscription} onUpgradeClick={onUpgradeClick} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <BillingInfo subscription={subscription} />
          <SubscriptionActions
            subscription={subscription}
            onCancelClick={handleCancel}
            onRestoreClick={handleRestore}
            loading={loading}
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-navy-100/10 border border-navy-400/20 rounded-lg p-6">
        <h3 className="text-lg font-bold text-cream-50 mb-4">Questions?</h3>
        <div className="space-y-3 text-cream-300 text-sm">
          <p>
            <strong>Can I change my plan?</strong> Not in MVP. You can cancel and resubscribe
            when new plans are available.
          </p>
          <p>
            <strong>What happens when I cancel?</strong> You keep access until your next
            billing date, then lose access to paid features.
          </p>
          <p>
            <strong>Can I get a refund?</strong> Contact support. Refunds are handled on a
            case-by-case basis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default {
  SubscriptionPlan,
  BillingInfo,
  SubscriptionActions,
  AccountSettings,
};
