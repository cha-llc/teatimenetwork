import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Calendar, Flame, Clock, Target } from 'lucide-react';
import { Habit, HabitCompletion, Streak } from '@/hooks/useHabits';
import { useLanguage } from '@/contexts/LanguageContext';
import CategoryIcon from '@/components/categories/CategoryIcon';

interface HabitCalendarProps {
  habits: Habit[];
  completions: HabitCompletion[];
  streaks: Record<string, Streak>;
  onToggleCompletion: (habitId: string, date: string) => void;
  disabled?: boolean;
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

const HabitCalendar: React.FC<HabitCalendarProps> = ({
  habits,
  completions,
  streaks,
  onToggleCompletion,
  disabled = false
}) => {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean }[] = [];

    // Add days from previous month to fill the first week
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        isPast: date < new Date(today)
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday: dateStr === today,
        isPast: dateStr < today
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isPast: false
      });
    }

    return days;
  }, [currentDate, today]);

  // Get completions for a specific date
  const getCompletionsForDate = (date: string) => {
    return completions.filter(c => c.completed_date === date);
  };

  // Check if a habit is completed on a specific date
  const isHabitCompletedOnDate = (habitId: string, date: string) => {
    return completions.some(c => c.habit_id === habitId && c.completed_date === date);
  };

  // Get completion rate for a date
  const getCompletionRateForDate = (date: string) => {
    if (habits.length === 0) return 0;
    const dateCompletions = getCompletionsForDate(date);
    return Math.round((dateCompletions.length / habits.length) * 100);
  };

  // Get habits scheduled for a specific day of week
  const getHabitsForDayOfWeek = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    return habits.filter(habit => {
      if (!habit.target_days || habit.target_days.length === 0) return true;
      return habit.target_days.includes(dayOfWeek);
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(today);
  };

  // Day names
  const dayNames = language === 'es' 
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month name
  const monthName = currentDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Get color based on completion rate
  const getCompletionColor = (rate: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-gray-50 dark:bg-gray-800/50';
    if (rate === 0) return 'bg-white dark:bg-gray-900';
    if (rate < 25) return 'bg-green-50 dark:bg-green-900/20';
    if (rate < 50) return 'bg-green-100 dark:bg-green-900/30';
    if (rate < 75) return 'bg-green-200 dark:bg-green-800/40';
    if (rate < 100) return 'bg-green-300 dark:bg-green-700/50';
    return 'bg-green-400 dark:bg-green-600/60';
  };

  // Handle individual habit toggle
  const handleToggleHabit = (habitId: string, date: string) => {
    console.log('Calendar: Toggling habit', habitId, 'for date', date);
    if (!disabled && date <= today) {
      onToggleCompletion(habitId, date);
    }
  };

  // Handle complete all for a date
  const handleCompleteAll = (date: string) => {
    console.log('Calendar: Completing all habits for date', date);
    if (disabled || date > today) return;
    
    const habitsForDate = getHabitsForDayOfWeek(date);
    habitsForDate.forEach(habit => {
      if (!isHabitCompletedOnDate(habit.id, date)) {
        onToggleCompletion(habit.id, date);
      }
    });
  };

  // Handle clear all for a date
  const handleClearAll = (date: string) => {
    console.log('Calendar: Clearing all habits for date', date);
    if (disabled || date > today) return;
    
    const habitsForDate = getHabitsForDayOfWeek(date);
    habitsForDate.forEach(habit => {
      if (isHabitCompletedOnDate(habit.id, date)) {
        onToggleCompletion(habit.id, date);
      }
    });
  };

  // Selected date habits
  const selectedDateHabits = selectedDate ? getHabitsForDayOfWeek(selectedDate) : [];
  const selectedDateCompletions = selectedDate ? getCompletionsForDate(selectedDate) : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C9885] to-[#5a7a64] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {language === 'es' ? 'Calendario de Hábitos' : 'Habit Calendar'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' ? 'Rastrea tu progreso diario' : 'Track your daily progress'}
              </p>
            </div>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-[#7C9885] hover:bg-[#7C9885]/10 rounded-lg transition-colors"
          >
            {language === 'es' ? 'Hoy' : 'Today'}
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white capitalize">
            {monthName}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 sm:p-6">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const completionRate = getCompletionRateForDate(day.date);
            const isSelected = selectedDate === day.date;
            const scheduledHabits = getHabitsForDayOfWeek(day.date);
            const completedCount = getCompletionsForDate(day.date).length;

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                disabled={!day.isCurrentMonth && !day.isPast}
                className={`
                  relative aspect-square p-1 rounded-lg transition-all text-sm
                  ${getCompletionColor(completionRate, day.isCurrentMonth)}
                  ${day.isCurrentMonth ? 'hover:ring-2 hover:ring-[#7C9885]/50' : 'opacity-40'}
                  ${day.isToday ? 'ring-2 ring-[#7C9885]' : ''}
                  ${isSelected ? 'ring-2 ring-[#7C9885] bg-[#7C9885]/10' : ''}
                  ${!day.isCurrentMonth ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className={`
                  block text-center font-medium
                  ${day.isToday ? 'text-[#7C9885]' : day.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}
                `}>
                  {day.day}
                </span>
                
                {/* Completion indicator dots */}
                {day.isCurrentMonth && scheduledHabits.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {completedCount > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                    {completedCount < scheduledHabits.length && (day.isPast || day.isToday) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
            <span>{language === 'es' ? 'Sin completar' : 'None'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800/40" />
            <span>{language === 'es' ? 'Parcial' : 'Partial'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-600/60" />
            <span>{language === 'es' ? 'Completo' : 'Complete'}</span>
          </div>
        </div>
      </div>

      {/* Selected Date Detail Panel */}
      {selectedDate && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedDateCompletions.length}/{selectedDateHabits.length} {language === 'es' ? 'completados' : 'completed'}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Habits list for selected date */}
          {selectedDateHabits.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{language === 'es' ? 'No hay hábitos programados para este día' : 'No habits scheduled for this day'}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedDateHabits.map(habit => {
                const isCompleted = isHabitCompletedOnDate(habit.id, selectedDate);
                const streak = streaks[habit.id];
                const categoryColor = categoryColors[habit.category.toLowerCase()] || categoryColors.general;
                const categoryIcon = categoryIcons[habit.category.toLowerCase()] || 'folder';
                const canToggle = selectedDate <= today && !disabled;

                return (
                  <div
                    key={habit.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl transition-all
                      ${isCompleted 
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    {/* Completion toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleHabit(habit.id, selectedDate);
                      }}
                      disabled={!canToggle}
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer
                        ${isCompleted
                          ? 'bg-green-500 text-white'
                          : canToggle
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }
                      `}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    {/* Habit info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${isCompleted ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                          {habit.name}
                        </span>
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                        >
                          <CategoryIcon icon={categoryIcon} size={10} />
                        </div>
                      </div>
                      {habit.reminder_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{habit.reminder_time}</span>
                        </div>
                      )}
                    </div>

                    {/* Streak indicator */}
                    {streak && streak.current_streak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="font-medium">{streak.current_streak}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick actions */}
          {selectedDate <= today && !disabled && selectedDateHabits.length > 0 && (
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCompleteAll(selectedDate);
                }}
                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {language === 'es' ? 'Completar Todos' : 'Complete All'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleClearAll(selectedDate);
                }}
                className="py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {language === 'es' ? 'Limpiar' : 'Clear'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HabitCalendar;
