import React, { useMemo } from 'react';
import { HabitCompletion, Habit } from '@/hooks/useHabits';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarHeatmapProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ habits, completions }) => {
  const { language } = useLanguage();

  const calendarData = useMemo(() => {
    const data: { date: string; rate: number; count: number }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletions = completions.filter(c => c.completed_date === dateStr);
      const rate = habits.length > 0 ? (dayCompletions.length / habits.length) : 0;
      
      data.push({
        date: dateStr,
        rate,
        count: dayCompletions.length
      });
    }
    
    return data;
  }, [habits, completions]);

  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (rate < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (rate < 0.5) return 'bg-green-300 dark:bg-green-800';
    if (rate < 0.75) return 'bg-green-400 dark:bg-green-700';
    if (rate < 1) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  const weeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
        {language === 'es' ? 'Actividad 30 Días' : '30-Day Activity'}
      </h3>
      
      <TooltipProvider delayDuration={0}>
        <div className="flex gap-0.5 sm:gap-1 justify-center sm:justify-start overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
              {week.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-4 h-4 sm:w-6 sm:h-6 rounded sm:rounded-md ${getColor(day.rate)} transition-all hover:scale-110 cursor-pointer`}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={6}
                    className="bg-gray-800 dark:bg-gray-700 text-white text-xs border-0 shadow-lg"
                  >
                    {new Date(day.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })}: {day.count}/{habits.length}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </TooltipProvider>
      
      {/* Legend */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
        <span>{language === 'es' ? 'Menos' : 'Less'}</span>
        <div className="flex gap-0.5 sm:gap-1">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-300 dark:bg-green-800" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500 dark:bg-green-600" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-600 dark:bg-green-500" />
        </div>
        <span>{language === 'es' ? 'Más' : 'More'}</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
