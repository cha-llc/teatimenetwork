import React, { useState } from 'react';
import { 
  Trophy, Star, Flame, Target, Zap, Crown, 
  Gift, Sparkles, TrendingUp, Award, Lock, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification, Achievement } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/navigation/Navbar';
import AchievementBadge from '@/components/gamification/AchievementBadge';
import WeeklyChallenges from '@/components/gamification/WeeklyChallenges';
import Leaderboard from '@/components/gamification/Leaderboard';
import SettingsModal from '@/components/dashboard/SettingsModal';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

const GamificationPage: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    achievements,
    userAchievements,
    pointsHistory,
    totalPoints,
    weeklyChallenges,
    challengeProgress,
    leaderboard,
    loading,
    level,
    userRank,
    refreshLeaderboard
  } = useGamification();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState('achievements');

  const isPremium = profile?.is_premium || false;

  const earnedAchievementIds = userAchievements.map(a => a.achievement_id);
  const earnedCount = userAchievements.length;
  const totalAchievements = achievements.length;

  const streakAchievements = achievements.filter(a => a.category === 'streak');
  const completionAchievements = achievements.filter(a => a.category === 'completion');
  const consistencyAchievements = achievements.filter(a => a.category === 'consistency');
  const specialAchievements = achievements.filter(a => a.category === 'special');

  const getLevelColor = () => {
    if (level.level <= 3) return 'from-green-400 to-emerald-500';
    if (level.level <= 5) return 'from-blue-400 to-indigo-500';
    if (level.level <= 7) return 'from-purple-400 to-pink-500';
    return 'from-amber-400 to-orange-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C9885]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-x-hidden">
      {/* Navigation */}
      <Navbar 
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
      />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Level & Points Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLevelColor()} flex items-center justify-center`}>
                    <span className="text-white font-bold">{level.level}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{level.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Level {level.level}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalPoints.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Progress to Level {level.level + 1}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {level.pointsToNext > 0 ? `${level.pointsToNext} pts to go` : 'Max Level!'}
                </span>
              </div>
              <Progress value={level.progress} className="h-3" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xl font-bold text-gray-800 dark:text-white">{earnedCount}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Badges Earned</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-xl font-bold text-gray-800 dark:text-white">
                    {challengeProgress.filter(p => p.is_completed).length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Challenges Done</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xl font-bold text-gray-800 dark:text-white">#{userRank?.rank || '-'}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Leaderboard</p>
              </div>
            </div>
          </div>

          {/* Streak Milestones */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6" />
              <h3 className="font-semibold">Streak Milestones</h3>
            </div>
            <div className="space-y-3">
              {[7, 30, 100].map(days => {
                const achieved = earnedAchievementIds.includes(`streak_${days}`);
                return (
                  <div key={days} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {achieved ? (
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-yellow-300" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white/50" />
                        </div>
                      )}
                      <span className={achieved ? 'text-white' : 'text-white/60'}>
                        {days}-Day Streak
                      </span>
                    </div>
                    <span className={`text-sm ${achieved ? 'text-yellow-300' : 'text-white/40'}`}>
                      {achieved ? 'Earned!' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-white/80">
                Keep your streaks going to unlock exclusive badges!
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
            <TabsTrigger 
              value="achievements" 
              className="rounded-lg data-[state=active]:bg-[#7C9885] data-[state=active]:text-white"
            >
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger 
              value="challenges" 
              className="rounded-lg data-[state=active]:bg-[#7C9885] data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard" 
              className="rounded-lg data-[state=active]:bg-[#7C9885] data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-lg data-[state=active]:bg-[#7C9885] data-[state=active]:text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Points History
            </TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8">
            {/* Progress Overview */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">Achievement Progress</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {earnedCount} / {totalAchievements} unlocked
                </span>
              </div>
              <Progress value={(earnedCount / totalAchievements) * 100} className="h-3" />
            </div>

            {/* Streak Achievements */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Streak Achievements</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {streakAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    earned={userAchievements.find(a => a.achievement_id === achievement.id)}
                    size="md"
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </div>
            </div>

            {/* Completion Achievements */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Completion Achievements</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {completionAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    earned={userAchievements.find(a => a.achievement_id === achievement.id)}
                    size="md"
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </div>
            </div>

            {/* Consistency Achievements */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Consistency Achievements</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {consistencyAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    earned={userAchievements.find(a => a.achievement_id === achievement.id)}
                    size="md"
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </div>
            </div>

            {/* Special Achievements */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Special Achievements</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specialAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    earned={userAchievements.find(a => a.achievement_id === achievement.id)}
                    size="md"
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <WeeklyChallenges
              challenges={weeklyChallenges}
              progress={challengeProgress}
              isPremium={isPremium}
            />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Leaderboard
              entries={leaderboard}
              currentUserId={user?.id}
              isPremium={isPremium}
              onRefresh={refreshLeaderboard}
            />
          </TabsContent>

          {/* Points History Tab */}
          <TabsContent value="history">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Points History</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your recent point earnings</p>
                  </div>
                </div>
              </div>

              {pointsHistory.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No points earned yet</p>
                  <p className="text-sm mt-1">Complete habits and challenges to earn points!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
                  {pointsHistory.slice(0, 50).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{entry.reason}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">+{entry.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Premium Upsell */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Unlock Premium Rewards</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Get access to exclusive achievements, all weekly challenges, private leaderboards with friends, and bonus point multipliers.
                </p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  Upgrade to Premium
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`
                w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-4
                ${earnedAchievementIds.includes(selectedAchievement.id)
                  ? selectedAchievement.gradient
                  : 'bg-gray-200 dark:bg-gray-700 grayscale'
                }
              `}>
                {selectedAchievement.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{selectedAchievement.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedAchievement.description}</p>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Star className="w-4 h-4" />
                  <span>{selectedAchievement.points} points</span>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${earnedAchievementIds.includes(selectedAchievement.id)
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {earnedAchievementIds.includes(selectedAchievement.id) ? 'Earned' : 'Locked'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full mt-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
};

export default GamificationPage;
