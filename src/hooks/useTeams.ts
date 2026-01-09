import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  invite_code: string;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active' | 'declined';
  invited_at: string;
  joined_at: string | null;
}

export interface TeamChallenge {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  habit_name: string;
  target_completions: number;
  start_date: string;
  end_date: string;
  created_by: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface TeamChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  completions: number;
  last_completed_at: string | null;
  updated_at: string;
  member?: TeamMember;
}

export interface TeamAchievement {
  id: string;
  team_id: string;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
  member?: TeamMember;
}

export interface TeamStats {
  totalCompletions: number;
  activeChallenges: number;
  completedChallenges: number;
  totalAchievements: number;
  memberCount: number;
  weeklyCompletions: number;
  topPerformer: TeamMember | null;
}

export function useTeams() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
  const [achievements, setAchievements] = useState<TeamAchievement[]>([]);
  const [activity, setActivity] = useState<TeamActivity[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUltimate = profile?.subscription_tier === 'ultimate' || profile?.subscription_status === 'active';

  // Fetch user's teams
  const fetchTeams = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get teams where user is owner
      const { data: ownedTeams, error: ownedError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Get teams where user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberError) throw memberError;

      const memberTeamIds = memberTeams?.map(m => m.team_id) || [];
      
      let allTeams = ownedTeams || [];
      
      if (memberTeamIds.length > 0) {
        const { data: joinedTeams, error: joinedError } = await supabase
          .from('teams')
          .select('*')
          .in('id', memberTeamIds);

        if (!joinedError && joinedTeams) {
          // Merge without duplicates
          const ownedIds = new Set(allTeams.map(t => t.id));
          joinedTeams.forEach(t => {
            if (!ownedIds.has(t.id)) {
              allTeams.push(t);
            }
          });
        }
      }

      setTeams(allTeams);
      
      // Set current team if not set
      if (allTeams.length > 0 && !currentTeam) {
        setCurrentTeam(allTeams[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentTeam]);

  // Fetch team members
  const fetchMembers = useCallback(async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('role', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      console.error('Error fetching members:', err);
    }
  }, []);

  // Fetch team challenges
  const fetchChallenges = useCallback(async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (err: any) {
      console.error('Error fetching challenges:', err);
    }
  }, []);

  // Fetch team achievements
  const fetchAchievements = useCallback(async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_achievements')
        .select('*')
        .eq('team_id', teamId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
    }
  }, []);

  // Fetch team activity
  const fetchActivity = useCallback(async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_activity')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivity(data || []);
    } catch (err: any) {
      console.error('Error fetching activity:', err);
    }
  }, []);

  // Calculate team stats
  const calculateTeamStats = useCallback(async (teamId: string) => {
    try {
      const activeMembers = members.filter(m => m.status === 'active');
      const activeChallenges = challenges.filter(c => c.status === 'active');
      const completedChallenges = challenges.filter(c => c.status === 'completed');

      // Get all challenge progress
      const challengeIds = challenges.map(c => c.id);
      let totalCompletions = 0;
      let weeklyCompletions = 0;
      const memberCompletions: Record<string, number> = {};

      if (challengeIds.length > 0) {
        const { data: progress } = await supabase
          .from('team_challenge_progress')
          .select('*')
          .in('challenge_id', challengeIds);

        if (progress) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          progress.forEach(p => {
            totalCompletions += p.completions;
            memberCompletions[p.user_id] = (memberCompletions[p.user_id] || 0) + p.completions;
            
            if (p.last_completed_at && new Date(p.last_completed_at) > weekAgo) {
              weeklyCompletions += p.completions;
            }
          });
        }
      }

      // Find top performer
      let topPerformer: TeamMember | null = null;
      let maxCompletions = 0;
      Object.entries(memberCompletions).forEach(([userId, completions]) => {
        if (completions > maxCompletions) {
          maxCompletions = completions;
          topPerformer = members.find(m => m.user_id === userId) || null;
        }
      });

      setTeamStats({
        totalCompletions,
        activeChallenges: activeChallenges.length,
        completedChallenges: completedChallenges.length,
        totalAchievements: achievements.length,
        memberCount: activeMembers.length + 1, // +1 for owner
        weeklyCompletions,
        topPerformer
      });
    } catch (err: any) {
      console.error('Error calculating stats:', err);
    }
  }, [members, challenges, achievements]);

  // Create a new team
  const createTeam = async (name: string, description?: string) => {
    if (!user || !isUltimate) {
      toast({
        title: 'Ultimate Required',
        description: 'Team features are only available for Ultimate tier subscribers.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add owner as a member
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user.id,
          email: user.email,
          display_name: profile?.full_name || user.email?.split('@')[0],
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      // Log activity
      await logActivity(data.id, 'team_created', { name });

      setTeams(prev => [...prev, data]);
      setCurrentTeam(data);
      
      toast({
        title: 'Team Created!',
        description: `${name} has been created successfully.`
      });

      return data;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  // Invite a member
  const inviteMember = async (teamId: string, email: string, displayName?: string) => {
    if (!user) return false;

    const team = teams.find(t => t.id === teamId);
    if (!team) return false;

    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'pending');
    if (activeMembers.length >= team.max_members - 1) {
      toast({
        title: 'Team Full',
        description: `This team can only have ${team.max_members} members including the owner.`,
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Check if already invited
      const existing = members.find(m => m.email === email);
      if (existing) {
        toast({
          title: 'Already Invited',
          description: 'This person has already been invited to the team.',
          variant: 'destructive'
        });
        return false;
      }

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id, // Placeholder, will be updated when they accept
          email,
          display_name: displayName || email.split('@')[0],
          role: 'member',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity(teamId, 'member_invited', { email, displayName });

      setMembers(prev => [...prev, data]);
      
      toast({
        title: 'Invitation Sent!',
        description: `An invitation has been sent to ${email}.`
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Accept team invitation
  const acceptInvitation = async (memberId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          user_id: user.id,
          status: 'active',
          joined_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      await fetchTeams();
      
      toast({
        title: 'Welcome to the Team!',
        description: 'You have successfully joined the team.'
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Remove a member
  const removeMember = async (memberId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      if (member && currentTeam) {
        await logActivity(currentTeam.id, 'member_removed', { 
          displayName: member.display_name 
        });
      }

      setMembers(prev => prev.filter(m => m.id !== memberId));
      
      toast({
        title: 'Member Removed',
        description: 'The team member has been removed.'
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Create a team challenge
  const createChallenge = async (
    teamId: string,
    title: string,
    habitName: string,
    targetCompletions: number,
    startDate: string,
    endDate: string,
    description?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .insert({
          team_id: teamId,
          title,
          description,
          habit_name: habitName,
          target_completions: targetCompletions,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity(teamId, 'challenge_created', { title, habitName });

      setChallenges(prev => [data, ...prev]);
      
      toast({
        title: 'Challenge Created!',
        description: `${title} challenge has been started.`
      });

      return data;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  // Update challenge progress
  const updateChallengeProgress = async (challengeId: string, completions: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_challenge_progress')
        .upsert({
          challenge_id: challengeId,
          user_id: user.id,
          completions,
          last_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'challenge_id,user_id'
        });

      if (error) throw error;

      // Check for achievements
      await checkChallengeAchievements(challengeId);

      return true;
    } catch (err: any) {
      console.error('Error updating progress:', err);
      return false;
    }
  };

  // Get challenge leaderboard
  const getChallengeLeaderboard = async (challengeId: string): Promise<TeamChallengeProgress[]> => {
    try {
      const { data, error } = await supabase
        .from('team_challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('completions', { ascending: false });

      if (error) throw error;

      // Attach member info
      const progressWithMembers = (data || []).map(p => ({
        ...p,
        member: members.find(m => m.user_id === p.user_id)
      }));

      return progressWithMembers;
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      return [];
    }
  };

  // Check and award achievements
  const checkChallengeAchievements = async (challengeId: string) => {
    if (!currentTeam) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const leaderboard = await getChallengeLeaderboard(challengeId);
    const totalCompletions = leaderboard.reduce((sum, p) => sum + p.completions, 0);

    // Team milestone achievements
    const milestones = [10, 50, 100, 500, 1000];
    for (const milestone of milestones) {
      if (totalCompletions >= milestone) {
        const existing = achievements.find(
          a => a.type === 'team_milestone' && a.metadata.milestone === milestone
        );
        if (!existing) {
          await awardAchievement(currentTeam.id, 'team_milestone', 
            `${milestone} Team Completions`, 
            `The team reached ${milestone} total completions!`,
            '🏆',
            { milestone }
          );
        }
      }
    }
  };

  // Award an achievement
  const awardAchievement = async (
    teamId: string,
    type: string,
    title: string,
    description: string,
    icon: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('team_achievements')
        .insert({
          team_id: teamId,
          type,
          title,
          description,
          icon,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      setAchievements(prev => [data, ...prev]);
      
      toast({
        title: 'Team Achievement Unlocked!',
        description: title
      });

      return data;
    } catch (err: any) {
      console.error('Error awarding achievement:', err);
      return null;
    }
  };

  // Log team activity
  const logActivity = async (teamId: string, action: string, details: Record<string, any> = {}) => {
    if (!user) return;

    try {
      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: user.id,
          action,
          details
        });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Join team by invite code
  const joinByInviteCode = async (inviteCode: string) => {
    if (!user) return false;

    try {
      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (teamError || !team) {
        toast({
          title: 'Invalid Code',
          description: 'The invite code is invalid or expired.',
          variant: 'destructive'
        });
        return false;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: 'Already a Member',
          description: 'You are already a member of this team.',
          variant: 'destructive'
        });
        return false;
      }

      // Check team capacity
      const { data: memberCount } = await supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('team_id', team.id)
        .in('status', ['active', 'pending']);

      if (memberCount && memberCount.length >= team.max_members - 1) {
        toast({
          title: 'Team Full',
          description: 'This team has reached its maximum capacity.',
          variant: 'destructive'
        });
        return false;
      }

      // Add as member
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          email: user.email,
          display_name: profile?.full_name || user.email?.split('@')[0],
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (error) throw error;

      await logActivity(team.id, 'member_joined', { 
        displayName: profile?.full_name || user.email 
      });

      await fetchTeams();
      
      toast({
        title: 'Welcome to the Team!',
        description: `You have joined ${team.name}.`
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete team
  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      setTeams(prev => prev.filter(t => t.id !== teamId));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(teams.find(t => t.id !== teamId) || null);
      }
      
      toast({
        title: 'Team Deleted',
        description: 'The team has been permanently deleted.'
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Update team
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      setTeams(prev => prev.map(t => t.id === teamId ? data : t));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(data);
      }
      
      toast({
        title: 'Team Updated',
        description: 'Team settings have been saved.'
      });

      return data;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  // Load team data when current team changes
  useEffect(() => {
    if (currentTeam) {
      fetchMembers(currentTeam.id);
      fetchChallenges(currentTeam.id);
      fetchAchievements(currentTeam.id);
      fetchActivity(currentTeam.id);
    }
  }, [currentTeam, fetchMembers, fetchChallenges, fetchAchievements, fetchActivity]);

  // Calculate stats when data changes
  useEffect(() => {
    if (currentTeam && members.length > 0) {
      calculateTeamStats(currentTeam.id);
    }
  }, [currentTeam, members, challenges, achievements, calculateTeamStats]);

  // Initial fetch
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    currentTeam,
    setCurrentTeam,
    members,
    challenges,
    achievements,
    activity,
    teamStats,
    loading,
    error,
    isUltimate,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    acceptInvitation,
    removeMember,
    joinByInviteCode,
    createChallenge,
    updateChallengeProgress,
    getChallengeLeaderboard,
    logActivity,
    refreshTeams: fetchTeams,
    refreshMembers: () => currentTeam && fetchMembers(currentTeam.id),
    refreshChallenges: () => currentTeam && fetchChallenges(currentTeam.id)
  };
}
