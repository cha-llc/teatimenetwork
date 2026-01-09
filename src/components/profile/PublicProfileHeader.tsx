import React, { useState } from 'react';
import { 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  Calendar, 
  Shield, 
  Crown, 
  UserPlus, 
  UserMinus, 
  Share2, 
  Settings,
  CheckCircle,
  Users,
  Loader2
} from 'lucide-react';
import { PublicProfile } from '@/hooks/usePublicProfile';
import { useNavigate } from 'react-router-dom';

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onToggleFollow: () => void;
  onShare: () => void;
  onEditProfile?: () => void;
}

const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  followLoading,
  onToggleFollow,
  onShare,
  onEditProfile
}) => {
  const navigate = useNavigate();
  const displayName = profile.display_name || profile.full_name || profile.username;
  const joinedDate = profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : null;

  const getTierBadge = () => {
    if (!profile.is_premium) return null;
    
    const tierConfig: Record<string, { label: string; gradient: string; icon: React.ReactNode }> = {
      starter: {
        label: 'Starter',
        gradient: 'from-emerald-400 to-teal-500',
        icon: <Shield className="w-3 h-3" />
      },
      pro: {
        label: 'Pro',
        gradient: 'from-purple-400 to-indigo-500',
        icon: <Crown className="w-3 h-3" />
      },
      ultimate: {
        label: 'Ultimate',
        gradient: 'from-amber-400 to-orange-500',
        icon: <Crown className="w-3 h-3" />
      }
    };

    const tier = tierConfig[profile.subscription_tier || 'starter'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${tier.gradient}`}>
        {tier.icon}
        {tier.label}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 sm:h-48 bg-gradient-to-br from-[#7C9885] via-[#5a7363] to-[#3d4d42] relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 sm:-mt-20 mb-4">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-[#7C9885] to-[#5a7363] shadow-xl">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Online indicator */}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
        </div>

        {/* Name and Username */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              {profile.is_premium && (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              )}
              {getTierBadge()}
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              @{profile.username}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#7C9885] hover:underline"
                >
                  <LinkIcon className="w-4 h-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.twitter_handle && (
                <a 
                  href={`https://twitter.com/${profile.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#1DA1F2] hover:underline"
                >
                  <Twitter className="w-4 h-4" />
                  @{profile.twitter_handle}
                </a>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {joinedDate}
                </span>
              )}
            </div>

            {/* Follower Stats */}
            <div className="flex items-center gap-6 mt-4">
              <button className="flex items-center gap-1 hover:text-[#7C9885] transition-colors">
                <span className="font-bold text-gray-900 dark:text-white">
                  {profile.followerCount.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">Followers</span>
              </button>
              <button className="flex items-center gap-1 hover:text-[#7C9885] transition-colors">
                <span className="font-bold text-gray-900 dark:text-white">
                  {profile.followingCount.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">Following</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={onEditProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={onShare}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onToggleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                      : 'bg-gradient-to-r from-[#7C9885] to-[#5a7363] hover:from-[#6a8673] hover:to-[#4a6353] text-white shadow-lg shadow-[#7C9885]/25'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
                <button
                  onClick={onShare}
                  className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileHeader;
