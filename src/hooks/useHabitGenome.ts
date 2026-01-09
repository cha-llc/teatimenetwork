import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabits } from './useHabits';
import { useAuth } from '@/contexts/AuthContext';

// Types for Habit Genome
export interface DominantTrait {
  trait: string;
  strength: number;
  description: string;
  color: string;
}

export interface GenomeStrand {
  score: number;
  markers: string[];
  potential: string;
}

export interface UniqueMarker {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  impact: string;
}

export interface EvolutionStage {
  current: string;
  progress: number;
  nextStage: string;
  requirement: string;
}

export interface HabitGenome {
  genomeId: string;
  genomeName: string;
  overallGenomeScore: number;
  dominantTraits: DominantTrait[];
  genomeStrands: {
    physical: GenomeStrand;
    mental: GenomeStrand;
    productivity: GenomeStrand;
    social: GenomeStrand;
    growth: GenomeStrand;
  };
  uniqueMarkers: UniqueMarker[];
  evolutionStage: EvolutionStage;
  genomeInsight: string;
}

// Types for Life Outcomes
export interface LifespanOutcome {
  currentTrajectory: string;
  potentialWithOptimization: string;
  keyFactors: string[];
  scientificBasis: string;
  confidenceLevel: number;
}

export interface CareerOutcome {
  currentTrajectory: string;
  potentialWithOptimization: string;
  keyFactors: string[];
  scientificBasis: string;
  confidenceLevel: number;
  incomeProjection: string;
}

export interface MentalWellnessOutcome {
  currentScore: number;
  projectedScore: number;
  riskFactors: string[];
  protectiveFactors: string[];
  stressResilience: string;
  burnoutRisk: string;
}

export interface RelationshipsOutcome {
  socialCapitalScore: number;
  connectionQuality: string;
  projectedImpact: string;
}

export interface CognitiveOutcome {
  currentSharpness: number;
  projectedDeclineRate: string;
  brainAgePrediction: string;
}

export interface CompoundEffect {
  effect: string;
  description: string;
  magnitude: string;
}

export interface LifeOutcomes {
  simulationConfidence: number;
  timeHorizon: string;
  outcomes: {
    lifespan: LifespanOutcome;
    careerSuccess: CareerOutcome;
    mentalWellness: MentalWellnessOutcome;
    relationships: RelationshipsOutcome;
    cognitiveHealth: CognitiveOutcome;
  };
  compoundEffects: CompoundEffect[];
  criticalInsight: string;
  optimizationPotential: string;
}

// Types for What-If Scenarios
export interface ScenarioOutcomes {
  health: number;
  career: number;
  happiness: number;
  growth: number;
}

export interface Milestone {
  time: string;
  milestone: string;
}

export interface Scenario {
  id: string;
  name: string;
  change: string;
  description: string;
  probability: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImpact: string;
  outcomes: ScenarioOutcomes;
  keyMilestones: Milestone[];
  risks: string[];
  rewards: string[];
  comparisonToNow: {
    health: string;
    career: string;
    happiness: string;
    growth: string;
  };
}

export interface WhatIfScenarios {
  currentPath: {
    name: string;
    description: string;
    probability: number;
    outcomes: ScenarioOutcomes;
  };
  scenarios: Scenario[];
  recommendation: {
    bestScenario: string;
    reason: string;
    firstStep: string;
  };
  branchingInsight: string;
}

// Types for Habit Blends
export interface BlendIngredient {
  habit: string;
  amount: string;
  timing: string;
  isNew: boolean;
}

export interface FlavorProfile {
  energy: number;
  calm: number;
  focus: number;
  joy: number;
}

export interface HabitBlend {
  name: string;
  tagline: string;
  type: 'energizing' | 'calming' | 'focusing' | 'balancing' | 'strengthening';
  rarity: 'common' | 'rare' | 'legendary';
  ingredients: BlendIngredient[];
  brewingInstructions: string;
  steepTime: string;
  benefits: string[];
  synergyScore: number;
  flavorProfile: FlavorProfile;
  bestFor: string;
  pairingNote: string;
}

export interface HabitBlends {
  brewmasterNote: string;
  blends: HabitBlend[];
  customBlendSuggestion: {
    name: string;
    description: string;
    ingredients: string[];
    expectedOutcome: string;
  };
  brewingWisdom: string;
}

