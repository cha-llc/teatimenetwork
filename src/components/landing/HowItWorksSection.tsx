import React from 'react';
import { UserPlus, ListTodo, Trophy, ArrowRight, Clock, Check } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up in 30 Seconds',
    description: 'No credit card. No lengthy forms. Just your email and you\'re in.',
    color: '#7C9885',
    time: '30 sec'
  },
  {
    icon: ListTodo,
    title: 'Add Your First Habit',
    description: 'Pick from templates or create your own. Set your schedule and reminders.',
    color: '#3B82F6',
    time: '1 min'
  },
  {
    icon: Trophy,
    title: 'Start Building Streaks',
    description: 'Check off habits daily. Watch your streaks grow. Celebrate your wins.',
    color: '#F59E0B',
    time: 'Ongoing'
  }
];

interface HowItWorksSectionProps {
  onGetStarted?: () => void;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-4 bg-white" id="how-it-works">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            Ready in Under 2 Minutes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Getting Started is Easy
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            No complicated setup. No learning curve. Just start tracking.
          </p>
        </div>

        {/* Steps - Vertical Timeline */}
        <div className="relative max-w-2xl mx-auto mb-12">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C9885] via-[#3B82F6] to-[#F59E0B] hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-6">
                {/* Step Icon */}
                <div
                  className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-white flex-shrink-0"
                  style={{ border: `2px solid ${step.color}` }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: step.color }}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {step.title}
                    </h3>
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${step.color}15`, color: step.color }}
                    >
                      {step.time}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Time Callout */}
        <div className="bg-gradient-to-r from-[#7C9885]/5 to-emerald-50 rounded-2xl p-6 text-center mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Check className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold text-gray-800">
              Total setup time: Under 2 minutes
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Most users complete their first habit check-in within 90 seconds of signing up.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#7C9885]/20 transition-all"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-500 text-sm mt-3">
            30 days free • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
