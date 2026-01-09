import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Flame, 
  Target, 
  Calendar, 
  Lock, 
  Share2, 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Clock,
  CheckCircle,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Copy,
  X
} from 'lucide-react';
import { usePublicProfile, PublicStatistics } from '@/hooks/usePublicProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Achievement, ACHIEVEMENTS } from '@/hooks/useGamification';
import SEOHead from '@/components/seo/SEOHead';
import PublicProfileHeader from '@/components/profile/PublicProfileHeader';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    profileData,
    loading,
    error,
    isPrivate,
    isFollowing,
    followLoading,
    toggleFollow,
    getEnrichedAchievements,
    isOwnProfile
  } = usePublicProfile(username);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const enrichedAchievements = getEnrichedAchievements();
  const displayName = profileData?.profile.display_name || profileData?.profile.full_name || username;

  // Generate Person schema for SEO
  const generatePersonSchema = () => {
    if (!profileData?.profile) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: displayName,
      alternateName: profileData.profile.username,
      description: profileData.profile.bio || `${displayName}'s habit tracking profile on Tea Time Network`,
      url: `https://teatimenetwork.com/user/${profileData.profile.username}`,
      image: profileData.profile.avatar_url || undefined,
      sameAs: [
        profileData.profile.twitter_handle ? `https://twitter.com/${profileData.profile.twitter_handle}` : null,
        profileData.profile.website || null
      ].filter(Boolean),
      memberOf: {
        '@type': 'Organization',
        name: 'Tea Time Network',
        url: 'https://teatimenetwork.com'
      }
    };
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyProfileLink = async () => {
    const url = `${window.location.origin}/user/${username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out ${displayName}'s habit tracking journey on Tea Time Network! 🍵`);
    const url = encodeURIComponent(`${window.location.origin}/user/${username}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(`${window.location.origin}/user/${username}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(`${window.location.origin}/user/${username}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7C9885] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isPrivate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user @{username} doesn't exist or their profile is unavailable.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#7C9885] to-[#5a7363] text-white rounded-xl font-medium hover:from-[#6a8673] hover:to-[#4a6353] transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Private profile state
  if (isPrivate) {
    return (
      <>
        <SEOHead
          title={`${displayName} (@${username}) | Tea Time Network`}
          description={`${displayName}'s profile on Tea Time Network - This profile is private.`}
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Private Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              @{username}'s profile is private. They need to make their profile public to view their achievements and habits.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-[#7C9885] to-[#5a7363] text-white rounded-xl font-medium hover:from-[#6a8673] hover:to-[#4a6353] transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!profileData) return null;

  const { profile, privacy, statistics, streaks, habits } = profileData;

  return (
    <>
      <SEOHead
        title={`${displayName} (@${profile.username}) | Tea Time Network`}
        description={profile.bio || `View ${displayName}'s habit tracking achievements, streaks, and progress on Tea Time Network.`}
        keywords={`${displayName}, ${profile.username}, habit tracker, achievements, streaks, Tea Time Network`}
        canonicalUrl={`https://teatimenetwork.com/user/${profile.username}`}
        ogImage={profile.avatar_url || undefined}
        ogType="website"
        structuredData={generatePersonSchema() || undefined}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Back Navigation */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{displayName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {statistics?.totalCompletions.toLocaleString() || 0} completions
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Profile Header */}
          <PublicProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onToggleFollow={toggleFollow}
            onShare={handleShare}
            onEditProfile={() => setShowSettingsModal(true)}
          />

          {/* Statistics Cards */}
          {privacy.show_statistics && statistics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={<Flame className="w-5 h-5 text-orange-500" />}
                label="Best Streak"
                value={`${statistics.bestStreak} days`}
                gradient="from-orange-500/10 to-red-500/10"
              />
              <StatCard
                icon={<Target className="w-5 h-5 text-green-500" />}
                label="Completions"
                value={statistics.totalCompletions.toLocaleString()}
                gradient="from-green-500/10 to-emerald-500/10"
              />
              <StatCard
                icon={<Zap className="w-5 h-5 text-purple-500" />}
                label="Total Points"
                value={statistics.totalPoints.toLocaleString()}
                gradient="from-purple-500/10 to-indigo-500/10"
              />
              <StatCard
                icon={<Award className="w-5 h-5 text-amber-500" />}
                label="Achievements"
                value={statistics.achievementsCount.toString()}
                gradient="from-amber-500/10 to-yellow-500/10"
              />
            </div>
          )}

          {/* Achievements Section */}
          {privacy.show_achievements && enrichedAchievements.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {enrichedAchievements.length} badges earned
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {enrichedAchievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </section>
          )}

          {/* Active Streaks Section */}
          {privacy.show_streaks && streaks.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Streaks</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Currently maintaining {streaks.filter(s => s.current_streak > 0).length} streaks
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {streaks
                  .filter(s => s.current_streak > 0)
                  .sort((a, b) => b.current_streak - a.current_streak)
                  .slice(0, 6)
                  .map((streak) => (
                    <StreakCard key={streak.id} streak={streak} />
                  ))}
              </div>
            </section>
          )}

          {/* Habits Section */}
          {privacy.show_habits && habits.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C9885] to-[#5a7363] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Habits</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tracking {habits.length} habits
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {habits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!privacy.show_achievements && !privacy.show_streaks && !privacy.show_habits && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
              <Lock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Limited Profile
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                This user has chosen to keep most of their profile information private.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Profile</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center gap-2 p-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 rounded-xl transition-colors"
              >
                <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Twitter</span>
              </button>
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-2 p-4 bg-[#4267B2]/10 hover:bg-[#4267B2]/20 rounded-xl transition-colors"
              >
                <Facebook className="w-6 h-6 text-[#4267B2]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Facebook</span>
              </button>
              <button
                onClick={shareToLinkedIn}
                className="flex flex-col items-center gap-2 p-4 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 rounded-xl transition-colors"
              >
                <Linkedin className="w-6 h-6 text-[#0077B5]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">LinkedIn</span>
              </button>
              <button
                onClick={copyProfileLink}
                className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Copy className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Profile Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/user/${username}`}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showSettingsModal && (
        <ProfileSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}> = ({ icon, label, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 border border-gray-100 dark:border-gray-800`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

// Achievement Badge Component
const AchievementBadge: React.FC<{ achievement: Achievement & { earned_at: string } }> = ({ achievement }) => (
  <div className="group relative">
    <div className={`w-full aspect-square rounded-2xl ${achievement.gradient} flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-105`}>
      {achievement.icon}
    </div>
    <p className="text-xs text-center mt-2 text-gray-700 dark:text-gray-300 font-medium truncate">
      {achievement.name}
    </p>
    
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
        <p className="font-semibold">{achievement.name}</p>
        <p className="text-gray-300">{achievement.description}</p>
        <p className="text-green-400 mt-1">+{achievement.points} pts</p>
      </div>
    </div>
  </div>
);

// Streak Card Component
const StreakCard: React.FC<{ streak: any }> = ({ streak }) => (
  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl shadow-lg">
      {streak.habits?.icon || '🔥'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 dark:text-white truncate">
        {streak.habits?.name || 'Unknown Habit'}
      </p>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-orange-600 dark:text-orange-400 font-medium">
          {streak.current_streak} day streak
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Best: {streak.longest_streak}
        </span>
      </div>
    </div>
    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
  </div>
);

// Habit Card Component
const HabitCard: React.FC<{ habit: any }> = ({ habit }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
      style={{ backgroundColor: habit.color + '20' }}
    >
      {habit.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-white truncate">{habit.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{habit.frequency}</p>
    </div>
  </div>
);

export default UserProfilePage;
