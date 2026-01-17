import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { X, Check, Crown, Sparkles, Clock, AlertTriangle, Loader2, Brain, MessageSquare, Lightbulb, Zap, Dna, Activity, Cpu, Globe, Rocket, Trophy, Star, Users, Lock, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import PaymentForm from './PaymentForm';
import { toast } from '@/components/ui/use-toast';
import type { PricingTier } from '@/components/pricing/PricingSection';

// Initialize Stripe with the publishable key and connected account
const stripePromise = loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', {
  stripeAccount: 'acct_1SidUeQgPuaoshpO'
});

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: PricingTier;
}

const tierConfig = {
  starter: {
    name: 'Starter',
    price: '$4.99',
    priceAmount: 499,
    color: 'from-[#7C9885] to-emerald-600',
    icon: Sparkles,
    description: 'Perfect for building your first habits',
    features: [
      'Unlimited habits',
      '1-year history',
      'Advanced analytics',
      'AI-narrated summaries',
      'Lifetime trend forecasts',
      'Export reports (CSV, JSON, PDF)',
      'Custom categories',
      'Priority email support'
    ],
    highlights: [
      { icon: Brain, text: 'AI-Powered Insights' },
      { icon: MessageSquare, text: 'Personal AI Coach' },
      { icon: Lightbulb, text: 'Smart Suggestions' },
      { icon: Zap, text: 'Daily AI Motivation' }
    ]
  },
  pro: {
    name: 'Pro',
    price: '$9.99',
    priceAmount: 999,
    color: 'from-purple-500 to-indigo-600',
    icon: Crown,
    description: 'Full AI coaching experience',
    features: [
      'Everything in Starter',
      'Unlimited AI conversations',
      'Private challenges',
      'Invite friends to challenges',
      'Social sharing',
      'Detailed progress graphs',
      'Push notifications',
      'Priority support'
    ],
    highlights: [
      { icon: Lock, text: 'Private Challenges' },
      { icon: Users, text: 'Invite Friends' },
      { icon: Brain, text: 'Unlimited AI Chat' },
      { icon: Zap, text: 'Eco Challenges' }
    ]
  },
  ultimate: {
    name: 'Ultimate',
    price: '$19.99',
    priceAmount: 1999,
    color: 'from-amber-500 to-orange-600',
    icon: Star,
    description: 'Complete habit mastery with advanced tools',
    features: [
      'Everything in Pro',
      'Priority 24/7 support',
      'Early access to features',
      'Custom habit templates',
      'Team/Family sharing (5 users)',
      'Guided mindfulness audio',
      'Carbon offset donations'
    ],
    highlights: [
      { icon: Dna, text: 'Habit Genome Profile' },
      { icon: Activity, text: 'Life Outcome Simulator' },
      { icon: Cpu, text: 'Neuro-Feedback Integration' },
      { icon: Globe, text: 'IoT Device Integration' },
      { icon: Rocket, text: 'Habit Incubator Access' },
      { icon: Trophy, text: 'Lead Community Challenges' }
    ]
  }
};


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, selectedTier = 'starter' }) => {
  const { user, profile, trialStatus, refreshProfile } = useAuth();
  const [step, setStep] = useState<'info' | 'payment' | 'unavailable'>('info');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<PricingTier>(selectedTier);
  const [gatewayStatus, setGatewayStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('info');
      setClientSecret(null);
      setCustomerId(null);
      setCurrentTier(selectedTier);
      setGatewayStatus('checking');
      checkGatewayHealth();
    }
  }, [isOpen, selectedTier]);

  const checkGatewayHealth = async () => {
    setGatewayStatus('checking');
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { action: 'health-check' }
      });

      if (error || data?.status === 'degraded' || data?.gateway === 'unavailable') {
        setGatewayStatus('unavailable');
      } else {
        setGatewayStatus('available');
      }
    } catch (err) {
      console.error('Gateway health check failed:', err);
      setGatewayStatus('unavailable');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    checkGatewayHealth();
  };

  const tier = tierConfig[currentTier];
  const TierIcon = tier.icon;

  const isExpired = trialStatus.isTrialExpired;
  const isWarning = trialStatus.daysRemaining <= 7 && !isExpired;

  const handleStartPayment = async () => {
    if (!user || !profile) return;

    // Check gateway status first
    if (gatewayStatus === 'unavailable') {
      setStep('unavailable');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: profile.email,
          name: profile.full_name || profile.email.split('@')[0],
          userId: user.id,
          action: 'create-setup-intent',
          tier: currentTier,
          priceAmount: tier.priceAmount
        }
      });

      if (error || data?.error) {
        // Check if it's a service unavailable error
        if (data?.code === 'SERVICE_UNAVAILABLE' || error?.message?.includes('503')) {
          setStep('unavailable');
          return;
        }
        throw new Error(data?.error || error?.message || 'Failed to initialize payment');
      }

      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId);
      setStep('payment');
    } catch (err: any) {
      if (err.message?.includes('temporarily unavailable') || err.message?.includes('Unable to connect')) {
        setStep('unavailable');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to start payment process',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await refreshProfile();
    toast({
      title: `Welcome to ${tier.name}!`,
      description: `Your ${tier.name} subscription is now active. Enjoy all your new features!`,
    });
    onClose();
  };

  const handleCancel = () => {
    setStep('info');
    setClientSecret(null);
    setCustomerId(null);
  };

  // Service Unavailable View
  if (step === 'unavailable') {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 flex flex-col">
          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 pr-1">
          {/* Header */}
          <div className="relative p-8 text-white text-center bg-gradient-to-br from-gray-500 to-gray-600">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Payment Service Unavailable</h2>
            <p className="text-white/80 text-sm">
              We're experiencing temporary connectivity issues
            </p>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Payment gateway temporarily unavailable
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Our payment service is currently experiencing issues. This is usually resolved within a few minutes. Your data is safe.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={gatewayStatus === 'checking'}
                className="w-full py-3 px-4 bg-[#7C9885] hover:bg-[#6B8574] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {gatewayStatus === 'checking' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('info')}
                className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>

            <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
              If this issue persists, please contact support@teatimenetwork.app
            </p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 pr-1">
        {/* Header */}
        <div className={`relative p-8 text-white text-center bg-gradient-to-br ${
          isExpired 
            ? 'from-red-500 to-rose-600'
            : isWarning
              ? 'from-amber-500 to-orange-500'
              : tier.color
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Trial Status Badge */}
          {isExpired ? (
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <AlertTriangle className="w-4 h-4" />
              Trial Expired
            </div>
          ) : isWarning ? (
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''} left
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <TierIcon className="w-4 h-4" />
              {tier.name}
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-2">
            {step === 'payment' 
              ? 'Complete Your Subscription'
              : isExpired 
                ? 'Continue Your Journey' 
                : isWarning 
                  ? 'Don\'t Lose Your Progress'
                  : `Unlock ${tier.name} Features`}
          </h2>
          <p className="text-white/80 text-sm">
            {step === 'payment'
              ? 'Enter your payment details to activate your subscription'
              : tier.description}
          </p>
        </div>

        <div className="p-6">
          {step === 'info' ? (
            <>
              {/* Gateway Status Warning */}
              {gatewayStatus === 'unavailable' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>Payment service is temporarily unavailable</span>
                    <button 
                      onClick={handleRetry}
                      className="ml-auto text-amber-600 dark:text-amber-400 hover:underline text-xs"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {gatewayStatus === 'checking' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking payment service...</span>
                  </div>
                </div>
              )}

              {/* Tier Selector */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                {(['starter', 'pro', 'ultimate'] as PricingTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCurrentTier(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      currentTier === t
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tierConfig[t].name}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-800 dark:text-white">{tier.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Cancel anytime</p>
              </div>

              {/* Highlights */}
              {tier.highlights.length > 0 && (
                <div className={`bg-gradient-to-r ${
                  currentTier === 'starter' ? 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800' :
                  currentTier === 'pro' ? 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800' :
                  'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
                } rounded-xl p-4 mb-6 border`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TierIcon className={`w-5 h-5 ${
                      currentTier === 'starter' ? 'text-emerald-600 dark:text-emerald-400' :
                      currentTier === 'pro' ? 'text-purple-600 dark:text-purple-400' :
                      'text-amber-600 dark:text-amber-400'
                    }`} />
                    <span className={`font-semibold ${
                      currentTier === 'starter' ? 'text-emerald-800 dark:text-emerald-300' :
                      currentTier === 'pro' ? 'text-purple-800 dark:text-purple-300' :
                      'text-amber-800 dark:text-amber-300'
                    }`}>
                      Key Features
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tier.highlights.map((highlight, i) => {
                      const Icon = highlight.icon;
                      return (
                        <div key={i} className={`flex items-center gap-2 text-sm ${
                          currentTier === 'starter' ? 'text-emerald-700 dark:text-emerald-300' :
                          currentTier === 'pro' ? 'text-purple-700 dark:text-purple-300' :
                          'text-amber-700 dark:text-amber-300'
                        }`}>
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{highlight.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentTier === 'starter' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      currentTier === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        currentTier === 'starter' ? 'text-emerald-600 dark:text-emerald-400' :
                        currentTier === 'pro' ? 'text-purple-600 dark:text-purple-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleStartPayment}
                disabled={loading || gatewayStatus === 'checking'}
                className={`w-full py-4 rounded-xl font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r ${tier.color} ${
                  currentTier === 'starter' ? 'hover:shadow-emerald-500/25' :
                  currentTier === 'pro' ? 'hover:shadow-purple-500/25' :
                  'hover:shadow-amber-500/25'
                }`}
              >
                {loading || gatewayStatus === 'checking' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <TierIcon className="w-5 h-5" />
                )}
                {gatewayStatus === 'unavailable' 
                  ? 'Service Unavailable' 
                  : isExpired 
                    ? 'Upgrade Now' 
                    : 'Continue to Payment'}
              </button>

              <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
                Secure payment powered by Stripe
              </p>
            </>
          ) : clientSecret && customerId && user ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: currentTier === 'starter' ? '#7C9885' : currentTier === 'pro' ? '#8b5cf6' : '#f59e0b',
                    borderRadius: '12px',
                  }
                }
              }}
            >
              <PaymentForm 
                customerId={customerId}
                userId={user.id}
                tier={currentTier}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#7C9885]" />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
