import React from 'react';
import { Crown, Sparkles, Lock, Brain, Zap, MessageSquare, Lightbulb, Target, Dna, GitBranch, Coffee, Activity, Heart, Battery, Map, RotateCcw, Compass } from 'lucide-react';

interface PremiumAIGateProps {
  feature: 'chat' | 'suggestions' | 'insights' | 'analysis' | 'motivation' | 'genome' | 'advanced';
  onUpgrade: () => void;
}

const featureInfo = {
  chat: {
    icon: MessageSquare,
    title: 'AI Habit Coach',
    description: 'Chat with Sage, your personal AI habit coach who understands your goals and provides personalized guidance.',
    benefits: [
      'Get instant answers to habit questions',
      'Receive personalized advice based on your data',
      'Overcome challenges with expert guidance',
      'Stay motivated with encouraging conversations'
    ]
  },
  suggestions: {
    icon: Lightbulb,
    title: 'AI Habit Suggestions',
    description: 'Discover new habits tailored to your lifestyle and goals with AI-powered recommendations.',
    benefits: [
      'Get personalized habit recommendations',
      'Find habits that complement your routine',
      'Discover habits by category (health, productivity, etc.)',
      'Learn the best way to start each habit'
    ]
  },
  insights: {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Unlock deep analysis of your habit patterns with advanced AI that learns from your behavior.',
    benefits: [
      'Detailed pattern recognition',
      'Streak predictions and risk alerts',
      'Optimal timing recommendations',
      'Personalized improvement strategies'
    ]
  },
  analysis: {
    icon: Target,
    title: 'Deep Habit Analysis',
    description: 'Get a comprehensive breakdown of each habit with AI-generated improvement plans.',
    benefits: [
      'Individual habit health scores',
      'Day-by-day performance analysis',
      'Custom improvement roadmaps',
      'Habit stacking suggestions'
    ]
  },
  motivation: {
    icon: Zap,
    title: 'Daily AI Motivation',
    description: 'Start each day with personalized motivation and challenges crafted by AI.',
    benefits: [
      'Personalized daily greetings',
      'Custom challenges based on your habits',
      'Affirmations tailored to your journey',
      'Fun facts and focus tips'
    ]
  },
  genome: {
    icon: Dna,
    title: 'AI Habit Genome',
    description: 'Discover your unique behavioral DNA with our proprietary Habit Genome Mapping system.',
    benefits: [
      'Personal "Habit DNA" profile with dominant traits',
      'Life outcome simulations (lifespan, career, mental health)',
      'What-if scenario branching visualizations',
      'Custom "Habit Blend" recipes for optimal results',
      'Evolution tracking and growth milestones'
    ]
  },
  advanced: {
    icon: Compass,
    title: 'AI Coach Pro',
    description: 'Advanced AI coaching with mood tracking, energy analysis, predictive simulations, and personalized discipline blueprints.',
    benefits: [
      'Mood tracking with adaptive habit suggestions',
      'Energy pattern analysis for optimal habit timing',
      'Predictive simulations: "What if I miss tomorrow?"',
      'Personalized discipline blueprints with phased goals',
      'Recovery plans after streak breaks',
      'Psychology-backed habit stacking recommendations'
    ]
  }
};


const PremiumAIGate: React.FC<PremiumAIGateProps> = ({ feature, onUpgrade }) => {
  const info = featureInfo[feature];
  const Icon = info.icon;

  const isGenome = feature === 'genome';
  const isAdvanced = feature === 'advanced';

  return (
    <div className="relative overflow-hidden">
      {/* Background blur effect */}
      <div className={`absolute inset-0 backdrop-blur-sm ${
        isGenome || isAdvanced
          ? 'bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10' 
          : 'bg-gradient-to-br from-purple-500/5 to-indigo-500/5'
      }`} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        {/* Lock icon */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Feature icon */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
          isGenome || isAdvanced
            ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600' 
            : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}>
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Title and description */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {info.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {info.description}
        </p>

        {/* Advanced-specific feature icons */}
        {isAdvanced && (
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Mood Track</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Battery className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Energy</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Predict</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Map className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Blueprint</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Recovery</span>
            </div>
          </div>
        )}

        {/* Genome-specific feature icons */}
        {isGenome && (
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Dna className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">DNA Profile</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Life Outcomes</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">What-If</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Habit Blends</span>
            </div>
          </div>
        )}


        {/* Benefits list */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left max-w-sm mx-auto">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Premium Benefits
          </h4>
          <ul className="space-y-2">
            {info.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade button */}
        <button
          onClick={onUpgrade}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          <Crown className="w-5 h-5" />
          Upgrade to Premium
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {isGenome 
            ? 'Unlock the full Habit Genome system with Premium membership'
            : 'Unlock all AI features with Premium membership'
          }
        </p>
      </div>
    </div>
  );
};

export default PremiumAIGate;
