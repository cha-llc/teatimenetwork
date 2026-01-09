import React, { useMemo, useState } from 'react';
import { Flame, Trophy, Star, Crown, Zap, Award, Gift, Lock, Sparkles, ChevronRight, X } from 'lucide-react';
import { Habit, Streak } from '@/hooks/useHabits';
import { useLanguage } from '@/contexts/LanguageContext';

interface StreakRewardsProps {
  habits: Habit[];
  streaks: Record<string, Streak>;
}

interface StreakMilestone {
  days: number;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  reward: string;
  rewardEs: string;
}

const milestones: StreakMilestone[] = [
  {
    days: 3,
    title: 'Getting Started',
    titleEs: 'Comenzando',
    description: 'Complete 3 days in a row',
    descriptionEs: 'Completa 3 días seguidos',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    reward: 'Momentum Builder Badge',
    rewardEs: 'Insignia Constructor de Impulso'
  },
  {
    days: 7,
    title: 'One Week Warrior',
    titleEs: 'Guerrero de Una Semana',
    description: 'Complete 7 days in a row',
    descriptionEs: 'Completa 7 días seguidos',
    icon: Star,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    reward: 'Weekly Champion Badge',
    rewardEs: 'Insignia Campeón Semanal'
  },
  {
    days: 14,
    title: 'Two Week Titan',
    titleEs: 'Titán de Dos Semanas',
    description: 'Complete 14 days in a row',
    descriptionEs: 'Completa 14 días seguidos',
    icon: Award,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    reward: 'Dedication Badge',
    rewardEs: 'Insignia de Dedicación'
  },
  {
    days: 21,
    title: 'Habit Former',
    titleEs: 'Formador de Hábitos',
    description: 'Complete 21 days - habits are forming!',
    descriptionEs: 'Completa 21 días - ¡los hábitos se están formando!',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    reward: 'Habit Master Badge',
    rewardEs: 'Insignia Maestro de Hábitos'
  },
  {
    days: 30,
    title: 'Monthly Master',
    titleEs: 'Maestro Mensual',
    description: 'Complete 30 days in a row',
    descriptionEs: 'Completa 30 días seguidos',
    icon: Trophy,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    reward: 'Gold Streak Badge + Custom Theme',
    rewardEs: 'Insignia Racha Dorada + Tema Personalizado'
  },
  {
    days: 60,
    title: 'Consistency King',
    titleEs: 'Rey de la Consistencia',
    description: 'Complete 60 days in a row',
    descriptionEs: 'Completa 60 días seguidos',
    icon: Crown,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    reward: 'Platinum Badge + Profile Frame',
    rewardEs: 'Insignia Platino + Marco de Perfil'
  },
  {
    days: 100,
    title: 'Century Legend',
    titleEs: 'Leyenda del Siglo',
    description: 'Complete 100 days in a row',
    descriptionEs: 'Completa 100 días seguidos',
    icon: Sparkles,
    color: 'text-indigo-500',
    bgColor: 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    reward: 'Diamond Badge + Exclusive Features',
    rewardEs: 'Insignia Diamante + Funciones Exclusivas'
  },
  {
    days: 365,
    title: 'Year of Excellence',
    titleEs: 'Año de Excelencia',
    description: 'Complete 365 days in a row',
    descriptionEs: 'Completa 365 días seguidos',
    icon: Gift,
    color: 'text-yellow-500',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    reward: 'Legendary Status + Lifetime Achievement',
    rewardEs: 'Estado Legendario + Logro de por Vida'
  }
];

