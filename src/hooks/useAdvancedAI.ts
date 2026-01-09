import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabits } from './useHabits';
import { useAuth } from '@/contexts/AuthContext';

export interface MoodEntry {
  id: string;
  timestamp: string;
  energy: number;
  stress: number;
  focus: number;
  motivation: number;
  notes?: string;
}

export interface EnergyProfile {
  type: 'early_bird' | 'night_owl' | 'balanced' | 'afternoon_peak';
  description: string;
  peakHours: string[];
  lowEnergyHours: string[];
}

export interface EnergyAnalysis {
  energyProfile: EnergyProfile;
  habitTimeOptimizations: Array<{
    habitName: string;
    currentTime: string;
    suggestedTime: string;
    expectedImprovement: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
  energyManagementTips: Array<{
    tip: string;
    timing: string;
    impact: string;
  }>;
  weeklyEnergyMap: Record<string, { peak: string; low: string }>;
  personalizedInsight: string;
}

export interface PredictiveSimulation {
  scenario: {
    type: string;
    description: string;
    probability: string;
  };
  immediateConsequences: Array<{
    impact: 'negative' | 'neutral' | 'positive';
    description: string;
    severity: number;
  }>;
  cascadeEffects: Array<{
    timeframe: string;
    effect: string;
    affectedHabits: string[];
    probability: string;
  }>;
  psychologicalImpact: {
    motivation: { change: string; magnitude: number };
    confidence: { change: string; magnitude: number };
    momentum: { change: string; magnitude: number };
  };
  recoveryPath: {
    difficulty: 'easy' | 'moderate' | 'hard';
    estimatedDays: number;
    steps: Array<{ day: number; action: string; goal: string }>;
    keyMilestones: string[];
  };
  preventionStrategies: Array<{
    strategy: string;
    effectiveness: 'high' | 'medium' | 'low';
    implementation: string;
  }>;
  alternativeScenario: {
    description: string;
    benefits: string[];
    projectedStreak: number;
  };
  coachingMessage: string;
}

export interface LearningPath {
  blueprintName: string;
  userProfile: {
    disciplineLevel: 'beginner' | 'intermediate' | 'advanced';
    strengths: string[];
    growthAreas: string[];
    personalityType: string;
  };
  phases: Array<{
    phase: number;
    name: string;
    duration: string;
    focus: string;
    psychologyPrinciple: string;
    goals: Array<{ goal: string; metric: string; habitStack?: string }>;
    dailyActions: string[];
    mindsetShift: string;
    potentialObstacles: string[];
    copingStrategies: string[];
  }>;
  habitStackingPlan: Array<{
    anchor: string;
    newHabit: string;
    cue: string;
    implementation: string;
  }>;
  environmentDesign: Array<{
    area: 'physical' | 'digital' | 'social';
    change: string;
    impact: string;
  }>;
  accountabilitySystem: {
    type: string;
    frequency: string;
    metrics: string[];
  };
  rewardSystem: {
    microRewards: string[];
    milestoneRewards: Array<{ milestone: string; reward: string }>;
  };
  emergencyProtocol: {
    warningSignals: string[];
    immediateActions: string[];
    resetRitual: string;
  };
  weeklyReviewQuestions: string[];
  motivationalMantra: string;
  expectedOutcomes: {
    week2: string;
    month1: string;
    month3: string;
  };
}

export interface MoodSuggestions {
  moodAssessment: {
    overallState: 'thriving' | 'good' | 'neutral' | 'struggling' | 'low';
    primaryChallenge: string;
    energyLevel: 'high' | 'medium' | 'low';
  };
  prioritizedHabits: Array<{
    habitName: string;
    priority: 'must-do' | 'if-possible' | 'skip-today';
    adaptedApproach: string;
    minimumViableVersion: string;
    reasoning: string;
  }>;
  moodBoosters: Array<{
    activity: string;
    duration: string;
    expectedImpact: string;
  }>;
  avoidToday: Array<{
    activity: string;
    reason: string;
  }>;
  selfCompassionReminder: string;
  tomorrowSetup: string;
  affirmation: string;
}

export interface RecoveryPlan {
  acknowledgment: string;
  perspective: {
    reframe: string;
    statistic: string;
    reminder: string;
  };
  immediateActions: Array<{
    action: string;
    timeframe: 'now' | 'today' | 'tomorrow';
    purpose: string;
  }>;
  recoveryTimeline: {
    day1: { focus: string; minimumAction: string; mindset: string };
    day2to3: { focus: string; actions: string[]; milestone: string };
    week1: { goal: string; checkpoints: string[]; reward: string };
  };
  preventionPlan: {
    triggerAnalysis: string;
    newSafeguards: string[];
    backupPlan: string;
  };
  supportStrategies: Array<{
    strategy: string;
    implementation: string;
  }>;
  motivationalMessage: string;
  newStreakGoal: {
    target: number;
    reasoning: string;
    celebrationPlan: string;
  };
}

const MOOD_STORAGE_KEY = 'tea_time_mood_entries';

export const useAdvancedAI = () => {
  const { user, profile } = useAuth();
  const { habits, completions, streaks } = useHabits();
  
  // State
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MOOD_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  
  const [energyAnalysis, setEnergyAnalysis] = useState<EnergyAnalysis | null>(null);
  const [simulation, setSimulation] = useState<PredictiveSimulation | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [moodSuggestions, setMoodSuggestions] = useState<MoodSuggestions | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);
  
