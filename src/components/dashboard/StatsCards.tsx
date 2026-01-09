import React, { useMemo, useState } from 'react';
import { Target, Flame, Trophy, TrendingUp, Clock, Share2 } from 'lucide-react';
import { Habit, HabitCompletion, Streak } from '@/hooks/useHabits';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SocialShareModal from '@/components/social/SocialShareModal';

interface StatsCardsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  streaks: Record<string, Streak>;
}

const StatsCards: React.FC<StatsCardsProps> = ({ habits, completions, streaks }) => {
  const { profile, trialStatus } = useAuth();
  const { language } = useLanguage();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState<'streak' | 'milestone'>('milestone');
  const [shareDescription, setShareDescription] = useState('');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = completions.filter(c => c.completed_date === today);
    
    // Calculate total streaks
    const totalCurrentStreak = Object.values(streaks).reduce((sum, s) => sum + (s.current_streak || 0), 0);
    const longestStreak = Math.max(...Object.values(streaks).map(s => s.longest_streak || 0), 0);
    
    // Calculate 7-day completion rate
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const weekCompletions = completions.filter(c => c.completed_date >= sevenDaysAgo);
    const weekRate = habits.length > 0 
      ? Math.round((weekCompletions.length / (habits.length * 7)) * 100) 
      : 0;
    
    // Total completions
    const totalCompletions = completions.length;
    
    return {
      todayProgress: habits.length > 0 ? Math.round((todayCompletions.length / habits.length) * 100) : 0,
      todayCompleted: todayCompletions.length,
      totalHabits: habits.length,
      totalCurrentStreak,
      longestStreak,
      weekRate,
      totalCompletions
    };
  }, [habits, completions, streaks]);

  const handleShareStreak = () => {
    setShareType('milestone');
    setShareDescription(
      language === 'es' 
        ? `¡${stats.totalCurrentStreak} días de racha activa en ${habits.length} hábitos!`
        : `${stats.totalCurrentStreak} active streak days across ${habits.length} habits!`
    );
    setShowShareModal(true);
  };

  const handleShareBestStreak = () => {
    setShareType('milestone');
    setShareDescription(
      language === 'es' 
        ? `¡Mi mejor racha es de ${stats.longestStreak} días!`
        : `My best streak is ${stats.longestStreak} days!`
    );
    setShowShareModal(true);
  };

  // Show trial countdown for non-premium users
  const showTrialCard = !profile?.is_premium;

  const baseCards = [
    {
      title: language === 'es' ? 'Progreso de Hoy' : "Today's Progress",
      value: `${stats.todayProgress}%`,
      subtitle: language === 'es' 
        ? `${stats.todayCompleted}/${stats.totalHabits} completados`
        : `${stats.todayCompleted}/${stats.totalHabits} completed`,
      icon: Target,
      color: 'from-[#7C9885] to-[#5a7a64]',
      iconBg: 'bg-[#7C9885]/20 dark:bg-[#7C9885]/30',
      iconColor: '#7C9885',
      shareable: false
    },
    {
      title: language === 'es' ? 'Rachas Activas' : 'Active Streaks',
      value: stats.totalCurrentStreak.toString(),
      subtitle: language === 'es' ? 'Días totales de racha' : 'Total streak days',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: '#F97316',
      shareable: stats.totalCurrentStreak > 0,
      onShare: handleShareStreak
    },
    {
      title: language === 'es' ? 'Mejor Racha' : 'Best Streak',
      value: language === 'es' ? `${stats.longestStreak} días` : `${stats.longestStreak} days`,
      subtitle: language === 'es' ? 'Récord personal' : 'Personal record',
      icon: Trophy,
      color: 'from-amber-500 to-yellow-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: '#F59E0B',
      shareable: stats.longestStreak > 0,
      onShare: handleShareBestStreak
    }
  ];

  // Add trial card or 7-day rate based on premium status
  const cards = showTrialCard 
    ? [
        ...baseCards,
        {
          title: trialStatus.isTrialExpired 
            ? (language === 'es' ? 'Prueba Expirada' : 'Trial Expired')
            : (language === 'es' ? 'Días de Prueba' : 'Trial Days Left'),
          value: trialStatus.isTrialExpired ? '0' : trialStatus.daysRemaining.toString(),
          subtitle: trialStatus.isTrialExpired 
            ? (language === 'es' ? 'Actualiza para continuar' : 'Upgrade to continue')
            : trialStatus.daysRemaining <= 7 
              ? (language === 'es' ? '¡Actualiza pronto!' : 'Upgrade soon!')
              : (language === 'es' ? 'de 30 días de prueba' : 'of 30-day trial'),
          icon: Clock,
          color: trialStatus.isTrialExpired 
            ? 'from-red-500 to-rose-500' 
            : trialStatus.daysRemaining <= 7 
              ? 'from-amber-500 to-orange-500'
              : 'from-blue-500 to-indigo-500',
          iconBg: trialStatus.isTrialExpired 
            ? 'bg-red-100 dark:bg-red-900/30' 
            : trialStatus.daysRemaining <= 7 
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: trialStatus.isTrialExpired 
            ? '#EF4444' 
            : trialStatus.daysRemaining <= 7 
              ? '#F59E0B'
              : '#3B82F6',
          shareable: false
        }
      ]
    : [
        ...baseCards,
        {
          title: language === 'es' ? 'Tasa 7 Días' : '7-Day Rate',
          value: `${stats.weekRate}%`,
          subtitle: language === 'es' 
            ? `${stats.totalCompletions} completados totales`
            : `${stats.totalCompletions} total completions`,
          icon: TrendingUp,
          color: 'from-blue-500 to-indigo-500',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: '#3B82F6',
          shareable: false
        }
      ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`relative group bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border transition-shadow ${
              card.title === 'Trial Expired' || card.title === 'Prueba Expirada'
                ? 'border-red-200 dark:border-red-800 hover:shadow-md hover:border-red-300 dark:hover:border-red-700' 
                : (card.title === 'Trial Days Left' || card.title === 'Días de Prueba') && trialStatus.daysRemaining <= 7
                  ? 'border-amber-200 dark:border-amber-800 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700'
                  : 'border-gray-100 dark:border-gray-800 hover:shadow-md'
            }`}
          >
            {/* Share button */}
            {card.shareable && card.onShare && (
              <button
                onClick={card.onShare}
                className="absolute top-2 right-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700"
                title={language === 'es' ? 'Compartir' : 'Share'}
              >
                <Share2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${card.iconBg}`}>
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: card.iconColor }} />
              </div>
            </div>
            <div className={`text-lg sm:text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-0.5 sm:mb-1`}>
              {card.value}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">{card.title}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{card.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType={shareType}
        achievementDescription={shareDescription}
      />
    </>
  );
};

export default StatsCards;
