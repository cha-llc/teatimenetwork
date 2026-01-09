import { useDebugValue } from 'react';
import { useHabitsStore } from '@/stores/habitsStore';

/**
 * Custom hook that wraps the habits store and provides debug information
 * in React DevTools using useDebugValue.
 * 
 * When you inspect this hook in React DevTools, you'll see:
 * - Total habits count
 * - Completed today count
 * - Loading state
 * - Error state (if any)
 * - Currently completing habit ID
 */
export const useHabitsDebug = () => {
  const store = useHabitsStore();
  
  const {
    habits,
    completions,
    streaks,
    loading,
    error,
    completingHabitId,
    addHabit,
    editHabit,
    deleteHabit,
  } = store;

  // Get today's date for completion check
  const today = new Date().toISOString().split('T')[0];
  const completedToday = completions.filter(c => c.completed_date === today);
  
  // Calculate total streak across all habits
  const totalCurrentStreak = Object.values(streaks).reduce(
    (sum, streak) => sum + (streak?.current_streak || 0),
    0
  );
  
  const longestStreakHabit = Object.entries(streaks).reduce(
    (best, [habitId, streak]) => {
      if (!best || (streak?.longest_streak || 0) > (best.streak?.longest_streak || 0)) {
        return { habitId, streak };
      }
      return best;
    },
    null as { habitId: string; streak: typeof streaks[string] } | null
  );

  // Format debug value for React DevTools
  const debugValue = {
    habitsCount: habits.length,
    completedToday: completedToday.length,
    completionRate: habits.length > 0 
      ? `${Math.round((completedToday.length / habits.length) * 100)}%` 
      : '0%',
    totalCurrentStreak,
    longestStreak: longestStreakHabit?.streak?.longest_streak || 0,
    loading,
    error: error || 'none',
    isCompleting: completingHabitId || 'none',
  };

  // This will show in React DevTools when inspecting this hook
  useDebugValue(debugValue, (value) => 
    `Habits: ${value.habitsCount} | Completed: ${value.completedToday} (${value.completionRate}) | Loading: ${value.loading}`
  );

  return {
    ...store,
    addHabit,
    editHabit,
    deleteHabit,
    // Additional computed debug values
    debug: {
      completedTodayCount: completedToday.length,
      completionRate: habits.length > 0 
        ? (completedToday.length / habits.length) * 100 
        : 0,
      totalCurrentStreak,
      longestStreakHabit: longestStreakHabit 
        ? habits.find(h => h.id === longestStreakHabit.habitId)?.name 
        : null,
      longestStreakValue: longestStreakHabit?.streak?.longest_streak || 0,
    },
  };
};

export default useHabitsDebug;
