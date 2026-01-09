import React, { useState } from 'react';
import { Check, Crown, Clock, Shield, CreditCard, Gift, ArrowRight, Sparkles, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionModal from '@/components/payment/SubscriptionModal';

interface PricingSectionProps {
  onSignUp?: () => void;
}

export type PricingTier = 'starter' | 'pro' | 'ultimate';

// FAQ Component to address common concerns
const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Do I need a credit card to start?',
      answer: 'No! Your 30-day free trial requires no credit card. You only enter payment info if you decide to upgrade after the trial.'
    },
    {
      question: 'What happens after my free trial?',
      answer: 'After 30 days, you can continue with limited features for free, or upgrade to Premium for $4.99/month. We\'ll remind you before your trial ends.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, cancel with one click anytime. No questions asked, no hidden fees. Your data remains accessible even after canceling.'
    },
    {
      question: 'Is my data safe?',
      answer: 'Absolutely. We use 256-bit encryption, are GDPR compliant, and never sell your data. You can export or delete your data anytime.'
    }
  ];

  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
        Common Questions
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600 text-sm">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingSection: React.FC<PricingSectionProps> = ({ onSignUp }) => {
  const { user, profile, trialStatus } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier>('starter');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const handleUpgrade = (tier: PricingTier) => {
    if (!user || !profile) {
      onSignUp?.();
      return;
    }
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const isOnTrial = user && !profile?.is_premium && !trialStatus.isTrialExpired;
  const isTrialExpired = user && !profile?.is_premium && trialStatus.isTrialExpired;
  const isPremium = profile?.is_premium;

  const freeFeatures = [
    'Unlimited habit tracking',
    'Streak counters & badges',
    'Calendar heatmap view',
    'Daily reminders',
    'Basic AI suggestions'
  ];

  const premiumFeatures = [
    'Everything in Free, plus:',
    'Unlimited AI coach conversations',
    'Advanced analytics & insights',
    'Export reports (CSV, PDF)',
    'Priority support',
    'Unlimited history'
  ];

  const monthlyPrice = 4.99;
  const annualPrice = 2.99;

  return (
    <>
      <section className="py-20 px-4 bg-gray-50" id="pricing">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Gift className="w-4 h-4" />
              30-Day Free Trial
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Start free for 30 days. No credit card required. Upgrade only if you love it.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-800' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingPeriod === 'annual' ? 'bg-[#7C9885]' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                billingPeriod === 'annual' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-medium ${billingPeriod === 'annual' ? 'text-gray-800' : 'text-gray-400'}`}>
              Annual
            </span>
            {billingPeriod === 'annual' && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                Save 40%
              </span>
            )}
          </div>

          {/* Pricing Cards - 2 Tiers Only */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Free Trial Card */}
            <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
              isOnTrial ? 'border-emerald-400 bg-white' : 'border-gray-200 bg-white'
            }`}>
              {isOnTrial && (
                <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-1.5 text-sm font-medium">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {trialStatus.daysRemaining} days remaining
                </div>
              )}
              
              <div className={`p-8 ${isOnTrial ? 'pt-12' : ''}`}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Free Trial</h3>
                  <p className="text-gray-500 text-sm">Try everything for 30 days</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">$0</span>
                  <span className="text-gray-500 ml-2">for 30 days</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {freeFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onSignUp}
                  disabled={isOnTrial || isPremium}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isOnTrial || isPremium
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {isOnTrial ? 'Current Plan' : isPremium ? 'Completed' : 'Start Free Trial'}
                  {!isOnTrial && !isPremium && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-center text-gray-400 text-xs mt-3">
                  No credit card required
                </p>
              </div>
            </div>

            {/* Premium Card */}
            <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
              isPremium ? 'border-[#7C9885] bg-[#7C9885]/5' : 'border-[#7C9885] bg-white'
            }`}>
              {/* Best Value Badge */}
              <div className="absolute -top-0 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-4 py-1.5 rounded-b-xl text-sm font-bold shadow-lg">
                  <Crown className="w-4 h-4" />
                  MOST POPULAR
                </span>
              </div>
              
              <div className="p-8 pt-12">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Premium</h3>
                  <p className="text-gray-500 text-sm">Full access to all features</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">
                    ${billingPeriod === 'annual' ? annualPrice : monthlyPrice}
                  </span>
                  <span className="text-gray-500 ml-2">/month</span>
                  {billingPeriod === 'annual' && (
                    <div className="text-sm text-emerald-600 font-medium mt-1">
                      Billed annually (${(annualPrice * 12).toFixed(0)}/year)
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {premiumFeatures.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-3 ${i === 0 ? 'text-[#7C9885] font-medium' : 'text-gray-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        i === 0 ? 'bg-[#7C9885]/20' : 'bg-[#7C9885]/10'
                      }`}>
                        {i === 0 ? <Sparkles className="w-3 h-3 text-[#7C9885]" /> : <Check className="w-3 h-3 text-[#7C9885]" />}
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade('starter')}
                  disabled={isPremium}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isPremium
                      ? 'bg-[#7C9885]/20 text-[#7C9885] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white hover:shadow-lg hover:shadow-[#7C9885]/20'
                  }`}
                >
                  {isPremium ? 'Current Plan' : isTrialExpired ? 'Upgrade Now' : 'Upgrade to Premium'}
                  {!isPremium && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-center text-gray-400 text-xs mt-3">
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Powered by Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQ />
        </div>
      </section>

      {/* Payment Modal */}
      <SubscriptionModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
      />
    </>
  );
};

export default PricingSection;
