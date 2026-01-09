import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, Sparkles, Star, ArrowRight, Loader2, Brain, MessageSquare, Dna, Activity, Cpu, Globe, Rocket, Users, Lock, Zap, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const tierConfig = {
  starter: {
    name: 'Starter',
    icon: Sparkles,
    gradient: 'from-[#7C9885] to-emerald-600',
    benefits: [
      { icon: Brain, text: 'AI-Powered Insights' },
      { icon: MessageSquare, text: 'Personal AI Coach' },
      { icon: Zap, text: 'Advanced Analytics' },
      { icon: Trophy, text: '1-Year History' },
      { text: 'Export reports (CSV, JSON, PDF)' },
      { text: 'Custom categories' },
      { text: 'Calendar heatmap' },
      { text: 'Priority email support' }
    ]
  },
  pro: {
    name: 'Pro',
    icon: Crown,
    gradient: 'from-purple-500 to-indigo-600',
    benefits: [
      { icon: Brain, text: 'Unlimited AI Conversations' },
      { icon: Lock, text: 'Private Challenges' },
      { icon: Users, text: 'Invite Friends to Challenges' },
      { icon: Zap, text: 'Social Sharing' },
      { text: 'Detailed progress graphs' },
      { text: 'Push notifications' },
      { text: 'Advanced habit correlations' },
      { text: 'Priority chat support' }
    ]
  },
  ultimate: {
    name: 'Ultimate',
    icon: Star,
    gradient: 'from-amber-500 to-orange-600',
    benefits: [
      { icon: Dna, text: 'Habit Genome Profile' },
      { icon: Activity, text: 'Life Outcome Simulator' },
      { icon: Cpu, text: 'Neuro-Feedback Integration' },
      { icon: Globe, text: 'IoT Device Integration' },
      { icon: Rocket, text: 'Habit Incubator Access' },
      { text: 'Team/Family sharing (5 users)' },
      { text: 'Guided mindfulness audio' },
      { text: 'Priority 24/7 support' }
    ]
  }
};

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const tierParam = searchParams.get('tier') as 'starter' | 'pro' | 'ultimate' | null;
  const tier = tierParam || profile?.subscription_tier || 'starter';
  const tierInfo = tierConfig[tier] || tierConfig.starter;
  const TierIcon = tierInfo.icon;

  useEffect(() => {
    const init = async () => {
      // Refresh profile to get updated premium status
      await refreshProfile();
      setLoading(false);
      
      // Trigger confetti celebration
      setTimeout(() => {
        setShowConfetti(true);
      }, 300);
    };
    init();
  }, [refreshProfile]);

  const isSuccess = searchParams.get('success') === 'true' || !searchParams.get('canceled');
  const isCanceled = searchParams.get('canceled') === 'true';

  if (isCanceled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Payment Canceled</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            No worries! You can upgrade to Premium anytime when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/habits')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7C9885] text-white rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
            >
              Return to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#7C9885] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7C9885]/10 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* CSS Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                backgroundColor: ['#7C9885', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'][Math.floor(Math.random() * 5)],
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 4s ease-out forwards;
        }
      `}</style>

      <div className="max-w-lg w-full relative z-10">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className={`w-24 h-24 bg-gradient-to-br ${tierInfo.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce`}>
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className={`absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br ${tierInfo.gradient} rounded-full flex items-center justify-center shadow-lg`}>
              <TierIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome to {tierInfo.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your subscription is now active. Time to build some amazing habits!
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${tierInfo.gradient} rounded-xl flex items-center justify-center`}>
              <TierIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{tierInfo.name} Plan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your unlocked features</p>
            </div>
          </div>
          
          <ul className="space-y-3">
            {tierInfo.benefits.map((benefit, i) => {
              const BenefitIcon = 'icon' in benefit ? benefit.icon : CheckCircle;
              return (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tierInfo.gradient} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                    <BenefitIcon className={`w-4 h-4 ${
                      tier === 'starter' ? 'text-[#7C9885]' :
                      tier === 'pro' ? 'text-purple-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  {benefit.text}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/habits')}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 bg-[#7C9885]/10 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-[#7C9885]" />
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-white">Track Habits</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start building today</p>
          </button>
          
          <button
            onClick={() => navigate('/insights')}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-white">AI Insights</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get personalized tips</p>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/habits')}
          className={`w-full py-4 bg-gradient-to-r ${tierInfo.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
        >
          Start Building Habits
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
          A receipt has been sent to your email
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
