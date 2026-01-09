import React, { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle, Loader2, CheckCircle, XCircle, Sparkles, Star, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import SubscriptionModal from './SubscriptionModal';
import type { PricingTier } from '@/components/pricing/PricingSection';

interface SubscriptionInfo {
  subscriptionId: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  tier?: string;
}

const tierConfig = {
  starter: {
    name: 'Starter',
    price: '$4.99',
    icon: Sparkles,
    gradient: 'from-[#7C9885] to-emerald-600',
    bgGradient: 'from-[#7C9885] to-emerald-500'
  },
  pro: {
    name: 'Pro',
    price: '$9.99',
    icon: Crown,
    gradient: 'from-purple-500 to-indigo-600',
    bgGradient: 'from-purple-400 to-indigo-500'
  },
  ultimate: {
    name: 'Ultimate',
    price: '$19.99',
    icon: Star,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-400 to-orange-500'
  }
};

const SubscriptionManager: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<PricingTier>('pro');

  const currentTier = (profile?.subscription_tier || 'starter') as keyof typeof tierConfig;
  const tierInfo = tierConfig[currentTier] || tierConfig.starter;
  const TierIcon = tierInfo.icon;

  useEffect(() => {
    if (user && profile?.is_premium) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user, profile?.is_premium]);

  const fetchSubscription = async () => {
    if (!profile?.email) return;

    try {
      // First get the customer ID
      const { data: setupData } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: profile.email,
          action: 'create-setup-intent',
          userId: user?.id
        }
      });

      if (setupData?.customerId) {
        const { data } = await supabase.functions.invoke('create-subscription', {
          body: {
            action: 'get-subscription',
            customerId: setupData.customerId
          }
        });

        if (data && !data.error && data.subscriptionId) {
          setSubscription(data);
        }
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          action: 'cancel-subscription',
          subscriptionId: subscription.subscriptionId,
          immediately: false
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message);
      }

      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription will remain active until the end of the billing period.',
      });

      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
      setShowCancelConfirm(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel subscription',
        variant: 'destructive'
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleUpgrade = (tier: PricingTier) => {
    setUpgradeTier(tier);
    setShowUpgradeModal(true);
  };

  if (!profile?.is_premium) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#7C9885]" />
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Canceling
        </span>
      );
    }
    
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Past Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // Determine available upgrades
  const availableUpgrades = [];
  if (currentTier === 'starter') {
    availableUpgrades.push({ tier: 'pro' as PricingTier, name: 'Pro', price: '$9.99' });
    availableUpgrades.push({ tier: 'ultimate' as PricingTier, name: 'Ultimate', price: '$19.99' });
  } else if (currentTier === 'pro') {
    availableUpgrades.push({ tier: 'ultimate' as PricingTier, name: 'Ultimate', price: '$19.99' });
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierInfo.bgGradient} flex items-center justify-center`}>
              <TierIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">Tea Time {tierInfo.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your subscription</p>
            </div>
          </div>
          {subscription && getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)}
        </div>

        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <CreditCard className="w-4 h-4" />
                  Plan
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{tierInfo.price}/month</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  {subscription.cancelAtPeriodEnd ? 'Ends On' : 'Next Billing'}
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>

            {/* Upgrade Options */}
            {availableUpgrades.length > 0 && !subscription.cancelAtPeriodEnd && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-800 dark:text-purple-300 text-sm">Upgrade Your Plan</span>
                </div>
                <div className="flex gap-2">
                  {availableUpgrades.map((upgrade) => (
                    <button
                      key={upgrade.tier}
                      onClick={() => handleUpgrade(upgrade.tier)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        upgrade.tier === 'ultimate' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {upgrade.name} ({upgrade.price}/mo)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {subscription.cancelAtPeriodEnd ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                  You'll continue to have {tierInfo.name} access until then.
                </p>
              </div>
            ) : (
              <>
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-3">
                    <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                      Are you sure you want to cancel?
                    </p>
                    <p className="text-red-700 dark:text-red-400 text-xs">
                      You'll lose access to {tierInfo.name} features at the end of your billing period.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Keep Subscription
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={canceling}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{tierInfo.name} Active</span>
            </div>
            <p className="text-green-700 dark:text-green-400 text-sm mt-1">
              You have full access to all {tierInfo.name} features.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        selectedTier={upgradeTier}
      />
    </>
  );
};

export default SubscriptionManager;
