import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: string;
  is_premium: boolean;
  is_admin: boolean;
  subscription_tier: 'starter' | 'pro' | 'ultimate' | null;
  reminder_time: string;
  reminder_enabled: boolean;
  timezone: string;
  trial_started_at: string | null;
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
        // Migrate existing users to trial if they don't have trial_started_at
        if (!data.trial_started_at && !data.is_premium) {
          const trialStartDate = new Date().toISOString();
          await supabase
            .from('profiles')
            .update({ trial_started_at: trialStartDate })
            .eq('id', userId);
          data.trial_started_at = trialStartDate;
        }
        setProfile(data);
        return data;
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
        console.warn('Auth initialization timed out after', AUTH_TIMEOUT_MS, 'ms');
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
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

  const isPremium = profile?.is_premium || false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      trialStatus,
      isPremium,
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
