import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/ui/AuthModal';
import Dashboard from '@/components/dashboard/Dashboard';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/pricing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import { GuidedTour } from '@/components/onboarding/GuidedTour';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';

// Password Reset Component
const PasswordReset: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C9885]/10 via-white to-[#F4A460]/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#7C9885] to-[#5a7a64] p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍵</span>
          </div>
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-white/80 text-sm mt-2">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Password Updated!</h3>
              <p className="text-gray-600 text-sm">Redirecting you to the app...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all pr-12" placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all" placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Update Password
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'signin' | 'signup' }>({ open: false, tab: 'signin' });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      setShowPasswordReset(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('success') === 'true' || params.get('canceled') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Check for tour param to force show tour
    if (params.get('tour') === 'true') {
      setShowTour(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const openSignIn = () => setAuthModal({ open: true, tab: 'signin' });
  const openSignUp = () => setAuthModal({ open: true, tab: 'signup' });
  const closeAuth = () => setAuthModal({ open: false, tab: 'signin' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7C9885]/10 via-white to-[#F4A460]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C9885] to-[#F4A460] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🍵</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showPasswordReset) {
    return <PasswordReset onComplete={() => setShowPasswordReset(false)} />;
  }

  if (user) {
    return (
      <>
        <Dashboard />
        <Footer />
        {/* Guided Tour for logged in users */}
        <GuidedTour 
          forceShow={showTour} 
          onComplete={() => setShowTour(false)} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSignIn={openSignIn} onSignUp={openSignUp} />
      <main>
        <HeroSection onGetStarted={openSignUp} />
        <FeaturesSection onGetStarted={openSignUp} />
        <HowItWorksSection onGetStarted={openSignUp} />
        <TestimonialsSection />
        <PricingSection onSignUp={openSignUp} />
        <CTASection onGetStarted={openSignUp} />
      </main>
      <Footer />
      <AuthModal isOpen={authModal.open} onClose={closeAuth} defaultTab={authModal.tab} />
    </div>
  );


};

const AppLayout: React.FC = () => {
  return <AppContent />;
};

export default AppLayout;
