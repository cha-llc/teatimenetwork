import React from 'react';
import { 
  Target, 
  Flame, 
  Brain,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'One-Tap Tracking',
    description: 'Track any habit with a single tap. No complicated setup, no learning curve. Just open, tap, done.',
    color: '#7C9885',
    highlight: 'Takes 10 seconds'
  },
  {
    icon: Flame,
    title: 'Streak Motivation',
    description: 'Visual streaks that motivate you to never break the chain. Watch your consistency grow day by day.',
    color: '#F97316',
    highlight: 'Avg 23-day streaks'
  },
  {
    icon: Brain,
    title: 'AI Coach',
    description: 'Get personalized tips from Sage, your AI habit coach. Smart suggestions based on your patterns.',
    color: '#8B5CF6',
    highlight: 'Included free'
  }
];

interface FeaturesSectionProps {
  onGetStarted?: () => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-4 bg-white" id="features">
      <div className="max-w-5xl mx-auto">
        {/* Section Header - Simple & Clear */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Simple Tools, Real Results
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            No bloat. No complexity. Just what you need to build habits that stick.
          </p>
        </div>

        {/* Features - Just 3 Core Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group"
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-3 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Highlight Badge */}
              <span 
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${feature.color}10`, color: feature.color }}
              >
                <Check className="w-3 h-3" />
                {feature.highlight}
              </span>
            </div>
          ))}
        </div>

        {/* Comparison Table - Why We're Different */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
            Why Users Switch to Tea Time Network
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Feature</th>
                  <th className="text-center py-3 px-4">
                    <div className="inline-flex items-center gap-2 bg-[#7C9885]/10 text-[#7C9885] px-3 py-1 rounded-full text-sm font-semibold">
                      Tea Time
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 text-gray-400 text-sm">Other Apps</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'Free trial length', us: '30 days', them: '7 days' },
                  { feature: 'Credit card required', us: false, them: true },
                  { feature: 'AI coaching', us: true, them: false },
                  { feature: 'Unlimited habits', us: true, them: false },
                  { feature: 'Setup time', us: '2 min', them: '10+ min' }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.us === 'boolean' ? (
                        row.us ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="font-semibold text-[#7C9885]">{row.us}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {typeof row.them === 'boolean' ? (
                        row.them ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span>{row.them}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#7C9885]/20 transition-all"
          >
            Try Free for 30 Days
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-500 text-sm mt-3">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
