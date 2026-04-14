import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type SubscriptionStatus = 'free' | 'active' | 'expired';
type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: string;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  reminder_time: string;
  reminder_enabled: boolean;
  timezone: string;
  is_premium: boolean;
  is_admin: boolean;
  subscription_tier: 'starter' | 'pro' | 'ultimate' | null;
  trial_started_at: string | null;
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
  isPremium: boolean;
  isAdmin: boolean;
  subscriptionStatus: SubscriptionStatus;
  userRole: UserRole;
  canAccess: (requiredRole?: UserRole, requiredSubscription?: SubscriptionStatus) => boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const TRIAL_DURATION_DAYS = 30;
const AUTH_TIMEOUT_MS = 8000;

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
        const profile: Profile = {
          ...data,
          role: data.role || 'user',
          subscription_status: data.subscription_status || 'free',
        };

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

  const trialStatus = useMemo((): TrialStatus => {
    if (profile?.is_premium) {
      return {
        isTrialActive: false,
        isTrialExpired: false,
        daysRemaining: 0,
        trialEndDate: null,
      };
    }

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

    return { isTrialActive, isTrialExpired, daysRemaining, trialEndDate };
  }, [profile?.is_premium, profile?.trial_started_at]);

  useEffect(() => {
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

    const timeoutId = setTimeout(() => {
      if (!hasCompleted) {
        completeInitialization();
      }
    }, AUTH_TIMEOUT_MS);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (isMounted && !hasCompleted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id).catch(console.error);
        } else {
          setProfile(null);
        }

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
      if (!email || !password || !fullName) {
        throw new Error('Email, password, and full name are required');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName,
            language: 'en',
            timezone: 'UTC',
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Account creation failed. Please try again.');

      // Manual profile creation as fallback
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          display_name: fullName,
          language: 'en',
          timezone: 'UTC',
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
      } catch {
        // Trigger may have already created it
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Sign up failed. Please try again.') };
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
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
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
        setProfile(prev => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const isPremium =
    profile?.is_premium || profile?.subscription_status === 'active' || false;
  const isAdmin = profile?.is_admin || profile?.role === 'admin' || false;
  const subscriptionStatus: SubscriptionStatus = profile?.subscription_status || 'free';
  const userRole: UserRole = profile?.role || 'user';

  const canAccess = (requiredRole?: UserRole, requiredSubscription?: SubscriptionStatus): boolean => {
    if (!user) return false;
    if (requiredRole === 'admin' && !isAdmin) return false;
    if (requiredSubscription === 'active' && subscriptionStatus !== 'active') return false;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
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
        refreshProfile,
      }}
    >
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
