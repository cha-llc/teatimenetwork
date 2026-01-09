import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits, Streak } from './useHabits';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'consistency' | 'special';
  requirement: number;
  points: number;
  color: string;
  gradient: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  habit_id: string | null;
}

export interface PointsEntry {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  habit_id: string | null;
  created_at: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  points_reward: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  achievement_count: number;
  best_streak: number;
  rank: number;
}

// Define all available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak on any habit',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    points: 100,
    color: 'from-orange-400 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-400 to-red-500'
  },
  {
    id: 'streak_14',
    name: 'Two Week Champion',
    description: 'Maintain a 14-day streak on any habit',
    icon: '⚡',
    category: 'streak',
    requirement: 14,
    points: 250,
    color: 'from-yellow-400 to-orange-500',
    gradient: 'bg-gradient-to-br from-yellow-400 to-orange-500'
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak on any habit',
    icon: '🏆',
    category: 'streak',
    requirement: 30,
    points: 500,
    color: 'from-amber-400 to-yellow-500',
    gradient: 'bg-gradient-to-br from-amber-400 to-yellow-500'
  },
  {
    id: 'streak_60',
    name: 'Discipline Dynamo',
    description: 'Maintain a 60-day streak on any habit',
    icon: '💎',
    category: 'streak',
    requirement: 60,
    points: 1000,
    color: 'from-cyan-400 to-blue-500',
    gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500'
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak on any habit',
    icon: '👑',
    category: 'streak',
    requirement: 100,
    points: 2000,
    color: 'from-purple-400 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-400 to-pink-500'
  },
  {
    id: 'streak_365',
    name: 'Year of Excellence',
    description: 'Maintain a 365-day streak on any habit',
    icon: '🌟',
    category: 'streak',
    requirement: 365,
    points: 10000,
    color: 'from-indigo-400 to-purple-600',
    gradient: 'bg-gradient-to-br from-indigo-400 to-purple-600'
  },
  // Completion achievements
  {
    id: 'completions_10',
    name: 'Getting Started',
    description: 'Complete 10 total habit check-ins',
    icon: '🌱',
    category: 'completion',
    requirement: 10,
    points: 50,
    color: 'from-green-400 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-400 to-emerald-500'
  },
  {
    id: 'completions_50',
    name: 'Building Momentum',
    description: 'Complete 50 total habit check-ins',
    icon: '🚀',
    category: 'completion',
    requirement: 50,
    points: 150,
    color: 'from-blue-400 to-indigo-500',
    gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500'
  },
  {
    id: 'completions_100',
    name: 'Century Completions',
    description: 'Complete 100 total habit check-ins',
    icon: '💯',
    category: 'completion',
    requirement: 100,
    points: 300,
    color: 'from-violet-400 to-purple-500',
    gradient: 'bg-gradient-to-br from-violet-400 to-purple-500'
  },
  {
    id: 'completions_500',
    name: 'Habit Hero',
    description: 'Complete 500 total habit check-ins',
    icon: '🦸',
    category: 'completion',
    requirement: 500,
    points: 1000,
    color: 'from-rose-400 to-red-500',
    gradient: 'bg-gradient-to-br from-rose-400 to-red-500'
  },
  {
    id: 'completions_1000',
    name: 'Legendary',
    description: 'Complete 1000 total habit check-ins',
    icon: '🏅',
    category: 'completion',
    requirement: 1000,
    points: 2500,
    color: 'from-amber-300 to-orange-500',
    gradient: 'bg-gradient-to-br from-amber-300 to-orange-500'
  },
  // Consistency achievements
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all habits every day for a week',
    icon: '✨',
    category: 'consistency',
    requirement: 7,
    points: 200,
    color: 'from-teal-400 to-cyan-500',
    gradient: 'bg-gradient-to-br from-teal-400 to-cyan-500'
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: 'Complete all habits every day for a month',
    icon: '🌙',
    category: 'consistency',
    requirement: 30,
    points: 1000,
    color: 'from-slate-400 to-gray-600',
    gradient: 'bg-gradient-to-br from-slate-400 to-gray-600'
  },
  {
    id: 'habits_5',
    name: 'Multi-Tasker',
    description: 'Track 5 different habits simultaneously',
    icon: '🎯',
    category: 'consistency',
    requirement: 5,
    points: 150,
    color: 'from-pink-400 to-rose-500',
    gradient: 'bg-gradient-to-br from-pink-400 to-rose-500'
  },
  // Special achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join The Tea Time Network',
    icon: '🍵',
    category: 'special',
    requirement: 1,
    points: 100,
    color: 'from-[#7C9885] to-[#5a7363]',
    gradient: 'bg-gradient-to-br from-[#7C9885] to-[#5a7363]'
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete habits on 4 consecutive weekends',
    icon: '🎉',
    category: 'special',
    requirement: 4,
    points: 200,
    color: 'from-fuchsia-400 to-pink-500',
    gradient: 'bg-gradient-to-br from-fuchsia-400 to-pink-500'
  },
];