const StreakRewards: React.FC<StreakRewardsProps> = ({ habits, streaks }) => {
  const { language } = useLanguage();
  const [selectedMilestone, setSelectedMilestone] = useState<StreakMilestone | null>(null);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  // Calculate best current streak and longest streak across all habits
  const streakStats = useMemo(() => {
    const streakValues = Object.values(streaks);
    const bestCurrentStreak = Math.max(...streakValues.map(s => s.current_streak || 0), 0);
    const longestStreak = Math.max(...streakValues.map(s => s.longest_streak || 0), 0);
    const totalActiveStreaks = streakValues.filter(s => s.current_streak > 0).length;
    const totalStreakDays = streakValues.reduce((sum, s) => sum + (s.current_streak || 0), 0);

    // Find which habit has the best streak
    let bestHabitId: string | null = null;
    let bestHabitStreak = 0;
    Object.entries(streaks).forEach(([habitId, streak]) => {
      if (streak.current_streak > bestHabitStreak) {
        bestHabitStreak = streak.current_streak;
        bestHabitId = habitId;
      }
    });

    const bestHabit = bestHabitId ? habits.find(h => h.id === bestHabitId) : null;

    return {
      bestCurrentStreak,
      longestStreak,
      totalActiveStreaks,
      totalStreakDays,
      bestHabit,
      bestHabitStreak
    };
  }, [habits, streaks]);

  // Get earned milestones
  const earnedMilestones = useMemo(() => {
    return milestones.filter(m => streakStats.longestStreak >= m.days);
  }, [streakStats.longestStreak]);

  // Get next milestone
  const nextMilestone = useMemo(() => {
    return milestones.find(m => streakStats.bestCurrentStreak < m.days);
  }, [streakStats.bestCurrentStreak]);

  // Progress to next milestone
  const progressToNext = nextMilestone 
    ? Math.round((streakStats.bestCurrentStreak / nextMilestone.days) * 100)
    : 100;

  // Days until next milestone
  const daysUntilNext = nextMilestone 
    ? nextMilestone.days - streakStats.bestCurrentStreak
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {language === 'es' ? 'Recompensas de Racha' : 'Streak Rewards'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Gana insignias por tu consistencia' : 'Earn badges for your consistency'}
            </p>
          </div>
        </div>

        {/* Current streak stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {streakStats.bestCurrentStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Mejor Racha' : 'Best Streak'}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {streakStats.longestStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Récord' : 'Record'}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {streakStats.totalActiveStreaks}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Activas' : 'Active'}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {earnedMilestones.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Insignias' : 'Badges'}
            </div>
          </div>
        </div>
      </div>

      {/* Next milestone progress */}
      {nextMilestone && (
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <nextMilestone.icon className={`w-5 h-5 ${nextMilestone.color}`} />
              <span className="font-medium text-gray-800 dark:text-white">
                {language === 'es' ? nextMilestone.titleEs : nextMilestone.title}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {daysUntilNext} {language === 'es' ? 'días restantes' : 'days to go'}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-medium text-white drop-shadow">
                {streakStats.bestCurrentStreak}/{nextMilestone.days}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {language === 'es' ? nextMilestone.descriptionEs : nextMilestone.description}
          </p>
        </div>
      )}

      {/* Earned badges */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 dark:text-white">
            {language === 'es' ? 'Tus Insignias' : 'Your Badges'}
          </h3>
          <button
            onClick={() => setShowAllMilestones(true)}
            className="text-sm text-[#7C9885] hover:underline flex items-center gap-1"
          >
            {language === 'es' ? 'Ver todas' : 'View all'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {earnedMilestones.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'es' 
                ? 'Completa rachas para ganar insignias' 
                : 'Complete streaks to earn badges'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {earnedMilestones.map((milestone, index) => (
              <button
                key={index}
                onClick={() => setSelectedMilestone(milestone)}
                className={`
                  aspect-square rounded-xl ${milestone.bgColor} ${milestone.borderColor} border-2
                  flex items-center justify-center transition-transform hover:scale-105
                `}
              >
                <milestone.icon className={`w-6 h-6 ${milestone.color}`} />
              </button>
            ))}
          </div>
        )}

        {/* Best habit highlight */}
        {streakStats.bestHabit && streakStats.bestHabitStreak > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {streakStats.bestHabit.name}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {streakStats.bestHabitStreak} {language === 'es' ? 'días de racha' : 'day streak'} 🔥
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All milestones modal */}
      {showAllMilestones && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {language === 'es' ? 'Todas las Insignias' : 'All Badges'}
              </h3>
              <button
                onClick={() => setShowAllMilestones(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {milestones.map((milestone, index) => {
                  const isEarned = streakStats.longestStreak >= milestone.days;
                  return (
                    <div
                      key={index}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${isEarned 
                          ? `${milestone.bgColor} ${milestone.borderColor}` 
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isEarned ? milestone.bgColor : 'bg-gray-200 dark:bg-gray-700'}
                        `}>
                          {isEarned ? (
                            <milestone.icon className={`w-6 h-6 ${milestone.color}`} />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {language === 'es' ? milestone.titleEs : milestone.title}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              {milestone.days} {language === 'es' ? 'días' : 'days'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {language === 'es' ? milestone.descriptionEs : milestone.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs">
                            <Gift className="w-3 h-3 text-amber-500" />
                            <span className="text-amber-600 dark:text-amber-400">
                              {language === 'es' ? milestone.rewardEs : milestone.reward}
                            </span>
                          </div>
                        </div>
                        {isEarned && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected milestone detail modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full overflow-hidden border-2 ${selectedMilestone.borderColor}`}>
            <div className={`p-6 ${selectedMilestone.bgColor} text-center`}>
              <div className="w-20 h-20 rounded-2xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <selectedMilestone.icon className={`w-10 h-10 ${selectedMilestone.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {language === 'es' ? selectedMilestone.titleEs : selectedMilestone.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedMilestone.days} {language === 'es' ? 'días de racha' : 'day streak'}
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {language === 'es' ? selectedMilestone.descriptionEs : selectedMilestone.description}
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">{language === 'es' ? 'Recompensa' : 'Reward'}</span>
                </div>
                <p className="text-amber-700 dark:text-amber-300 font-medium">
                  {language === 'es' ? selectedMilestone.rewardEs : selectedMilestone.reward}
                </p>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="w-full mt-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakRewards;
