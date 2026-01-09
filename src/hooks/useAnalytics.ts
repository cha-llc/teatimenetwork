import { useMemo, useState, useCallback } from 'react';
import { Habit, HabitCompletion, Streak } from './useHabits';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyStats {
  date: string;
  completions: number;
  total: number;
  rate: number;
}

export interface WeeklyStats {
  week: string;
  startDate: string;
  endDate: string;
  completions: number;
  total: number;
  rate: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  completions: number;
  total: number;
  rate: number;
}

export interface CategoryStats {
  category: string;
  color: string;
  habitCount: number;
  completions: number;
  totalPossible: number;
  rate: number;
}

export interface HabitPerformance {
  habit: Habit;
  completions: number;
  totalPossible: number;
  rate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Insight {
  type: 'success' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  icon: string;
}

export interface AnalyticsData {
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
  habitPerformance: HabitPerformance[];
  insights: Insight[];
  overallStats: {
    totalCompletions: number;
    averageRate: number;
    bestDay: string;
    bestDayRate: number;
    currentOverallStreak: number;
    longestOverallStreak: number;
    mostConsistentHabit: string | null;
    leastConsistentHabit: string | null;
  };
}

const categoryColors: Record<string, string> = {
  'Health': '#10B981',
  'Fitness': '#F59E0B',
  'Learning': '#3B82F6',
  'Mindfulness': '#8B5CF6',
  'Productivity': '#EC4899',
  'General': '#7C9885',
};

export const useAnalytics = (
  habits: Habit[],
  completions: HabitCompletion[],
  streaks: Record<string, Streak>,
  days: number = 90
) => {
  const { user } = useAuth();
  const [extendedCompletions, setExtendedCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch extended completions for longer time periods
  const fetchExtendedCompletions = useCallback(async (startDate: string, endDate: string) => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate);
    
    if (!error && data) {
      setExtendedCompletions(data);
    }
    setLoading(false);
  }, [user]);

