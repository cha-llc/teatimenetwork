import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface EcoHabit {
  id: string;
  habit_id: string;
  eco_category: 'transport' | 'energy' | 'food' | 'waste' | 'water' | 'shopping';
  carbon_saved_kg: number;
  created_at: string;
}

export interface CarbonOffset {
  id: string;
  amount_donated: number;
  carbon_offset_kg: number;
  donation_date: string;
  charity_name: string;
  transaction_id: string;
}

export interface MindfulnessSession {
  id: string;
  session_type: 'meditation' | 'breathing' | 'body_scan' | 'gratitude' | 'visualization' | 'sleep';
  duration_minutes: number;
  audio_track?: string;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  completed_at: string;
}

export interface HabitToken {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  transaction_type: 'earn' | 'spend' | 'vote' | 'reward' | 'transfer';
  description: string;
  created_at: string;
}

export interface AIReportSummary {
  id: string;
  report_type: string;
  summary_text: string;
  key_insights: string[];
  recommendations: string[];
  generated_at: string;
}

export interface LifetimeForecast {
  thirtyDayForecast: {
    predictedRate: number;
    confidence: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  ninetyDayForecast: {
    predictedRate: number;
    confidence: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  yearForecast: {
    predictedRate: number;
    confidence: number;
    milestones: string[];
  };
  riskFactors: string[];
  growthOpportunities: string[];
  projectedStreakPotential: number;
  habitMasteryTimeline: {
    beginner: string;
    intermediate: string;
    advanced: string;
    master: string;
  };
}

export const useAdvancedAnalytics = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [forecast, setForecast] = useState<LifetimeForecast | null>(null);
  const [ecoHabits, setEcoHabits] = useState<EcoHabit[]>([]);
  const [carbonOffsets, setCarbonOffsets] = useState<CarbonOffset[]>([]);
  const [mindfulnessSessions, setMindfulnessSessions] = useState<MindfulnessSession[]>([]);
  const [tokens, setTokens] = useState<HabitToken | null>(null);
  const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
  const [totalCarbonSaved, setTotalCarbonSaved] = useState(0);

  const isPremium = profile?.is_premium;

  // Generate AI summary
  const generateAISummary = useCallback(async (analyticsData: any, timeRange: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-ai', {
        body: {
          action: 'generate-summary',
          analyticsData,
          timeRange
        }
      });

      if (error) throw error;
      setAiSummary(data.summary);

      // Save to database
      await supabase.from('ai_report_summaries').insert({
        user_id: user.id,
        report_type: timeRange <= 7 ? 'daily' : timeRange <= 30 ? 'weekly' : 'monthly',
        summary_text: data.summary,
        key_insights: [],
        recommendations: []
      });

      return data.summary;
    } catch (err) {
      console.error('Error generating AI summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Generate lifetime forecast (premium only)
  const generateForecast = useCallback(async (analyticsData: any, timeRange: number) => {
    if (!user || !isPremium) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-ai', {
        body: {
          action: 'generate-forecast',
          analyticsData,
          isPremium: true,
          timeRange
        }
      });

      if (error) throw error;
      setForecast(data.forecast);

      // Save to database
      await supabase.from('lifetime_forecasts').insert({
        user_id: user.id,
        forecast_data: data.forecast,
        confidence_score: data.forecast.thirtyDayForecast?.confidence || 70,
        valid_until: new Date(Date.now() + 7 * 86400000).toISOString()
      });

      return data.forecast;
    } catch (err) {
      console.error('Error generating forecast:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  // Fetch eco habits
  const fetchEcoHabits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('eco_habits')
      .select('*')
      .eq('user_id', user.id);
    
    if (data) {
      setEcoHabits(data);
      const total = data.reduce((sum, h) => sum + Number(h.carbon_saved_kg), 0);
      setTotalCarbonSaved(total);
    }
  }, [user]);

  // Add eco habit
  const addEcoHabit = useCallback(async (habitId: string, ecoCategory: EcoHabit['eco_category']) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('eco_habits')
      .insert({
        user_id: user.id,
        habit_id: habitId,
        eco_category: ecoCategory
      })
      .select()
      .single();

    if (!error && data) {
      setEcoHabits(prev => [...prev, data]);
    }
    return { data, error };
  }, [user]);

