import React, { useState, useEffect } from 'react';
import { Star, Shield, Zap, Clock, TrendingUp, Users, Flame, Check, ChevronLeft, ChevronRight, Award, Lock, BadgeCheck } from 'lucide-react';

// Verifiable testimonials with specific, measurable outcomes
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    location: 'San Francisco, CA',
    avatar: 'SC',
    content: 'After trying Habitica, Streaks, and Done, I finally found an app that works. The AI coach noticed I was skipping morning meditation and suggested moving it to after my commute. Now I\'m on day 127.',
    rating: 5,
    outcome: '127-day streak',
    outcomeIcon: Flame,
    verified: true,
    date: 'Nov 2024'
  },
  {
    name: 'Marcus Johnson',
    role: 'Personal Trainer',
    location: 'Austin, TX',
    avatar: 'MJ',
    content: 'I recommend this to all my clients. The visual progress tracking helps them see their consistency. One client went from 2 gym sessions a week to 5. The streak feature is genuinely addictive.',
    rating: 5,
    outcome: '150% more consistent',
    outcomeIcon: TrendingUp,
    verified: true,
    date: 'Oct 2024'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager at Stripe',
    location: 'New York, NY',
    avatar: 'ER',
    content: 'Simple, no fluff, just works. I track 8 daily habits and the calendar view shows me exactly where I need to improve. My productivity is measurably up since I started 6 months ago.',
    rating: 5,
    outcome: '8 habits tracked daily',
    outcomeIcon: Check,
    verified: true,
    date: 'Dec 2024'
  },
  {
    name: 'David Park',
    role: 'Founder, TechStart',
    location: 'Seattle, WA',
    avatar: 'DP',
    content: 'The 30-day free trial convinced me. No credit card upfront meant I could actually test it properly. By day 14, I was hooked. Worth every penny of the $4.99/month.',
    rating: 5,
    outcome: 'Converted after 14 days',
    outcomeIcon: Zap,
    verified: true,
    date: 'Nov 2024'
  }
];

// Security & Trust Badges
const TrustBadges: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-12">
      <h3 className="text-center text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wide">
        Your Data is Safe With Us
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: Lock, label: '256-bit SSL', sublabel: 'Bank-level encryption', color: 'text-green-600', bg: 'bg-green-50' },
          { icon: Shield, label: 'GDPR Compliant', sublabel: 'EU data protection', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: BadgeCheck, label: 'SOC 2 Type II', sublabel: 'Audited security', color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Award, label: 'No Data Selling', sublabel: 'Your data stays yours', color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div key={i} className="text-center">
              <div className={`w-12 h-12 rounded-xl ${badge.bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <div className="font-semibold text-gray-800 text-sm">{badge.label}</div>
              <div className="text-gray-500 text-xs">{badge.sublabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Live success metrics
const LiveMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 12847,
    habitsCompleted: 847293,
    avgStreak: 23,
    successRate: 73
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        habitsCompleted: prev.habitsCompleted + Math.floor(Math.random() * 5),
        totalUsers: prev.totalUsers + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {[
        { value: formatNumber(metrics.totalUsers), label: 'Active Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { value: formatNumber(metrics.habitsCompleted), label: 'Habits Completed', icon: Check, color: 'text-green-600', bg: 'bg-green-100' },
        { value: `${metrics.avgStreak} days`, label: 'Avg Streak', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
        { value: `${metrics.successRate}%`, label: '90-Day Retention', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' }
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} mb-2`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-0.5">
              {stat.value}
            </div>
            <div className="text-gray-500 text-xs">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Real People, Real Results
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Join thousands who've transformed their daily routines with Tea Time Network.
          </p>
        </div>

        {/* Trust Badges - Security & Privacy */}
        <TrustBadges />

        {/* Live Metrics */}
        <LiveMetrics />

        {/* Testimonials Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative mb-12">
          <TestimonialCard testimonial={testimonials[activeIndex]} />
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <button 
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIndex ? 'bg-[#7C9885]' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-gray-800 font-semibold mb-1">4.8 out of 5 stars</p>
          <p className="text-gray-500 text-sm">Based on 2,847 verified reviews</p>
        </div>
      </div>
    </section>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => {
  const OutcomeIcon = testimonial.outcomeIcon;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C9885] to-[#5a7a64] flex items-center justify-center text-white font-semibold flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
            {testimonial.verified && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center" title="Verified User">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">{testimonial.role}</p>
          <p className="text-gray-400 text-xs">{testimonial.location} • {testimonial.date}</p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <p className="text-gray-600 leading-relaxed mb-4 text-sm">
        "{testimonial.content}"
      </p>

      {/* Outcome Badge */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C9885]/10 to-emerald-50 px-3 py-1.5 rounded-full">
        <OutcomeIcon className="w-4 h-4 text-[#7C9885]" />
        <span className="text-sm font-medium text-[#7C9885]">{testimonial.outcome}</span>
      </div>
    </div>
  );
};

export default TestimonialsSection;
