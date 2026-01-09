import React, { useState } from 'react';
import { Check, Flame, MoreVertical, Trash2, Edit2, Lock, Bell, BellOff, Clock, AlarmClock, Brain, Sparkles, Share2 } from 'lucide-react';
import { Habit, Streak } from '@/hooks/useHabits';
import CategoryIcon from '@/components/categories/CategoryIcon';
import ReminderSettingsModal from '@/components/notifications/ReminderSettingsModal';
import SocialShareModal from '@/components/social/SocialShareModal';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useAICoach, HabitAnalysis } from '@/hooks/useAICoach';
import { useLanguage } from '@/contexts/LanguageContext';

interface HabitCardProps {
  habit: Habit;
  streak: Streak | undefined;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  completionRate?: number;
}


const categoryColors: Record<string, string> = {
  health: '#10B981',
  fitness: '#F59E0B',
  learning: '#3B82F6',
  mindfulness: '#8B5CF6',
  productivity: '#EC4899',
  general: '#7C9885'
};

const categoryIcons: Record<string, string> = {
  health: 'heart',
  fitness: 'dumbbell',
  learning: 'book',
  mindfulness: 'brain',
  productivity: 'target',
  general: 'star'
};

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  disabled = false
}) => {
  const { language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const { getHabitReminder, snoozeReminder, isEnabled: notificationsEnabled } = useNotifications();
  const { profile } = useAuth();
  const { habitAnalysis, analysisLoading, analyzeHabit, isPremium } = useAICoach();
  
  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const reminder = getHabitReminder(habit.id);
  const analysis = habitAnalysis[habit.id];

  const getStreakBadge = () => {
    if (currentStreak >= 100) return { text: language === 'es' ? '¡100+ días!' : '100+ days!', color: 'bg-purple-500' };
    if (currentStreak >= 30) return { text: language === 'es' ? '¡30+ días!' : '30+ days!', color: 'bg-amber-500' };
    if (currentStreak >= 7) return { text: language === 'es' ? '¡7+ días!' : '7+ days!', color: 'bg-green-500' };
    return null;
  };

  const badge = getStreakBadge();
  const categoryColor = categoryColors[habit.category.toLowerCase()] || habit.color || categoryColors.general;
  const categoryIcon = categoryIcons[habit.category.toLowerCase()] || 'folder';

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    snoozeReminder(habit.id, 15);
    setShowMenu(false);
  };

  const handleAIAnalysis = () => {
    setShowMenu(false);
    if (!analysis) {
      analyzeHabit(habit.id);
    }
    setShowAIAnalysis(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-[#7C9885]';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  // Handle toggle click with proper event handling
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      console.log('Toggling habit:', habit.id, habit.name);
      onToggle();
    }
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
          isCompleted 
            ? 'border-[#10B981] bg-green-50/50 dark:bg-green-900/20' 
            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
        } ${disabled ? 'opacity-75' : ''}`}
      >
        {/* Disabled overlay indicator */}
        {disabled && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
            <div className="bg-gray-500 text-white p-1 sm:p-1.5 rounded-lg">
              <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          </div>
        )}

        {/* Category indicator */}
        <div
          className="absolute top-0 left-4 sm:left-6 w-8 sm:w-12 h-1 rounded-b-full"
          style={{ backgroundColor: categoryColor }}
        />

        {/* Reminder indicator */}
        {reminder?.enabled && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <div 
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-[10px] sm:text-xs text-purple-600 dark:text-purple-400"
              title={`${language === 'es' ? 'Recordatorio a las' : 'Reminder at'} ${formatTime(reminder.reminderTime)}`}
            >
              <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{formatTime(reminder.reminderTime)}</span>
            </div>
          </div>
        )}

        {/* Menu button */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setShowMenu(!showMenu);
            }}
            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${disabled ? 'cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            disabled={disabled}
          >
            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </button>
          
          {showMenu && !disabled && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-6 sm:top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 min-w-[160px] sm:min-w-[180px]">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {language === 'es' ? 'Editar' : 'Edit'}
                </button>
                <button
                  onClick={() => { setShowReminderModal(true); setShowMenu(false); }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {language === 'es' ? 'Recordatorio' : 'Set Reminder'}
                </button>
                {isPremium && (
                  <button
                    onClick={handleAIAnalysis}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                  >
                    <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {language === 'es' ? 'Análisis IA' : 'AI Analysis'}
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-auto" />
                  </button>
                )}
                {reminder?.enabled && notificationsEnabled && (
                  <button
                    onClick={handleSnooze}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                  >
                    <AlarmClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {language === 'es' ? 'Posponer 15 min' : 'Snooze 15 min'}
                  </button>
                )}
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {language === 'es' ? 'Eliminar' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          {/* Completion button */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={disabled}
            className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isCompleted
                ? 'bg-[#10B981] text-white shadow-lg shadow-green-200 dark:shadow-green-900/50'
                : disabled
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Check className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isCompleted ? 'scale-110' : ''}`} />
          </button>

          {/* Habit info */}
          <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <h3 className={`font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {habit.name}
              </h3>
              <div
                className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0"
                style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
              >
                <CategoryIcon icon={categoryIcon} size={10} className="sm:hidden" />
                <CategoryIcon icon={categoryIcon} size={12} className="hidden sm:block" />
                <span className="capitalize hidden sm:inline">{habit.category}</span>
              </div>
            </div>
            {habit.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 truncate">{habit.description}</p>
            )}
            
            {/* Streak info */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
                <span className={currentStreak > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                  {currentStreak} {language === 'es' ? (currentStreak !== 1 ? 'días' : 'día') : (currentStreak !== 1 ? 'days' : 'day')}
                </span>
              </div>
              
              {longestStreak > 0 && (
                <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  {language === 'es' ? 'Mejor' : 'Best'}: {longestStreak} {language === 'es' ? 'días' : 'days'}
                </div>
              )}
              
              {badge && (
                <span className={`${badge.color} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium`}>
                  {badge.text}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings Modal */}
      <ReminderSettingsModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        habit={habit}
        streak={streak}
      />

      {/* AI Analysis Modal */}
      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {language === 'es' ? 'Análisis IA' : 'AI Analysis'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{habit.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIAnalysis(false)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Loading state */}
              {analysisLoading && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-purple-200 dark:border-purple-900 border-t-purple-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {language === 'es' ? 'Analizando tu hábito...' : 'Analyzing your habit...'}
                  </p>
                </div>
              )}

              {/* Analysis content */}
              {analysis && !analysisLoading && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Health Score */}
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(analysis.healthScore / 100) * 251} 251`}
                          className={getScoreColor(analysis.healthScore)}
                        />
                      </svg>
                      <span className={`absolute text-xl sm:text-2xl font-bold ${getScoreColor(analysis.healthScore)}`}>
                        {analysis.healthScore}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {language === 'es' ? 'Puntuación de Salud' : 'Health Score'}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 sm:p-4">
                    <p className="text-purple-800 dark:text-purple-300 text-sm sm:text-base">{analysis.summary}</p>
                  </div>

                  {/* Strengths & Challenges */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'es' ? 'Fortalezas' : 'Strengths'}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-start gap-1 sm:gap-2">
                            <span className="text-green-500 mt-0.5 sm:mt-1">+</span>
                            <span className="break-words">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'es' ? 'Desafíos' : 'Challenges'}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.challenges.map((c, i) => (
                          <li key={i} className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-start gap-1 sm:gap-2">
                            <span className="text-amber-500 mt-0.5 sm:mt-1">!</span>
                            <span className="break-words">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Best/Worst Days */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {language === 'es' ? 'Mejores Días' : 'Best Days'}
                      </p>
                      <p className="font-medium text-green-700 dark:text-green-400">{analysis.bestDays.join(', ')}</p>
                    </div>
                    <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {language === 'es' ? 'Necesita Trabajo' : 'Needs Work'}
                      </p>
                      <p className="font-medium text-red-700 dark:text-red-400">{analysis.worstDays.join(', ')}</p>
                    </div>
                  </div>

                  {/* Optimal Time */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
                        {language === 'es' ? 'Tiempo Óptimo' : 'Optimal Time'}
                      </span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-400 text-sm sm:text-base">{analysis.optimalTime}</p>
                  </div>

                  {/* Improvement Plan */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      {language === 'es' ? 'Plan de Mejora' : 'Improvement Plan'}
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {language === 'es' ? 'Hoy' : 'Today'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{analysis.improvementPlan.immediate}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {language === 'es' ? 'Esta Semana' : 'This Week'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{analysis.improvementPlan.thisWeek}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {language === 'es' ? 'Este Mes' : 'This Month'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{analysis.improvementPlan.thisMonth}</p>
                      </div>
                    </div>
                  </div>

                  {/* Habit Stack Suggestion */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">
                        {language === 'es' ? 'Sugerencia de Apilamiento' : 'Habit Stack Suggestion'}
                      </span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-400 text-sm sm:text-base">{analysis.habitStackSuggestion}</p>
                  </div>

                  {/* Motivational Note */}
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-3 sm:p-4 text-white">
                    <p className="italic text-sm sm:text-base">"{analysis.motivationalNote}"</p>
                  </div>
                </div>
              )}

              {/* No analysis yet */}
              {!analysis && !analysisLoading && (
                <div className="text-center py-6 sm:py-8">
                  <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                    {language === 'es' ? 'No hay análisis disponible aún.' : 'No analysis available yet.'}
                  </p>
                  <button
                    onClick={() => analyzeHabit(habit.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    <Sparkles className="w-4 h-4" />
                    {language === 'es' ? 'Generar Análisis' : 'Generate Analysis'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitCard;
