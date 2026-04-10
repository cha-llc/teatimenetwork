import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Check } from 'lucide-react';

interface SubscriptionLockedProps {
  currentStatus: 'free' | 'active' | 'expired';
  requiredStatus?: 'free' | 'active' | 'expired';
  contentName?: string;
}

/**
 * SubscriptionLocked - Paywall component for subscription-gated content
 * 
 * Tone: Support + Structure + Continuity
 * NOT: Guilt, pressure, scarcity, countdown
 * 
 * This is where the work continues.
 */
const SubscriptionLocked: React.FC<SubscriptionLockedProps> = ({
  currentStatus,
  requiredStatus = 'active',
  contentName = 'this content'
}) => {
  const navigate = useNavigate();

  const getMessages = () => {
    if (currentStatus === 'free') {
      return {
        title: 'This is where the work continues.',
        subtitle: 'Unlock the full experience',
        description: `Upgrade your subscription to access ${contentName} and build discipline at scale.`,
        cta: 'Upgrade Now'
      };
    } else if (currentStatus === 'expired') {
      return {
        title: 'Your subscription has ended.',
        subtitle: 'Renew to continue',
        description: `Your subscription expired. Renew to regain access to ${contentName} and keep your progress intact.`,
        cta: 'Renew Subscription'
      };
    }
    return {
      title: 'Access locked',
      subtitle: 'Upgrade required',
      description: `${contentName} requires an active subscription.`,
      cta: 'Upgrade Now'
    };
  };

  const messages = getMessages();

  const features = [
    'All replays & Tea Time Notes',
    'Challenges & accountability tools',
    'Full execution suite',
    'Workbook links & resources',
    'Priority support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C9885]/10 via-white to-[#F4A460]/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7C9885] to-[#5a7a64] p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{messages.title}</h1>
            <p className="text-white/90">{messages.subtitle}</p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-10">
            {/* Description */}
            <p className="text-lg text-gray-700 mb-8 text-center leading-relaxed">
              {messages.description}
            </p>

            {/* Features Grid */}
            <div className="bg-[#7C9885]/5 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                With an active subscription:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-[#7C9885] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Status */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Current status:</span> {' '}
                {currentStatus === 'free' && 'Free account (limited access)'}
                {currentStatus === 'active' && 'Active subscription'}
                {currentStatus === 'expired' && 'Expired subscription (read-only access)'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                {messages.cta}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-[#7C9885] hover:text-[#7C9885] transition-all"
              >
                View pricing
              </button>
            </div>

            {/* Back Link */}
            <button
              onClick={() => navigate(-1)}
              className="mt-8 w-full inline-flex items-center justify-center gap-2 text-[#7C9885] hover:text-[#5a7a64] font-medium transition-colors py-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go back
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            🔒 Secure payments with Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionLocked;