export const useGamification = () => {
  const { user, profile } = useAuth();
  const { habits, completions, streaks } = useHabits();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user achievements
  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setUserAchievements(data);
    }
  }, [user]);

  // Fetch points history
  const fetchPoints = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPointsHistory(data);
      const total = data.reduce((sum, entry) => sum + entry.points, 0);
      setTotalPoints(total);
    }
  }, [user]);

  // Fetch weekly challenges
  const fetchChallenges = useCallback(async () => {
    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      setWeeklyChallenges(data);
    }
  }, []);

  // Fetch challenge progress
  const fetchChallengeProgress = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setChallengeProgress(data);
    }
  }, [user]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    // Get all profiles with their points
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url');

    if (profilesError || !profiles) return;

    // Get points for each profile
    const leaderboardData: LeaderboardEntry[] = [];

    for (const profile of profiles) {
      const { data: points } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', profile.id);

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', profile.id);

      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', profile.id);

      const totalPts = points?.reduce((sum, p) => sum + p.points, 0) || 0;
      const achievementCount = achievements?.length || 0;
      const bestStreak = Math.max(...(streakData?.map(s => s.current_streak) || [0]));

      if (totalPts > 0 || achievementCount > 0) {
        leaderboardData.push({
          profile_id: profile.id,
          full_name: profile.full_name || 'Anonymous',
          avatar_url: profile.avatar_url,
          total_points: totalPts,
          achievement_count: achievementCount,
          best_streak: bestStreak,
          rank: 0
        });
      }
    }

    // Sort and assign ranks
    leaderboardData.sort((a, b) => b.total_points - a.total_points);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboard(leaderboardData.slice(0, 50)); // Top 50
  }, []);

  // Award achievement
  const awardAchievement = async (achievementId: string, habitId?: string) => {
    if (!user) return;

    // Check if already earned
    const alreadyEarned = userAchievements.some(a => a.achievement_id === achievementId);
    if (alreadyEarned) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    // Insert achievement
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
        habit_id: habitId || null
      })
      .select()
      .single();

    if (!error && data) {
      setUserAchievements(prev => [...prev, data]);

      // Award points
      await addPoints(achievement.points, `Earned achievement: ${achievement.name}`, habitId);

      return achievement;
    }
  };

  // Add points
  const addPoints = async (points: number, reason: string, habitId?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_points')
      .insert({
        user_id: user.id,
        points,
        reason,
        habit_id: habitId || null
      })
      .select()
      .single();

    if (!error && data) {
      setPointsHistory(prev => [data, ...prev]);
      setTotalPoints(prev => prev + points);
    }
  };

  // Update challenge progress
  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    if (!user) return;

    const challenge = weeklyChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const isCompleted = progress >= challenge.target_value;

    const { data, error } = await supabase
      .from('user_challenge_progress')
      .upsert({
        user_id: user.id,
        challenge_id: challengeId,
        current_progress: progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (!error && data) {
      setChallengeProgress(prev => {
        const existing = prev.findIndex(p => p.challenge_id === challengeId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });

      // Award points if completed
      if (isCompleted) {
        await addPoints(challenge.points_reward, `Completed challenge: ${challenge.title}`);
      }
    }
  };

  // Check and award achievements based on current stats
  const checkAchievements = useCallback(async () => {
    if (!user || !habits.length) return;

    const earnedIds = userAchievements.map(a => a.achievement_id);

    // Check streak achievements
    const maxStreak = Math.max(...Object.values(streaks).map(s => s?.current_streak || 0), 0);
    const streakAchievements = ACHIEVEMENTS.filter(a => a.category === 'streak');
    
    for (const achievement of streakAchievements) {
      if (!earnedIds.includes(achievement.id) && maxStreak >= achievement.requirement) {
        const habitWithStreak = Object.entries(streaks).find(
          ([, s]) => s?.current_streak >= achievement.requirement
        );
        await awardAchievement(achievement.id, habitWithStreak?.[0]);
      }
    }

    // Check completion achievements
    const totalCompletions = completions.length;
    const completionAchievements = ACHIEVEMENTS.filter(a => a.category === 'completion');
    
    for (const achievement of completionAchievements) {
      if (!earnedIds.includes(achievement.id) && totalCompletions >= achievement.requirement) {
        await awardAchievement(achievement.id);
      }
    }

    // Check habit count achievement
    if (!earnedIds.includes('habits_5') && habits.length >= 5) {
      await awardAchievement('habits_5');
    }

    // Check early adopter (everyone gets this)
    if (!earnedIds.includes('early_adopter')) {
      await awardAchievement('early_adopter');
    }
  }, [user, habits, completions, streaks, userAchievements]);

  // Calculate level based on points
  const getLevel = () => {
    const levels = [
      { level: 1, name: 'Beginner', minPoints: 0, maxPoints: 100 },
      { level: 2, name: 'Apprentice', minPoints: 100, maxPoints: 300 },
      { level: 3, name: 'Practitioner', minPoints: 300, maxPoints: 600 },
      { level: 4, name: 'Adept', minPoints: 600, maxPoints: 1000 },
      { level: 5, name: 'Expert', minPoints: 1000, maxPoints: 1500 },
      { level: 6, name: 'Master', minPoints: 1500, maxPoints: 2500 },
      { level: 7, name: 'Grandmaster', minPoints: 2500, maxPoints: 4000 },
      { level: 8, name: 'Legend', minPoints: 4000, maxPoints: 6000 },
      { level: 9, name: 'Mythic', minPoints: 6000, maxPoints: 10000 },
      { level: 10, name: 'Transcendent', minPoints: 10000, maxPoints: Infinity },
    ];

    const currentLevel = levels.find(l => totalPoints >= l.minPoints && totalPoints < l.maxPoints) || levels[0];
    const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
    const progress = nextLevel 
      ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
      : 100;

    return {
      ...currentLevel,
      progress,
      pointsToNext: nextLevel ? nextLevel.minPoints - totalPoints : 0
    };
  };

  // Get user's rank on leaderboard
  const getUserRank = () => {
    if (!user) return null;
    return leaderboard.find(e => e.profile_id === user.id);
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      Promise.all([
        fetchAchievements(),
        fetchPoints(),
        fetchChallenges(),
        fetchChallengeProgress(),
        fetchLeaderboard()
      ]).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, fetchAchievements, fetchPoints, fetchChallenges, fetchChallengeProgress, fetchLeaderboard]);

  // Check achievements when data changes
  useEffect(() => {
    if (!loading && user) {
      checkAchievements();
    }
  }, [loading, habits, completions, streaks, checkAchievements]);

  return {
    achievements: ACHIEVEMENTS,
    userAchievements,
    pointsHistory,
    totalPoints,
    weeklyChallenges,
    challengeProgress,
    leaderboard,
    loading,
    level: getLevel(),
    userRank: getUserRank(),
    awardAchievement,
    addPoints,
    updateChallengeProgress,
    refreshLeaderboard: fetchLeaderboard,
    refreshAchievements: fetchAchievements
  };
};
