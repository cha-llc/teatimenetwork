import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'signin' }) => {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}?reset=true`
        });
        if (error) throw error;
        setSuccess('Password reset email sent! Check your inbox.');
      } else if (tab === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccess('Account created! Please check your email to verify your account.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="relative bg-gradient-to-r from-[#7C9885] to-[#5a7a64] p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🍵</span>
            </div>
            <h2 className="text-xl font-bold">The Tea Time Network</h2>
          </div>

          <p className="text-white/80 text-sm">
            {tab === 'forgot' ? 'Enter your email to reset your password.' : tab === 'signin' ? 'Welcome back! Sign in to continue.' : 'Create your account to start building discipline.'}
          </p>
        </div>

        {tab !== 'forgot' && (
          <div className="flex border-b border-gray-200">
            <button onClick={() => setTab('signin')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'signin' ? 'text-[#7C9885] border-b-2 border-[#7C9885]' : 'text-gray-500 hover:text-gray-700'}`}>Sign In</button>
            <button onClick={() => setTab('signup')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'signup' ? 'text-[#7C9885] border-b-2 border-[#7C9885]' : 'text-gray-500 hover:text-gray-700'}`}>Sign Up</button>
          </div>
        )}

        {tab === 'forgot' && (
          <button onClick={() => setTab('signin')} className="flex items-center gap-2 px-6 pt-4 text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">{success}</div>}

          {tab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all" placeholder="John Doe" required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all" placeholder="you@example.com" required />
          </div>

          {tab !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all pr-12" placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {tab === 'signin' && (
            <button type="button" onClick={() => { setTab('forgot'); setError(''); setSuccess(''); }} className="text-sm text-[#7C9885] hover:underline">Forgot your password?</button>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {tab === 'forgot' ? 'Send Reset Link' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