  // Update carbon saved
  const updateCarbonSaved = useCallback(async (habitId: string, additionalKg: number) => {
    if (!user) return;
    const ecoHabit = ecoHabits.find(h => h.habit_id === habitId);
    if (!ecoHabit) return;

    const newTotal = Number(ecoHabit.carbon_saved_kg) + additionalKg;
    const { error } = await supabase
      .from('eco_habits')
      .update({ carbon_saved_kg: newTotal })
      .eq('id', ecoHabit.id);

    if (!error) {
      setEcoHabits(prev => prev.map(h => 
        h.id === ecoHabit.id ? { ...h, carbon_saved_kg: newTotal } : h
      ));
      setTotalCarbonSaved(prev => prev + additionalKg);
    }
  }, [user, ecoHabits]);

  // Log mindfulness session
  const logMindfulnessSession = useCallback(async (session: Omit<MindfulnessSession, 'id' | 'completed_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('mindfulness_sessions')
      .insert({
        user_id: user.id,
        ...session
      })
      .select()
      .single();

    if (!error && data) {
      setMindfulnessSessions(prev => [data, ...prev]);
      // Award tokens for mindfulness
      await earnTokens(5, 'Completed mindfulness session');
    }
    return { data, error };
  }, [user]);

  // Fetch mindfulness sessions
  const fetchMindfulnessSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mindfulness_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (data) {
      setMindfulnessSessions(data);
    }
  }, [user]);

  // Fetch tokens
  const fetchTokens = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('habit_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setTokens(data);
    } else {
      // Create token account if doesn't exist
      const { data: newData } = await supabase
        .from('habit_tokens')
        .insert({ user_id: user.id, balance: 0, total_earned: 0, total_spent: 0 })
        .select()
        .single();
      if (newData) setTokens(newData);
    }

    // Fetch transactions
    const { data: txData } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (txData) {
      setTokenTransactions(txData);
    }
  }, [user]);

  // Earn tokens
  const earnTokens = useCallback(async (amount: number, description: string, referenceId?: string, referenceType?: string) => {
    if (!user) return;
    
    // Update balance
    const currentBalance = tokens?.balance || 0;
    const currentEarned = tokens?.total_earned || 0;
    
    await supabase
      .from('habit_tokens')
      .upsert({
        user_id: user.id,
        balance: currentBalance + amount,
        total_earned: currentEarned + amount,
        last_updated: new Date().toISOString()
      });

    // Log transaction
    await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount,
        transaction_type: 'earn',
        description,
        reference_id: referenceId,
        reference_type: referenceType
      });

    // Refresh tokens
    await fetchTokens();
  }, [user, tokens, fetchTokens]);

  // Spend tokens (for voting, rewards, etc.)
  const spendTokens = useCallback(async (amount: number, description: string, transactionType: 'spend' | 'vote' = 'spend') => {
    if (!user || !tokens || tokens.balance < amount) return { error: 'Insufficient balance' };
    
    await supabase
      .from('habit_tokens')
      .update({
        balance: tokens.balance - amount,
        total_spent: tokens.total_spent + amount,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', user.id);

    await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: -amount,
        transaction_type: transactionType,
        description
      });

    await fetchTokens();
    return { success: true };
  }, [user, tokens, fetchTokens]);

  // Calculate carbon impact
  const calculateCarbonImpact = useCallback(async (ecoCategory: string, frequency: number, duration: number) => {
    const { data, error } = await supabase.functions.invoke('analytics-ai', {
      body: {
        action: 'calculate-carbon',
        analyticsData: { ecoCategory, frequency, duration }
      }
    });

    if (error) return null;
    return data;
  }, []);

  // Donate to carbon offset
  const donateToCarbon = useCallback(async (amount: number, charityName: string) => {
    if (!user) return;
    const carbonOffsetKg = amount * 10; // $1 = 10kg CO2 offset

    const { data, error } = await supabase
      .from('carbon_offsets')
      .insert({
        user_id: user.id,
        amount_donated: amount,
        carbon_offset_kg: carbonOffsetKg,
        charity_name: charityName,
        transaction_id: `eco_${Date.now()}`
      })
      .select()
      .single();

    if (!error && data) {
      setCarbonOffsets(prev => [data, ...prev]);
      // Award bonus tokens for donation
      await earnTokens(amount * 20, `Carbon offset donation: $${amount}`);
    }
    return { data, error };
  }, [user, earnTokens]);

  return {
    loading,
    aiSummary,
    forecast,
    ecoHabits,
    carbonOffsets,
    mindfulnessSessions,
    tokens,
    tokenTransactions,
    totalCarbonSaved,
    isPremium,
    generateAISummary,
    generateForecast,
    fetchEcoHabits,
    addEcoHabit,
    updateCarbonSaved,
    logMindfulnessSession,
    fetchMindfulnessSessions,
    fetchTokens,
    earnTokens,
    spendTokens,
    calculateCarbonImpact,
    donateToCarbon
  };
};