  const [energyLoading, setEnergyLoading] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [learningPathLoading, setLearningPathLoading] = useState(false);
  const [moodSuggestionsLoading, setMoodSuggestionsLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

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

  // Save mood entry
  const saveMoodEntry = useCallback((entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: `mood-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newEntry, ...moodEntries].slice(0, 100); // Keep last 100 entries
    setMoodEntries(updated);
    localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(updated));
    
    return newEntry;
  }, [moodEntries]);

  // Get recent mood entries
  const getRecentMoodEntries = useCallback((days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return moodEntries.filter(e => new Date(e.timestamp) >= cutoff);
  }, [moodEntries]);

  // Analyze energy patterns
  const analyzeEnergyPatterns = useCallback(async () => {
    if (!user || !isPremium) {
      setError('Premium membership required for energy analysis');
      return;
    }

    setEnergyLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'energy-analysis',
          habitData: getHabitData(),
          moodData: getRecentMoodEntries(14)
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.analysis) {
        setEnergyAnalysis(data.analysis);
      } else {
        throw new Error('Failed to analyze energy patterns');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze energy patterns');
    } finally {
      setEnergyLoading(false);
    }
  }, [user, isPremium, getHabitData, getRecentMoodEntries]);

  // Run predictive simulation
  const runPredictiveSimulation = useCallback(async (habitId: string, scenarioType: string = 'miss_tomorrow') => {
    if (!user || !isPremium) {
      setError('Premium membership required for predictive simulations');
      return;
    }

    setSimulationLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'predictive-simulation',
          habitData: getHabitData(),
          habitId,
          scenarioType
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.simulation) {
        setSimulation(data.simulation);
      } else {
        throw new Error('Failed to run simulation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run simulation');
    } finally {
      setSimulationLoading(false);
    }
  }, [user, isPremium, getHabitData]);

  // Generate learning path
  const generateLearningPath = useCallback(async () => {
    if (!user || !isPremium) {
      setError('Premium membership required for learning paths');
      return;
    }

    setLearningPathLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'learning-path',
          habitData: getHabitData(),
          moodData: getRecentMoodEntries(14)
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.blueprint) {
        setLearningPath(data.blueprint);
      } else {
        throw new Error('Failed to generate learning path');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning path');
    } finally {
      setLearningPathLoading(false);
    }
  }, [user, isPremium, getHabitData, getRecentMoodEntries]);

  // Get mood-based suggestions
  const getMoodBasedSuggestions = useCallback(async () => {
    if (!user || !isPremium) {
      setError('Premium membership required for mood suggestions');
      return;
    }

    if (moodEntries.length === 0) {
      setError('Please log your mood first to get personalized suggestions');
      return;
    }

    setMoodSuggestionsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'mood-suggestions',
          habitData: getHabitData(),
          moodData: getRecentMoodEntries(1) // Just the most recent
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.suggestions) {
        setMoodSuggestions(data.suggestions);
      } else {
        throw new Error('Failed to get mood suggestions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get mood suggestions');
    } finally {
      setMoodSuggestionsLoading(false);
    }
  }, [user, isPremium, getHabitData, getRecentMoodEntries, moodEntries.length]);

  // Generate recovery plan
  const generateRecoveryPlan = useCallback(async (habitId: string) => {
    if (!user || !isPremium) {
      setError('Premium membership required for recovery plans');
      return;
    }

    setRecoveryLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: 'recovery-plan',
          habitData: getHabitData(),
          habitId
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.plan) {
        setRecoveryPlan(data.plan);
      } else {
        throw new Error('Failed to generate recovery plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate recovery plan');
    } finally {
      setRecoveryLoading(false);
    }
  }, [user, isPremium, getHabitData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Premium check
    isPremium,
    
    // Mood tracking
    moodEntries,
    saveMoodEntry,
    getRecentMoodEntries,
    
    // Energy analysis
    energyAnalysis,
    energyLoading,
    analyzeEnergyPatterns,
    
    // Predictive simulation
    simulation,
    simulationLoading,
    runPredictiveSimulation,
    
    // Learning path
    learningPath,
    learningPathLoading,
    generateLearningPath,
    
    // Mood suggestions
    moodSuggestions,
    moodSuggestionsLoading,
    getMoodBasedSuggestions,
    
    // Recovery plan
    recoveryPlan,
    recoveryLoading,
    generateRecoveryPlan,
    
    // Error handling
    error,
    clearError
  };
};
