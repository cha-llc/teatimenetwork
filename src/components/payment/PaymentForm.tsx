import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, Shield, Sparkles, Crown, Star, RefreshCw, AlertTriangle, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PricingTier } from '@/components/pricing/PricingSection';

interface PaymentFormProps {
  customerId: string;
  userId: string;
  tier?: PricingTier;
  onSuccess: () => void;
  onCancel: () => void;
}

const tierInfo = {
  starter: {
    name: 'Starter',
    price: '$4.99',
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    icon: Sparkles,
    gradient: 'from-[#7C9885] to-emerald-600',
    businessName: 'Tea Time Starter'
  },
  pro: {
    name: 'Pro',
    price: '$9.99',
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    icon: Crown,
    gradient: 'from-purple-500 to-indigo-600',
    businessName: 'Tea Time Pro'
  },
  ultimate: {
    name: 'Ultimate',
    price: '$19.99',
    priceId: 'price_ultimate_monthly', // Replace with actual Stripe price ID
    icon: Star,
    gradient: 'from-amber-500 to-orange-600',
    businessName: 'Tea Time Ultimate'
  }
};

const PaymentForm: React.FC<PaymentFormProps> = ({ customerId, userId, tier = 'starter', onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'general' | 'service_unavailable' | null>(null);
  const [pendingActivation, setPendingActivation] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const currentTier = tierInfo[tier];
  const TierIcon = currentTier.icon;

  const activateSubscription = async (): Promise<boolean> => {
    try {
      const { data, error: subError } = await supabase.functions.invoke('create-subscription', {
        body: { 
          action: 'activate-subscription', 
          customerId,
          userId,
          tier,
          priceId: currentTier.priceId
        }
      });

      if (subError) {
        throw new Error(subError.message || 'Failed to activate subscription');
      }

      if (data?.error) {
        // Check for service unavailable errors
        if (data.code === 'SERVICE_UNAVAILABLE' || data.code === 'GATEWAY_TIMEOUT' || data.code === 'BAD_GATEWAY') {
          setErrorType('service_unavailable');
          setError('Payment service is temporarily unavailable. Your payment was processed - click "Retry Activation" to complete your subscription.');
          setPendingActivation(true);
          return false;
        }
        throw new Error(data.error);
      }

      // Update user profile to premium with tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_premium: true,
          subscription_tier: tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: data.subscriptionId || null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        // Don't fail the whole flow if profile update fails
        // The webhook will also update the profile
      }

      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to activate subscription';
      
      if (message.includes('temporarily unavailable') || message.includes('Unable to connect') || message.includes('timed out')) {
        setErrorType('service_unavailable');
        setError('Payment service is temporarily unavailable. Your payment was processed - click "Retry Activation" to complete your subscription.');
        setPendingActivation(true);
      } else {
        setErrorType('general');
        setError(message);
      }
      return false;
    }
  };

  const handleRetryActivation = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);

    const success = await activateSubscription();
    
    if (success) {
      setPendingActivation(false);
      onSuccess();
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // Confirm the SetupIntent to save payment method
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.origin + '/payment-success?tier=' + tier },
        redirect: 'if_required',
      });

      if (setupError) {
        setError(setupError.message || 'Payment setup failed');
        setErrorType('general');
        setLoading(false);
        return;
      }

      // If setup succeeded, create the subscription
      if (setupIntent?.status === 'succeeded') {
        const success = await activateSubscription();
        
        if (success) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setErrorType('general');
    } finally {
      setLoading(false);
    }
  };

  // Show pending activation view if payment was processed but subscription activation failed
  if (pendingActivation) {
    return (
      <div className="space-y-6">
        {/* Status Card */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                Payment Received - Activation Pending
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Your payment method was saved successfully. We're experiencing temporary connectivity issues with our payment service. Click below to retry activating your subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Plan Summary */}
        <div className={`bg-gradient-to-r ${currentTier.gradient} text-white rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <TierIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{currentTier.name}</p>
              <p className="text-sm text-white/80">Pending activation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentTier.price}</p>
            <p className="text-sm text-white/80">/month</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRetryActivation}
            disabled={loading}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${currentTier.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Retry Activation
              </>
            )}
          </button>
        </div>

        {retryCount > 2 && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-xs">
            Still having issues? Contact support@teatimenetwork.app for assistance.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Plan Summary */}
      <div className={`bg-gradient-to-r ${currentTier.gradient} text-white rounded-xl p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <TierIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{currentTier.name}</p>
            <p className="text-sm text-white/80">Monthly subscription</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{currentTier.price}</p>
          <p className="text-sm text-white/80">/month</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
        <PaymentElement 
          options={{ 
            layout: 'tabs',
            business: { name: currentTier.businessName }
          }} 
        />
      </div>
      
      {error && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-start gap-2 ${
          errorType === 'service_unavailable' 
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
        <Lock className="w-3 h-3" />
        <span>Your payment info is secure and encrypted</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`flex-1 px-4 py-3 bg-gradient-to-r ${currentTier.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Subscribe {currentTier.price}/mo
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-6 opacity-50" />
      </div>
    </form>
  );
};

export default PaymentForm;
