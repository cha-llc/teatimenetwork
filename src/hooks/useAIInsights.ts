import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabits, Habit, HabitCompletion, Streak } from './useHabits';
import { useAuth } from '@/contexts/AuthContext';

export interface Pattern {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  icon: string;
}

export interface OptimalTime {
  habitName: string;
  suggestedTime: string;
  reason: string;
}

export interface StreakPrediction {
  habitName: string;
  riskLevel: 'low' | 'medium' | 'high';
  prediction: string;
  preventionTip: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
}

export interface MotivationalTip {
  tip: string;
  context: string;
}

export interface WeeklyFocus {
  habitToFocus: string;
  reason: string;
  miniGoal: string;
}

export interface AIInsights {
  overallScore: number;
  summary: string;
  patterns: Pattern[];
  optimalTimes: OptimalTime[];
  streakPredictions: StreakPrediction[];
  recommendations: Recommendation[];
  motivationalTips: MotivationalTip[];
  weeklyFocus: WeeklyFocus;
}

export interface InsightsResponse {
  success: boolean;
  insights: AIInsights;
  generatedAt: string;
  error?: string;
}

export const useAIInsights = () => {
  const { user, profile } = useAuth();
  const { habits, completions, streaks } = useHabits();
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const generateInsights = useCallback(async () => {
    if (!user) {
      setError('Please sign in to generate insights');
      return;
    }

    if (habits.length === 0) {
      setError('Add some habits first to generate insights');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare habit data for the AI
      const habitData = {
        habits: habits.map(h => ({
          id: h.id,
          name: h.name,
          category: h.category,
          frequency: h.frequency,
          target_days: h.target_days,
          reminder_time: h.reminder_time,
          created_at: h.created_at
        })),
        completions: completions.map(c => ({
          habit_id: c.habit_id,
          completed_date: c.completed_date,
          notes: c.notes
        })),
        streaks: streaks
      };

      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { habitData }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success && data?.insights) {
        setInsights(data.insights);
        setLastGenerated(data.generatedAt);
      } else if (data?.insights) {
        // Even if success is false, we might have fallback insights
        setInsights(data.insights);
        if (data.error) {
          console.warn('AI Insights warning:', data.error);
        }
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch (err: any) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate insights');
      
      // Set default insights on error
      setInsights({
        overallScore: 50,
        summary: "We couldn't analyze your habits right now. Please try again later.",
        patterns: [],
        optimalTimes: [],
        streakPredictions: [],
        recommendations: [{
          priority: 'medium',
          title: 'Keep Going',
          description: 'Continue tracking your habits consistently for better insights.',
          expectedImpact: 'More accurate AI recommendations'
        }],
        motivationalTips: [{
          tip: 'Consistency is key to building lasting habits!',
          context: 'Daily reminder'
        }],
        weeklyFocus: {
          habitToFocus: habits[0]?.name || 'Your habits',
          reason: 'Focus on one habit at a time',
          miniGoal: 'Complete your habits every day this week'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [user, habits, completions, streaks]);

  const clearInsights = useCallback(() => {
    setInsights(null);
    setError(null);
    setLastGenerated(null);
  }, []);

  return {
    insights,
    loading,
    error,
    lastGenerated,
    generateInsights,
    clearInsights,
    hasData: habits.length > 0
  };
};
