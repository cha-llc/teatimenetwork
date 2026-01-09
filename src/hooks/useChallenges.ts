import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  habit_type: string;
  challenge_type: 'individual' | 'team';
  is_private: boolean;
  start_date: string;
  end_date: string;
  goal_target: number;
  goal_unit: string;
  max_participants?: number;
  invite_code?: string;
  reward_badge?: string;
  created_at: string;
  challenge_participants?: { count: number }[];
  challenge_teams?: Team[];
}

export interface Participant {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  team_id?: string;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  points: number;
  joined_at: string;
  last_check_in?: string;
}

export interface Team {
  id: string;
  challenge_id: string;
  name: string;
  color: string;
  total_points: number;
}

export interface ChallengeBadge {
  id: string;
  user_id: string;
  challenge_id?: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  earned_at: string;
  challenges?: { title: string };
}

export function useChallenges() {
  const { user, isPremium } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<Team[]>([]);
  const [userBadges, setUserBadges] = useState<ChallengeBadge[]>([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listChallenges = useCallback(async (filter: 'all' | 'my' | 'joined' = 'all') => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { action: 'list-challenges', userId: user.id, filter }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setChallenges(data.challenges || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { action: 'get-challenge', challengeId, userId: user.id }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setCurrentChallenge(data.challenge);
      setLeaderboard(data.leaderboard || []);
      setTeamLeaderboard(data.teamLeaderboard || []);
      setIsParticipant(data.isParticipant);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createChallenge = useCallback(async (challengeData: {
    title: string;
    description: string;
    habitType: string;
    challengeType: 'individual' | 'team';
    isPrivate: boolean;
    startDate: string;
    endDate: string;
    goalTarget: number;
    goalUnit: string;
    maxParticipants?: number;
    rewardBadge?: string;
    teams?: { name: string; color: string }[];
  }) => {
    if (!user) return null;
    
    // Only premium users can create private challenges
    if (challengeData.isPrivate && !isPremium) {
      setError('Premium membership required for private challenges');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { 
          action: 'create-challenge', 
          userId: user.id,
          userName: user.email?.split('@')[0] || 'User',
          ...challengeData 
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  const joinChallenge = useCallback(async (
    challengeId: string, 
    teamId?: string, 
    inviteCode?: string
  ) => {
    if (!user) return false;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { 
          action: 'join-challenge', 
          challengeId,
          userId: user.id,
          userName: user.email?.split('@')[0] || 'User',
          userEmail: user.email,
          teamId,
          inviteCode
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setIsParticipant(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const leaveChallenge = useCallback(async (challengeId: string) => {
    if (!user) return false;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { action: 'leave-challenge', challengeId, userId: user.id }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setIsParticipant(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkIn = useCallback(async (challengeId: string, completions = 1) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { action: 'check-in', challengeId, userId: user.id, completions }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const inviteFriends = useCallback(async (challengeId: string, emails: string[]) => {
    if (!user || !isPremium) {
      setError('Premium membership required to invite friends');
      return null;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { 
          action: 'invite-friends', 
          challengeId, 
          userId: user.id,
          userName: user.email?.split('@')[0] || 'User',
          emails 
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  const joinByCode = useCallback(async (inviteCode: string) => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { 
          action: 'join-by-code', 
          inviteCode,
          userId: user.id,
          userName: user.email?.split('@')[0] || 'User',
          userEmail: user.email
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getUserBadges = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { action: 'get-user-badges', userId: user.id }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setUserBadges(data.badges || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getStreakLeaderboard = useCallback(async (challengeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('community-challenges', {
        body: { action: 'get-streak-leaderboard', challengeId }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      return data.leaderboard || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    challenges,
    currentChallenge,
    leaderboard,
    teamLeaderboard,
    userBadges,
    isParticipant,
    loading,
    error,
    isPremium,
    listChallenges,
    getChallenge,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    checkIn,
    inviteFriends,
    joinByCode,
    getUserBadges,
    getStreakLeaderboard
  };
}
