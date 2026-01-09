import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type FlavorProfile = 'mild' | 'medium' | 'spicy' | 'bold' | 'exotic';
export type IncubatorStatus = 'steeping' | 'testing' | 'evolved' | 'immortal';

export interface IncubatorHabit {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  flavor_profile: FlavorProfile;
  category: string;
  suggested_frequency: string;
  suggested_duration: number;
  steep_time: number;
  status: IncubatorStatus;
  vote_count: number;
  test_count: number;
  success_rate: number;
  ai_optimized_schedule: any;
  is_immortal: boolean;
  royalty_rate: number;
  total_royalties_earned: number;
  created_at: string;
  updated_at: string;
  evolved_at: string | null;
  immortalized_at: string | null;
  creator_email?: string;
  user_vote?: 'upvote' | 'downvote' | 'evolve' | null;
  is_testing?: boolean;
}

export interface IncubatorEvolution {
  id: string;
  incubator_id: string;
  evolution_number: number;
  changes: any;
  reason: string;
  aggregate_success_rate: number;
  created_at: string;
}

export interface PrivateIncubator {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  invite_code: string;
  created_at: string;
  member_count?: number;
}

export function useIncubator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incubatorHabits, setIncubatorHabits] = useState<IncubatorHabit[]>([]);
  const [privateIncubators, setPrivateIncubators] = useState<PrivateIncubator[]>([]);
  const [loading, setLoading] = useState(true);
  const [evolving, setEvolving] = useState<string | null>(null);

  const fetchIncubatorHabits = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: habits, error } = await supabase
        .from('habit_incubator')
        .select('*')
        .order('vote_count', { ascending: false });

      if (error) throw error;

      // Get user's votes if logged in
      let userVotes: Record<string, string> = {};
      let userTesting: Set<string> = new Set();
      
      if (user) {
        const { data: votes } = await supabase
          .from('incubator_votes')
          .select('incubator_id, vote_type')
          .eq('user_id', user.id);

        if (votes) {
          votes.forEach(v => {
            userVotes[v.incubator_id] = v.vote_type;
          });
        }

        const { data: testing } = await supabase
          .from('incubator_testers')
          .select('incubator_id')
          .eq('user_id', user.id);

        if (testing) {
          testing.forEach(t => userTesting.add(t.incubator_id));
        }
      }

      const enrichedHabits = habits?.map(h => ({
        ...h,
        user_vote: userVotes[h.id] as any || null,
        is_testing: userTesting.has(h.id)
      })) || [];

      setIncubatorHabits(enrichedHabits);
    } catch (error: any) {
      console.error('Error fetching incubator habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPrivateIncubators = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('private_incubators')
        .select(`
          *,
          private_incubator_members(count)
        `)
        .or(`creator_id.eq.${user.id}`);

      if (error) throw error;
      setPrivateIncubators(data || []);
    } catch (error: any) {
      console.error('Error fetching private incubators:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchIncubatorHabits();
    fetchPrivateIncubators();
  }, [fetchIncubatorHabits, fetchPrivateIncubators]);

  const proposeHabit = async (habit: {
    title: string;
    description: string;
    flavor_profile: FlavorProfile;
    category: string;
    suggested_frequency: string;
    suggested_duration: number;
    steep_time?: number;
  }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to propose habits',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('habit_incubator')
        .insert({
          ...habit,
          creator_id: user.id,
          steep_time: habit.steep_time || 7
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Habit Proposed!',
        description: 'Your habit is now steeping in the incubator'
      });

      await fetchIncubatorHabits();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const vote = async (incubatorId: string, voteType: 'upvote' | 'downvote' | 'evolve') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('incubator-evolve', {
        body: {
          action: 'vote',
          incubatorId,
          userId: user.id,
          voteType
        }
      });

      if (error) throw error;

      // Update local state
      setIncubatorHabits(prev => prev.map(h => {
        if (h.id === incubatorId) {
          const wasVoted = h.user_vote === voteType;
          let newVoteCount = h.vote_count;
          
          if (voteType === 'upvote') {
            newVoteCount += wasVoted ? -1 : 1;
          } else if (voteType === 'downvote') {
            newVoteCount += wasVoted ? 1 : -1;
          }

          return {
            ...h,
            vote_count: newVoteCount,
            user_vote: wasVoted ? null : voteType
          };
        }
        return h;
      }));

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const joinTesting = async (incubatorId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to join testing',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('incubator-evolve', {
        body: {
          action: 'join_testing',
          incubatorId,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: 'Joined Beta Testing!',
        description: 'You are now testing this habit'
      });

      setIncubatorHabits(prev => prev.map(h => {
        if (h.id === incubatorId) {
          return { ...h, is_testing: true, test_count: h.test_count + 1 };
        }
        return h;
      }));

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const submitFeedback = async (incubatorId: string, feedback: string, rating: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('incubator-evolve', {
        body: {
          action: 'submit_feedback',
          incubatorId,
          userId: user.id,
          feedback,
          rating
        }
      });

      if (error) throw error;

      toast({
        title: 'Feedback Submitted!',
        description: 'Thank you for helping evolve this habit'
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const evolveHabit = async (incubatorId: string) => {
    if (!user) return;

    try {
      setEvolving(incubatorId);

      const { data, error } = await supabase.functions.invoke('incubator-evolve', {
        body: {
          action: 'evolve',
          incubatorId,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: 'Habit Evolved!',
        description: `Evolution #${data.evolutionNumber} complete`
      });

      await fetchIncubatorHabits();

    } catch (error: any) {
      toast({
        title: 'Evolution Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setEvolving(null);
    }
  };

  const getEvolutions = async (incubatorId: string): Promise<IncubatorEvolution[]> => {
    try {
      const { data, error } = await supabase
        .from('incubator_evolutions')
        .select('*')
        .eq('incubator_id', incubatorId)
        .order('evolution_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching evolutions:', error);
      return [];
    }
  };

  const createPrivateIncubator = async (name: string, description: string) => {
    if (!user) return null;

    try {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data, error } = await supabase
        .from('private_incubators')
        .insert({
          name,
          description,
          creator_id: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('private_incubator_members')
        .insert({
          incubator_group_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      toast({
        title: 'Private Incubator Created!',
        description: `Invite code: ${inviteCode}`
      });

      await fetchPrivateIncubators();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const joinPrivateIncubator = async (inviteCode: string) => {
    if (!user) return false;

    try {
      const { data: incubator, error: findError } = await supabase
        .from('private_incubators')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (findError || !incubator) {
        toast({
          title: 'Invalid Code',
          description: 'No incubator found with that invite code',
          variant: 'destructive'
        });
        return false;
      }

      const { error } = await supabase
        .from('private_incubator_members')
        .insert({
          incubator_group_id: incubator.id,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already a Member',
            description: 'You are already in this incubator'
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: 'Joined Incubator!',
        description: 'You are now a member of this private incubator'
      });

      await fetchPrivateIncubators();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    incubatorHabits,
    privateIncubators,
    loading,
    evolving,
    proposeHabit,
    vote,
    joinTesting,
    submitFeedback,
    evolveHabit,
    getEvolutions,
    createPrivateIncubator,
    joinPrivateIncubator,
    refresh: fetchIncubatorHabits
  };
}
