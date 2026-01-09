import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabits } from './useHabits';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface HabitSuggestion {
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: 'daily' | 'weekly';
  estimatedTime: string;
  tip: string;
  synergy: string;
}

export interface DailyMotivation {
  greeting: string;
  mainMessage: string;
  dailyChallenge: string;
  affirmation: string;
  funFact: string;
  focusTip: string;
  celebrationNote: string;
}

export interface HabitAnalysis {
  healthScore: number;
  summary: string;
  strengths: string[];
  challenges: string[];
  bestDays: string[];
  worstDays: string[];
  optimalTime: string;
  improvementPlan: {
    immediate: string;
    thisWeek: string;
    thisMonth: string;
  };
  habitStackSuggestion: string;
  motivationalNote: string;
}

export const useAICoach = () => {
  const { user, profile } = useAuth();
  const { habits, completions, streaks } = useHabits();
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [suggestionsReasoning, setSuggestionsReasoning] = useState<string>('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // Motivation state
  const [motivation, setMotivation] = useState<DailyMotivation | null>(null);
  const [motivationLoading, setMotivationLoading] = useState(false);
  
  // Habit analysis state
  const [habitAnalysis, setHabitAnalysis] = useState<Record<string, HabitAnalysis>>({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Check if user has premium access
  const isPremium = profile?.is_premium || false;

  // Prepare habit data for AI
  const getHabitData = useCallback(() => {
    return {
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
      streaks
    };
  }, [habits, completions, streaks]);

  // Send message to AI coach
  const sendMessage = useCallback(async (message: string) => {
    if (!user || !isPremium) {
      setError('Premium membership required for AI Coach');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    setError(null);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'chat',
          message,
          chatHistory,
          habitData: getHabitData()
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.reply) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response from AI coach');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      // Remove the user message if we failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setChatLoading(false);
    }
  }, [user, isPremium, messages, getHabitData]);

  // Get habit suggestions
  const getHabitSuggestions = useCallback(async (type: string = 'general') => {
    if (!user || !isPremium) {
      setError('Premium membership required for AI suggestions');
      return;
    }

    setSuggestionsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'suggestions',
          suggestionType: type,
          habitData: getHabitData()
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.suggestions) {
        setSuggestions(data.suggestions);
        setSuggestionsReasoning(data.reasoning || '');
      } else {
        throw new Error('Failed to get suggestions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  }, [user, isPremium, getHabitData]);

  // Get daily motivation
  const getDailyMotivation = useCallback(async () => {
    if (!user || !isPremium) {
      setError('Premium membership required for AI motivation');
      return;
    }

    setMotivationLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'motivation',
          habitData: getHabitData()
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.motivation) {
        setMotivation(data.motivation);
      } else {
        throw new Error('Failed to get motivation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get motivation');
    } finally {
      setMotivationLoading(false);
    }
  }, [user, isPremium, getHabitData]);

  // Analyze specific habit
  const analyzeHabit = useCallback(async (habitId: string) => {
    if (!user || !isPremium) {
      setError('Premium membership required for habit analysis');
      return;
    }

    setAnalysisLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'analyze-habit',
          habitId,
          habitData: getHabitData()
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.analysis) {
        setHabitAnalysis(prev => ({
          ...prev,
          [habitId]: data.analysis
        }));
      } else {
        throw new Error('Failed to analyze habit');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze habit');
    } finally {
      setAnalysisLoading(false);
    }
  }, [user, isPremium, getHabitData]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Premium check
    isPremium,
    
    // Chat
    messages,
    chatLoading,
    sendMessage,
    clearChat,
    
    // Suggestions
    suggestions,
    suggestionsReasoning,
    suggestionsLoading,
    getHabitSuggestions,
    
    // Motivation
    motivation,
    motivationLoading,
    getDailyMotivation,
    
    // Habit analysis
    habitAnalysis,
    analysisLoading,
    analyzeHabit,
    
    // Error handling
    error,
    clearError
  };
};