export const useHabitGenome = () => {
  const { user, profile } = useAuth();
  const { habits, completions, streaks } = useHabits();
  
  const [genome, setGenome] = useState<HabitGenome | null>(null);
  const [lifeOutcomes, setLifeOutcomes] = useState<LifeOutcomes | null>(null);
  const [whatIfScenarios, setWhatIfScenarios] = useState<WhatIfScenarios | null>(null);
  const [habitBlends, setHabitBlends] = useState<HabitBlends | null>(null);
  
  const [genomeLoading, setGenomeLoading] = useState(false);
  const [outcomesLoading, setOutcomesLoading] = useState(false);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [blendsLoading, setBlendsLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const isPremium = profile?.subscription_status === 'premium' || 
                    profile?.subscription_status === 'active' ||
                    (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

  const prepareHabitData = useCallback(() => {
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
      streaks: streaks
    };
  }, [habits, completions, streaks]);

  const generateGenome = useCallback(async () => {
    if (!user || !isPremium) {
      setError('Premium subscription required');
      return;
    }

    if (habits.length === 0) {
      setError('Add some habits first to generate your genome');
      return;
    }

    setGenomeLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('habit-genome', {
        body: { 
          action: 'genome',
          habitData: prepareHabitData()
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      if (data?.success && data?.genome) {
        setGenome(data.genome);
      } else {
        throw new Error(data?.error || 'Failed to generate genome');
      }
    } catch (err: any) {
      console.error('Error generating genome:', err);
      setError(err.message || 'Failed to generate genome');
    } finally {
      setGenomeLoading(false);
    }
  }, [user, isPremium, habits, prepareHabitData]);

  const simulateOutcomes = useCallback(async () => {
    if (!user || !isPremium) {
      setError('Premium subscription required');
      return;
    }

    if (habits.length === 0) {
      setError('Add some habits first to simulate outcomes');
      return;
    }

    setOutcomesLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('habit-genome', {
        body: { 
          action: 'life-outcomes',
          habitData: prepareHabitData()
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      if (data?.success && data?.outcomes) {
        setLifeOutcomes(data.outcomes);
      } else {
        throw new Error(data?.error || 'Failed to simulate outcomes');
      }
    } catch (err: any) {
      console.error('Error simulating outcomes:', err);
      setError(err.message || 'Failed to simulate outcomes');
    } finally {
      setOutcomesLoading(false);
    }
  }, [user, isPremium, habits, prepareHabitData]);

  const generateScenarios = useCallback(async (scenarioType: string = 'general') => {
    if (!user || !isPremium) {
      setError('Premium subscription required');
      return;
    }

    if (habits.length === 0) {
      setError('Add some habits first to generate scenarios');
      return;
    }

    setScenariosLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('habit-genome', {
        body: { 
          action: 'what-if',
          habitData: prepareHabitData(),
          scenarioType
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      if (data?.success && data?.scenarios) {
        setWhatIfScenarios(data.scenarios);
      } else {
        throw new Error(data?.error || 'Failed to generate scenarios');
      }
    } catch (err: any) {
      console.error('Error generating scenarios:', err);
      setError(err.message || 'Failed to generate scenarios');
    } finally {
      setScenariosLoading(false);
    }
  }, [user, isPremium, habits, prepareHabitData]);

  const generateBlends = useCallback(async (blendType: string = 'general') => {
    if (!user || !isPremium) {
      setError('Premium subscription required');
      return;
    }

    if (habits.length === 0) {
      setError('Add some habits first to generate blends');
      return;
    }

    setBlendsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('habit-genome', {
        body: { 
          action: 'habit-blends',
          habitData: prepareHabitData(),
          blendType
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      if (data?.success && data?.blends) {
        setHabitBlends(data.blends);
      } else {
        throw new Error(data?.error || 'Failed to generate blends');
      }
    } catch (err: any) {
      console.error('Error generating blends:', err);
      setError(err.message || 'Failed to generate blends');
    } finally {
      setBlendsLoading(false);
    }
  }, [user, isPremium, habits, prepareHabitData]);

  const clearAll = useCallback(() => {
    setGenome(null);
    setLifeOutcomes(null);
    setWhatIfScenarios(null);
    setHabitBlends(null);
    setError(null);
  }, []);

  return {
    // Data
    genome,
    lifeOutcomes,
    whatIfScenarios,
    habitBlends,
    
    // Loading states
    genomeLoading,
    outcomesLoading,
    scenariosLoading,
    blendsLoading,
    isLoading: genomeLoading || outcomesLoading || scenariosLoading || blendsLoading,
    
    // Error
    error,
    
    // Actions
    generateGenome,
    simulateOutcomes,
    generateScenarios,
    generateBlends,
    clearAll,
    
    // Status
    isPremium,
    hasData: habits.length > 0
  };
};
