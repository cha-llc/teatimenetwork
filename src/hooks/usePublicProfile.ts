import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Achievement, ACHIEVEMENTS } from './useGamification';

export interface PublicProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  twitter_handle: string | null;
  is_public: boolean;
  is_premium: boolean;
  subscription_tier: string | null;
  joined_at: string;
  followerCount: number;
  followingCount: number;
}

export interface PublicStreak {
  id: string;
  current_streak: number;
  longest_streak: number;
  habits: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface PublicHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  created_at: string;
}

export interface PublicStatistics {
  totalCompletions: number;
  totalPoints: number;
  bestStreak: number;
  totalStreakDays: number;
  habitsCount: number;
  achievementsCount: number;
}

export interface PrivacySettings {
  show_achievements: boolean;
  show_streaks: boolean;
  show_habits: boolean;
  show_statistics: boolean;
  show_activity: boolean;
  show_followers: boolean;
  show_following: boolean;
  allow_follow_requests: boolean;
}

export interface PublicProfileData {
  profile: PublicProfile;
  privacy: PrivacySettings;
  achievements: { achievement_id: string; earned_at: string }[];
  streaks: PublicStreak[];
  habits: PublicHabit[];
  statistics: PublicStatistics | null;
}

export const usePublicProfile = (username: string | undefined) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('public-profile', {
        body: { action: 'get-profile', username }
      });

      if (fnError) {
        setError('Failed to load profile');
        setLoading(false);
        return;
      }

      if (data.error) {
        if (data.isPrivate) {
          setIsPrivate(true);
          setProfileData({
            profile: {
              id: '',
              full_name: data.displayName,
              display_name: data.displayName,
              username: data.username,
              avatar_url: null,
              bio: null,
              location: null,
              website: null,
              twitter_handle: null,
              is_public: false,
              is_premium: false,
              subscription_tier: null,
              joined_at: '',
              followerCount: 0,
              followingCount: 0
            },
            privacy: {
              show_achievements: false,
              show_streaks: false,
              show_habits: false,
              show_statistics: false,
              show_activity: false,
              show_followers: false,
              show_following: false,
              allow_follow_requests: false
            },
            achievements: [],
            streaks: [],
            habits: [],
            statistics: null
          });
        } else {
          setError(data.error);
        }
        setLoading(false);
        return;
      }

      setProfileData(data);
      setIsPrivate(false);
    } catch (err) {
      setError('An error occurred while loading the profile');
    } finally {
      setLoading(false);
    }
  }, [username]);

  const checkFollowing = useCallback(async () => {
    if (!user || !profileData?.profile.id) return;

    try {
      const { data } = await supabase.functions.invoke('public-profile', {
        body: {
          action: 'check-following',
          userId: profileData.profile.id,
          followerId: user.id
        }
      });

      setIsFollowing(data?.isFollowing || false);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  }, [user, profileData?.profile.id]);

  const toggleFollow = async () => {
    if (!user || !profileData?.profile.id) return;

    setFollowLoading(true);
    try {
      const action = isFollowing ? 'unfollow' : 'follow';
      const { data, error: fnError } = await supabase.functions.invoke('public-profile', {
        body: {
          action,
          userId: profileData.profile.id,
          followerId: user.id
        }
      });

      if (!fnError && data?.success) {
        setIsFollowing(!isFollowing);
        // Update follower count
        setProfileData(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            followerCount: prev.profile.followerCount + (isFollowing ? -1 : 1)
          }
        } : null);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Get enriched achievements with full data
  const getEnrichedAchievements = (): (Achievement & { earned_at: string })[] => {
    if (!profileData?.achievements) return [];
    
    return profileData.achievements
      .map(ua => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievement_id);
        if (achievement) {
          return { ...achievement, earned_at: ua.earned_at };
        }
        return null;
      })
      .filter((a): a is Achievement & { earned_at: string } => a !== null);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileData?.profile.id) {
      checkFollowing();
    }
  }, [profileData?.profile.id, checkFollowing]);

  return {
    profileData,
    loading,
    error,
    isPrivate,
    isFollowing,
    followLoading,
    toggleFollow,
    refreshProfile: fetchProfile,
    getEnrichedAchievements,
    isOwnProfile: user?.id === profileData?.profile.id
  };
};
