import React, { useState, useEffect } from 'react';
import { ArrowRight, Gift, Check, Shield, Zap, Play, TrendingUp, Target, Flame, Lock, Award, Users, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroSectionProps {
  onGetStarted: () => void;
}

// Quick Habit Quiz - Engagement Hook
const QuickHabitQuiz: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: "What's your biggest habit challenge?",
      options: [
        { label: "Starting new habits", icon: "🌱" },
        { label: "Staying consistent", icon: "📅" },
        { label: "Tracking progress", icon: "📊" },
        { label: "Staying motivated", icon: "💪" }
      ]
    },
    {
      question: "How many habits do you want to build?",
      options: [
        { label: "1-3 habits", icon: "🎯" },
        { label: "4-6 habits", icon: "⚡" },
        { label: "7-10 habits", icon: "🚀" },
        { label: "10+ habits", icon: "🏆" }
      ]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Perfect Match!</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Based on your answers, Tea Time Network can help you build <span className="font-semibold text-[#7C9885]">{answers[1]}</span> with features designed for <span className="font-semibold text-[#7C9885]">{answers[0].toLowerCase()}</span>.
        </p>
        <div className="bg-emerald-50 rounded-xl p-4 mb-4">
          <p className="text-emerald-700 text-sm font-medium">
            Users like you see 73% better habit consistency within 30 days
          </p>
        </div>
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Start Free Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-[#7C9885] to-emerald-500 transition-all duration-300"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>
      
      <div className="p-6">
        <div className="text-xs text-gray-500 mb-2 font-medium">
          QUICK QUIZ • {step + 1} of {questions.length}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {questions[step].question}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {questions[step].options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(option.label)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-[#7C9885] hover:bg-[#7C9885]/5 transition-all text-center"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Compact Live Stats with Social Proof
const SocialProofBar: React.FC = () => {
  const [stats, setStats] = useState({
    habitsToday: 12847,
    activeUsers: 2341
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        habitsToday: prev.habitsToday + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{stats.activeUsers.toLocaleString()}</span> active now
        </span>
      </div>
      <div className="w-px h-4 bg-gray-200" />
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="font-semibold text-gray-800">{stats.habitsToday.toLocaleString()}</span> habits today
      </div>
    </div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { language } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(true);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-[#7C9885]/5" />
      
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#7C9885]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Social Proof Bar */}
        <div className="flex justify-center mb-8">
          <SocialProofBar />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Primary Badge - 30 Day Trial - MOST PROMINENT */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg shadow-emerald-500/25">
              <Gift className="w-4 h-4" />
              30 DAYS FREE • NO CREDIT CARD
            </div>
            
            {/* Strong, Outcome-Focused Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {language === 'es' ? 'Construye ' : 'Build '}
              <span className="bg-gradient-to-r from-[#7C9885] to-emerald-600 bg-clip-text text-transparent">
                {language === 'es' ? 'Hábitos Que Duran' : 'Habits That Last'}
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-700">
                {language === 'es' ? 'en Solo 2 Minutos al Día' : 'in Just 2 Minutes a Day'}
              </span>
            </h1>
            
            {/* Specific, Benefit-Driven Subheadline */}
            <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {language === 'es' 
                ? 'El 73% de nuestros usuarios mantienen sus hábitos después de 90 días. Seguimiento simple, recordatorios inteligentes, y un coach de IA que te mantiene en el camino.'
                : '73% of our users maintain their habits after 90 days. Simple tracking, smart reminders, and an AI coach that keeps you on track.'}
            </p>

            {/* 3 Key Differentiators - Ultra Simple */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center lg:justify-start">
              {[
                { icon: Target, text: language === 'es' ? 'Hábitos ilimitados' : 'Unlimited habits' },
                { icon: Flame, text: language === 'es' ? 'Rachas motivadoras' : 'Streak motivation' },
                { icon: Sparkles, text: language === 'es' ? 'Coach IA incluido' : 'AI coach included' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#7C9885]/25 transition-all transform hover:-translate-y-0.5"
              >
                {language === 'es' ? 'Empezar Gratis' : 'Start Free Today'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a 
                href="#how-it-works" 
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-4 rounded-xl font-medium border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <Play className="w-5 h-5 text-[#7C9885]" />
                {language === 'es' ? 'Ver Demo' : 'Watch Demo'}
              </a>
            </div>

            {/* Trust & Privacy Indicators - Addressing Data Concerns */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4 text-green-600" />
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Award className="w-4 h-4 text-amber-500" />
                <span>4.8/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right content - Interactive Quiz */}
          <div className="relative">
            <div className="relative z-10">
              {showQuiz ? (
                <QuickHabitQuiz onComplete={() => {
                  setShowQuiz(false);
                  onGetStarted();
                }} />
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">You're All Set!</h3>
                  <p className="text-gray-600 mb-4">Start building your habits today.</p>
                  <button
                    onClick={onGetStarted}
                    className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-semibold"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
            
            {/* Background decoration */}
            <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 bg-gradient-to-br from-[#7C9885]/10 to-emerald-100/30 rounded-3xl" />
          </div>
        </div>

        {/* Bottom Social Proof - Company Logos/Press */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-center text-sm text-gray-400 mb-6">TRUSTED BY TEAMS AT</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale">
            {['Google', 'Microsoft', 'Spotify', 'Airbnb', 'Stripe'].map((company, i) => (
              <div key={i} className="text-gray-400 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
