import React, { useMemo } from 'react';
import { HabitCompletion, Habit } from '@/hooks/useHabits';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressChartProps {
  habits: Habit[];
  completions: HabitCompletion[];
  days?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ habits, completions, days = 30 }) => {
  const { language } = useLanguage();

  const chartData = useMemo(() => {
    const data: { date: string; label: string; rate: number; count: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletions = completions.filter(c => c.completed_date === dateStr);
      const rate = habits.length > 0 ? Math.round((dayCompletions.length / habits.length) * 100) : 0;
      
      data.push({
        date: dateStr,
        label: date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', day: 'numeric' }),
        rate,
        count: dayCompletions.length
      });
    }
    
    return data;
  }, [habits, completions, days, language]);

  const maxRate = Math.max(...chartData.map(d => d.rate), 100);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
        {language === 'es' ? 'Tasa de Completado' : 'Completion Rate'}
      </h3>
      
      <div className="relative h-36 sm:h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-5 sm:bottom-6 w-6 sm:w-8 flex flex-col justify-between text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-7 sm:ml-10 h-full flex items-end gap-0.5 sm:gap-1">
          {chartData.map((d, i) => (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center group"
            >
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    d.rate === 100 ? 'bg-[#10B981]' : d.rate > 0 ? 'bg-[#7C9885]' : 'bg-gray-200 dark:bg-gray-700'
                  } group-hover:opacity-80`}
                  style={{ height: `${(d.rate / maxRate) * 100}%`, minHeight: d.rate > 0 ? '4px' : '2px' }}
                />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 dark:bg-gray-700 text-white text-[10px] sm:text-xs px-2 py-1 rounded whitespace-nowrap">
                  {d.label}: {d.rate}% ({d.count}/{habits.length})
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="ml-7 sm:ml-10 flex justify-between text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1.5 sm:mt-2">
          <span className="truncate">{chartData[0]?.label}</span>
          <span className="truncate hidden sm:block">{chartData[Math.floor(days / 2)]?.label}</span>
          <span className="truncate">{chartData[days - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
