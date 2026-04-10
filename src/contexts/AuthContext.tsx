import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type SubscriptionStatus = 'free' | 'active' | 'expired';
type UserRole = 'user' | 'admin';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: string;
  // Authentication & Access Control
  role: UserRole;
  subscription_status: SubscriptionStatus;
  // Reminders & Preferences
  reminder_time: string;
  reminder_enabled: boolean;
  timezone: string;
  // Legacy (kept for backward compatibility)
  is_premium: boolean;
  is_admin: boolean;
  subscription_tier: 'starter' | 'pro' | 'ultimate' | null;
  trial_started_at: string | null;
  // Metadata
  created_at?: string;
  updated_at?: string;
}

interface TrialStatus {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  trialStatus: TrialStatus;
  // Access control helpers
  isPremium: boolean;
  isAdmin: boolean;
  subscriptionStatus: SubscriptionStatus;
  userRole: UserRole;
  canAccess: (requiredRole?: UserRole, requiredSubscription?: SubscriptionStatus) => boolean;
  // Auth methods
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const TRIAL_DURATION_DAYS = 30;
const AUTH_TIMEOUT_MS = 5000; // 5 second timeout (reduced from 10)

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const initializationComplete = useRef(false);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        // Normalize subscription status
        const profile: Profile = {
          ...data,
          role: data.role || 'user',
          subscription_status: data.subscription_status || 'free',
        };

        // Migrate existing users to trial if they don't have trial_started_at
        if (!profile.trial_started_at && !profile.is_premium) {
          const trialStartDate = new Date().toISOString();
          await supabase
            .from('profiles')
            .update({ trial_started_at: trialStartDate })
            .eq('id', userId);
          profile.trial_started_at = trialStartDate;
        }
        
        setProfile(profile);
        return profile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };


  // Calculate trial status
  const trialStatus = useMemo((): TrialStatus => {
    // Premium users don't have trial restrictions
    if (profile?.is_premium) {
      return {
        isTrialActive: false,
        isTrialExpired: false,
        daysRemaining: 0,
        trialEndDate: null
      };
    }

    // If no trial_started_at, assume trial just started (for existing users)
    const trialStartDate = profile?.trial_started_at 
      ? new Date(profile.trial_started_at) 
      : new Date();
    
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);
    
    const now = new Date();
    const timeDiff = trialEndDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    const isTrialExpired = daysRemaining <= 0;
    const isTrialActive = !isTrialExpired;

    return {
      isTrialActive,
      isTrialExpired,
      daysRemaining,
      trialEndDate
    };
  }, [profile?.is_premium, profile?.trial_started_at]);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initializationComplete.current) return;
    
    let isMounted = true;
    let hasCompleted = false;
    
    const completeInitialization = () => {
      if (!hasCompleted && isMounted) {
        hasCompleted = true;
        initializationComplete.current = true;
        setLoading(false);
      }
    };

    // Safety timeout to prevent infinite loading - this is the key fix
    const timeoutId = setTimeout(() => {
      if (!hasCompleted) {
        // WARN: 'Auth initialization timed out after', AUTH_TIMEOUT_MS, 'ms'
        completeInitialization();
      }
    }, AUTH_TIMEOUT_MS);

    const initializeAuth = async () => {
      try {
        // Use Promise.race to ensure we don't hang forever
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null }, error: null }), AUTH_TIMEOUT_MS - 500);
        });
        
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        const { data: { session }, error } = result;
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (isMounted && !hasCompleted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Don't wait for profile fetch to complete loading
            fetchProfile(session.user.id).catch(console.error);
          }
          
          completeInitialization();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        completeInitialization();
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id).catch(console.error);
        } else {
          setProfile(null);
        }
        
        // Make sure loading is false after any auth state change
        if (!hasCompleted) {
          completeInitialization();
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('Email, password, and full name are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Check if Supabase is configured
      if (!process.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error(
          '⚠️ Supabase is not configured. Please add environment variables:\n' +
          'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n\n' +
          'For Vercel:\n' +
          '1. Go to dashboard: https://vercel.com/dashboard/teatimenetwork\n' +
          '2. Settings → Environment Variables\n' +
          '3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
          '4. Redeploy'
        );
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Check for Supabase configuration errors
        if (error.message?.includes('Project not found') || error.message?.includes('dummy')) {
          throw new Error(
            '⚠️ Supabase configuration error: Project not found\n\n' +
            'This means environment variables are missing or invalid.\n\n' +
            'TO FIX:\n' +
            '1. Go to: https://vercel.com/dashboard/teatimenetwork\n' +
            '2. Click: Settings → Environment Variables\n' +
            '3. Add:\n' +
            '   - VITE_SUPABASE_URL (your Supabase URL)\n' +
            '   - VITE_SUPABASE_ANON_KEY (your Supabase anon key)\n' +
            '4. Redeploy the application\n\n' +
            'Get credentials from: https://supabase.com/dashboard\n' +
            'Project → Settings → API'
          );
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      // Manual profile creation as fallback if trigger doesn't work
      // This ensures the profile is created even if the database trigger fails
      try {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          display_name: fullName,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          role: 'user',
          subscription_status: 'free',
          reminder_enabled: true,
          reminder_time: '09:00',
          is_premium: false,
          is_admin: false,
          trial_started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Profile creation error is not critical - trigger should have created it
        if (profileError) {
          // WARN: 'Profile creation fallback warning:', profileError
        }
      } catch (profileErr) {
        // WARN: 'Profile creation fallback error:', profileErr
      }

      return { error: null };
    } catch (err: any) {
      const error = new Error(err?.message || 'Sign up failed. Please try again.');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      // Still clear local state even if sign out fails
      setProfile(null);
      setUser(null);
      setSession(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const isPremium = profile?.is_premium || profile?.subscription_status === 'active' || false;
  const isAdmin = profile?.is_admin || profile?.role === 'admin' || false;
  const subscriptionStatus: SubscriptionStatus = profile?.subscription_status || 'free';
  const userRole: UserRole = profile?.role || 'user';

  /**
   * Check if user can access content based on role and subscription
   * @param requiredRole - Required user role ('user' or 'admin')
   * @param requiredSubscription - Required subscription ('free', 'active', or 'expired' for read-only)
   * @returns boolean - true if user meets requirements
   */
  const canAccess = (requiredRole?: UserRole, requiredSubscription?: SubscriptionStatus): boolean => {
    // Not authenticated
    if (!user) return false;

    // Admin routes require admin role
    if (requiredRole === 'admin' && !isAdmin) return false;

    // Subscription checks
    if (requiredSubscription) {
      if (requiredSubscription === 'active' && subscriptionStatus !== 'active') {
        return false;
      }
      if (requiredSubscription === 'free' && !user) {
        return false;
      }
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      trialStatus,
      isPremium,
      isAdmin,
      subscriptionStatus,
      userRole,
      canAccess,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
