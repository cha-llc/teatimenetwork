import React from 'react';
import { ArrowRight, Gift, Shield, Zap, Lock, CreditCard, Clock } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#7C9885] to-[#4a6a54] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-bold mb-6">
          <Gift className="w-4 h-4" />
          30 DAYS FREE • NO CREDIT CARD
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Start Building Better Habits Today
        </h2>

        {/* Subheadline - Specific Outcome */}
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join 12,000+ users who've built lasting habits. Most see results within the first week.
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 bg-white text-[#7C9885] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105"
        >
          Start Your Free Trial
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Trust indicators - Addressing Privacy Concerns */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Privacy Reassurance */}
        <p className="text-white/60 text-sm mt-6 max-w-lg mx-auto">
          Your data is encrypted and never sold. We're GDPR compliant and you can export or delete your data anytime.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