  const analytics = useMemo((): AnalyticsData => {
    const allCompletions = extendedCompletions.length > 0 ? extendedCompletions : completions;
    
    // Generate daily stats
    const dailyStats: DailyStats[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletions = allCompletions.filter(c => c.completed_date === dateStr);
      
      dailyStats.push({
        date: dateStr,
        completions: dayCompletions.length,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((dayCompletions.length / habits.length) * 100) : 0
      });
    }

    // Generate weekly stats
    const weeklyStats: WeeklyStats[] = [];
    const weeksCount = Math.ceil(days / 7);
    for (let i = weeksCount - 1; i >= 0; i--) {
      const endDate = new Date(Date.now() - i * 7 * 86400000);
      const startDate = new Date(endDate.getTime() - 6 * 86400000);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const weekCompletions = allCompletions.filter(
        c => c.completed_date >= startStr && c.completed_date <= endStr
      );
      const totalPossible = habits.length * 7;
      
      weeklyStats.push({
        week: `Week ${weeksCount - i}`,
        startDate: startStr,
        endDate: endStr,
        completions: weekCompletions.length,
        total: totalPossible,
        rate: totalPossible > 0 ? Math.round((weekCompletions.length / totalPossible) * 100) : 0
      });
    }

    // Generate monthly stats
    const monthlyStats: MonthlyStats[] = [];
    const monthsCount = Math.ceil(days / 30);
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
      const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const monthCompletions = allCompletions.filter(
        c => c.completed_date >= monthStart && c.completed_date <= monthEnd
      );
      const totalPossible = habits.length * daysInMonth;
      
      monthlyStats.push({
        month: monthName,
        year,
        completions: monthCompletions.length,
        total: totalPossible,
        rate: totalPossible > 0 ? Math.round((monthCompletions.length / totalPossible) * 100) : 0
      });
    }

    // Generate category stats
    const categoryMap = new Map<string, { habits: Habit[]; completions: number }>();
    habits.forEach(habit => {
      const cat = habit.category || 'General';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { habits: [], completions: 0 });
      }
      categoryMap.get(cat)!.habits.push(habit);
    });

    allCompletions.forEach(completion => {
      const habit = habits.find(h => h.id === completion.habit_id);
      if (habit) {
        const cat = habit.category || 'General';
        if (categoryMap.has(cat)) {
          categoryMap.get(cat)!.completions++;
        }
      }
    });

    const categoryStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, data]) => {
      const totalPossible = data.habits.length * days;
      return {
        category,
        color: categoryColors[category] || '#7C9885',
        habitCount: data.habits.length,
        completions: data.completions,
        totalPossible,
        rate: totalPossible > 0 ? Math.round((data.completions / totalPossible) * 100) : 0
      };
    });

    // Generate habit performance stats
    const habitPerformance: HabitPerformance[] = habits.map(habit => {
      const habitCompletions = allCompletions.filter(c => c.habit_id === habit.id);
      const streak = streaks[habit.id];
      const totalPossible = days;
      
      return {
        habit,
        completions: habitCompletions.length,
        totalPossible,
        rate: totalPossible > 0 ? Math.round((habitCompletions.length / totalPossible) * 100) : 0,
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0
      };
    }).sort((a, b) => b.rate - a.rate);

    // Calculate overall stats
    const totalCompletions = allCompletions.length;
    const averageRate = dailyStats.length > 0 
      ? Math.round(dailyStats.reduce((sum, d) => sum + d.rate, 0) / dailyStats.length)
      : 0;
    
    const bestDayData = dailyStats.reduce((best, day) => 
      day.rate > best.rate ? day : best, 
      { date: '', rate: 0 }
    );

    const allStreaks = Object.values(streaks);
    const currentOverallStreak = allStreaks.length > 0
      ? Math.max(...allStreaks.map(s => s.current_streak))
      : 0;
    const longestOverallStreak = allStreaks.length > 0
      ? Math.max(...allStreaks.map(s => s.longest_streak))
      : 0;

    const mostConsistentHabit = habitPerformance.length > 0 ? habitPerformance[0].habit.name : null;
    const leastConsistentHabit = habitPerformance.length > 0 
      ? habitPerformance[habitPerformance.length - 1].habit.name 
      : null;

    // Generate insights
    const insights: Insight[] = [];

    // Achievement insights
    if (averageRate >= 80) {
      insights.push({
        type: 'achievement',
        title: 'Habit Champion!',
        description: `You're maintaining an impressive ${averageRate}% completion rate. Keep up the excellent work!`,
        icon: 'trophy'
      });
    }

    if (currentOverallStreak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Week Warrior',
        description: `You've maintained a ${currentOverallStreak}-day streak! Consistency is key to lasting change.`,
        icon: 'flame'
      });
    }

    if (longestOverallStreak >= 30) {
      insights.push({
        type: 'achievement',
        title: 'Monthly Master',
        description: `Your longest streak of ${longestOverallStreak} days shows incredible dedication!`,
        icon: 'crown'
      });
    }

    // Success insights
    if (habitPerformance.length > 0 && habitPerformance[0].rate >= 70) {
      insights.push({
        type: 'success',
        title: 'Top Performer',
        description: `"${habitPerformance[0].habit.name}" is your best habit with ${habitPerformance[0].rate}% completion rate.`,
        icon: 'star'
      });
    }

    // Warning insights
    if (habitPerformance.length > 0 && habitPerformance[habitPerformance.length - 1].rate < 30) {
      insights.push({
        type: 'warning',
        title: 'Needs Attention',
        description: `"${habitPerformance[habitPerformance.length - 1].habit.name}" has only ${habitPerformance[habitPerformance.length - 1].rate}% completion. Consider adjusting its schedule.`,
        icon: 'alert-triangle'
      });
    }

    // Tip insights
    const weekendDays = dailyStats.filter(d => {
      const day = new Date(d.date).getDay();
      return day === 0 || day === 6;
    });
    const weekdayDays = dailyStats.filter(d => {
      const day = new Date(d.date).getDay();
      return day !== 0 && day !== 6;
    });
    
    const weekendAvg = weekendDays.length > 0 
      ? weekendDays.reduce((sum, d) => sum + d.rate, 0) / weekendDays.length 
      : 0;
    const weekdayAvg = weekdayDays.length > 0 
      ? weekdayDays.reduce((sum, d) => sum + d.rate, 0) / weekdayDays.length 
      : 0;

    if (weekendAvg < weekdayAvg - 20) {
      insights.push({
        type: 'tip',
        title: 'Weekend Dip',
        description: 'Your completion rate drops on weekends. Try setting specific weekend routines.',
        icon: 'lightbulb'
      });
    }

    if (weekdayAvg < weekendAvg - 20) {
      insights.push({
        type: 'tip',
        title: 'Weekday Challenge',
        description: 'Weekdays seem challenging. Consider simplifying habits for busy days.',
        icon: 'lightbulb'
      });
    }

    // Category-based insights
    if (categoryStats.length > 1) {
      const bestCategory = categoryStats.reduce((best, cat) => 
        cat.rate > best.rate ? cat : best
      );
      const worstCategory = categoryStats.reduce((worst, cat) => 
        cat.rate < worst.rate ? cat : worst
      );
      
      if (bestCategory.rate > worstCategory.rate + 20) {
        insights.push({
          type: 'tip',
          title: 'Category Imbalance',
          description: `You excel at ${bestCategory.category} (${bestCategory.rate}%) but ${worstCategory.category} (${worstCategory.rate}%) needs more focus.`,
          icon: 'bar-chart'
        });
      }
    }

    // Trend insight
    if (weeklyStats.length >= 2) {
      const lastWeek = weeklyStats[weeklyStats.length - 1];
      const prevWeek = weeklyStats[weeklyStats.length - 2];
      
      if (lastWeek.rate > prevWeek.rate + 10) {
        insights.push({
          type: 'success',
          title: 'Upward Trend',
          description: `Great progress! Your completion rate improved by ${lastWeek.rate - prevWeek.rate}% this week.`,
          icon: 'trending-up'
        });
      } else if (lastWeek.rate < prevWeek.rate - 10) {
        insights.push({
          type: 'warning',
          title: 'Downward Trend',
          description: `Your completion rate dropped by ${prevWeek.rate - lastWeek.rate}% this week. Time to refocus!`,
          icon: 'trending-down'
        });
      }
    }

    return {
      dailyStats,
      weeklyStats,
      monthlyStats,
      categoryStats,
      habitPerformance,
      insights,
      overallStats: {
        totalCompletions,
        averageRate,
        bestDay: bestDayData.date,
        bestDayRate: bestDayData.rate,
        currentOverallStreak,
        longestOverallStreak,
        mostConsistentHabit,
        leastConsistentHabit
      }
    };
  }, [habits, completions, extendedCompletions, streaks, days]);

  // Export functions
  const exportToCSV = useCallback(() => {
    const rows = [
      ['Date', 'Completions', 'Total Habits', 'Completion Rate'],
      ...analytics.dailyStats.map(d => [d.date, d.completions, d.total, `${d.rate}%`])
    ];
    
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analytics]);

  const exportToJSON = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      period: `Last ${days} days`,
      overallStats: analytics.overallStats,
      dailyStats: analytics.dailyStats,
      weeklyStats: analytics.weeklyStats,
      monthlyStats: analytics.monthlyStats,
      categoryStats: analytics.categoryStats,
      habitPerformance: analytics.habitPerformance.map(hp => ({
        name: hp.habit.name,
        category: hp.habit.category,
        completions: hp.completions,
        rate: hp.rate,
        currentStreak: hp.currentStreak,
        longestStreak: hp.longestStreak
      })),
      insights: analytics.insights
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analytics, days]);

  const generatePDFReport = useCallback(() => {
    // Create a printable HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Habit Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #7C9885; border-bottom: 2px solid #7C9885; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .stat-box { background: #f3f4f6; padding: 20px; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #7C9885; }
          .stat-label { color: #6b7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; }
          .insight { padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid; }
          .insight.success { background: #ecfdf5; border-color: #10b981; }
          .insight.warning { background: #fef3c7; border-color: #f59e0b; }
          .insight.tip { background: #eff6ff; border-color: #3b82f6; }
          .insight.achievement { background: #fef3c7; border-color: #f59e0b; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Habit Analytics Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Period: Last ${days} days</p>
        
        <h2>Overall Statistics</h2>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-value">${analytics.overallStats.totalCompletions}</div>
            <div class="stat-label">Total Completions</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${analytics.overallStats.averageRate}%</div>
            <div class="stat-label">Average Completion Rate</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${analytics.overallStats.currentOverallStreak}</div>
            <div class="stat-label">Current Best Streak</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${analytics.overallStats.longestOverallStreak}</div>
            <div class="stat-label">Longest Streak Ever</div>
          </div>
        </div>
        
        <h2>Habit Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Habit</th>
              <th>Category</th>
              <th>Completion Rate</th>
              <th>Current Streak</th>
            </tr>
          </thead>
          <tbody>
            ${analytics.habitPerformance.map(hp => `
              <tr>
                <td>${hp.habit.name}</td>
                <td>${hp.habit.category}</td>
                <td>${hp.rate}%</td>
                <td>${hp.currentStreak} days</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Habits</th>
              <th>Completions</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            ${analytics.categoryStats.map(cs => `
              <tr>
                <td>${cs.category}</td>
                <td>${cs.habitCount}</td>
                <td>${cs.completions}</td>
                <td>${cs.rate}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Insights & Recommendations</h2>
        ${analytics.insights.map(insight => `
          <div class="insight ${insight.type}">
            <strong>${insight.title}</strong>
            <p>${insight.description}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }, [analytics, days]);

  return {
    analytics,
    loading,
    fetchExtendedCompletions,
    exportToCSV,
    exportToJSON,
    generatePDFReport
  };
};
