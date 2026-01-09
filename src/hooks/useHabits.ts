import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  frequency: string;
  target_days: number[];
  reminder_time: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  notes: string | null;
}

export interface Streak {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
}

// Demo habits for when user is not authenticated
const demoHabits: Habit[] = [
  {
    id: 'demo-1',
    user_id: 'demo',
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness',
    category: 'mindfulness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    reminder_time: '07:00',
    color: '#8B5CF6',
    icon: 'brain',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    user_id: 'demo',
    name: 'Exercise',
    description: '30 minutes workout',
    category: 'fitness',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    reminder_time: '08:00',
    color: '#F59E0B',
    icon: 'dumbbell',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-3',
    user_id: 'demo',
    name: 'Read 20 Pages',
    description: 'Daily reading habit',
    category: 'learning',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    reminder_time: '21:00',
    color: '#3B82F6',
    icon: 'book',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-4',
    user_id: 'demo',
    name: 'Drink 8 Glasses of Water',
    description: 'Stay hydrated',
    category: 'health',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    reminder_time: null,
    color: '#10B981',
    icon: 'heart',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const useHabits = () => {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchHabits = useCallback(async () => {
    if (!user) {
      // Use demo habits when not authenticated
      setHabits(demoHabits);
      setIsDemo(true);
      return;
    }
    
    setIsDemo(false);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setHabits(data);
    }
  }, [user]);

  const fetchCompletions = useCallback(async (startDate: string, endDate: string) => {
    if (!user) {
      // For demo mode, start with empty completions
      return;
    }
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate);
    
    if (!error && data) {
      setCompletions(data);
    }
  }, [user]);

  const fetchStreaks = useCallback(async () => {
    if (!user) {
      // Initialize demo streaks
      const demoStreaks: Record<string, Streak> = {};
      demoHabits.forEach(habit => {
        demoStreaks[habit.id] = {
          habit_id: habit.id,
          current_streak: Math.floor(Math.random() * 10),
          longest_streak: Math.floor(Math.random() * 30) + 5,
          last_completed_date: null
        };
      });
      setStreaks(demoStreaks);
      return;
    }
    
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      const streakMap: Record<string, Streak> = {};
      data.forEach(s => {
        streakMap[s.habit_id] = s;
      });
      setStreaks(streakMap);
    }
  }, [user]);

  const createHabit = async (habit: Partial<Habit>) => {
    if (!user) {
      // Demo mode: create a local habit
      const newHabit: Habit = {
        id: `demo-${Date.now()}`,
        user_id: 'demo',
        name: habit.name || 'New Habit',
        description: habit.description || null,
        category: habit.category || 'general',
        frequency: habit.frequency || 'daily',
        target_days: habit.target_days || [0, 1, 2, 3, 4, 5, 6],
        reminder_time: habit.reminder_time || null,
        color: habit.color || '#7C9885',
        icon: habit.icon || 'star',
        is_active: true,
        created_at: new Date().toISOString()
      };
      setHabits(prev => [...prev, newHabit]);
      setStreaks(prev => ({
        ...prev,
        [newHabit.id]: {
          habit_id: newHabit.id,
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null
        }
      }));
      return newHabit;
    }
    
    // During trial or with premium, unlimited habits
    // After trial expires (no premium), limit to 3 habits in view-only mode
    const tier = profile?.subscription_tier;
    const isPremium = profile?.is_premium;
    
    // Premium users: unlimited habits based on tier
    // Trial users: unlimited during trial
    // Expired trial: no new habits (handled by view-only mode in Dashboard)
    if (isPremium) {
      const habitLimit = tier === 'starter' ? 10 : Infinity;
      if (habits.length >= habitLimit && tier === 'starter') {
        throw new Error('Starter plan allows up to 10 habits. Upgrade to Pro for unlimited habits!');
      }
    }


    
    const { data, error } = await supabase
      .from('habits')
      .insert({
        ...habit,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      setHabits(prev => [...prev, data]);
      
      // Create initial streak record
      await supabase
        .from('streaks')
        .insert({
          habit_id: data.id,
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0
        });
    }
    
    return data;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) {
      // Demo mode: update local habit
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      return;
    }
    
    const { error } = await supabase
      .from('habits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) {
      // Demo mode: delete local habit
      setHabits(prev => prev.filter(h => h.id !== id));
      setCompletions(prev => prev.filter(c => c.habit_id !== id));
      return;
    }
    
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id);
    
    if (!error) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const toggleCompletion = async (habitId: string, date: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Don't allow completing future dates
    if (date > today) {
      console.log('Cannot complete future dates');
      return;
    }
    
    const existing = completions.find(
      c => c.habit_id === habitId && c.completed_date === date
    );
    
    if (!user) {
      // Demo mode: toggle completion locally
      if (existing) {
        // Remove completion
        setCompletions(prev => prev.filter(c => c.id !== existing.id));
        
        // Update streak
        setStreaks(prev => ({
          ...prev,
          [habitId]: {
            ...prev[habitId],
            current_streak: Math.max(0, (prev[habitId]?.current_streak || 1) - 1)
          }
        }));
      } else {
        // Add completion
        const newCompletion: HabitCompletion = {
          id: `demo-completion-${Date.now()}-${Math.random()}`,
          habit_id: habitId,
          user_id: 'demo',
          completed_date: date,
          notes: null
        };
        setCompletions(prev => [...prev, newCompletion]);
        
        // Update streak
        setStreaks(prev => ({
          ...prev,
          [habitId]: {
            ...prev[habitId],
            habit_id: habitId,
            current_streak: (prev[habitId]?.current_streak || 0) + 1,
            longest_streak: Math.max(
              prev[habitId]?.longest_streak || 0,
              (prev[habitId]?.current_streak || 0) + 1
            ),
            last_completed_date: date
          }
        }));
      }
      return;
    }
    
    if (existing) {
      // Remove completion
      await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);
      
      setCompletions(prev => prev.filter(c => c.id !== existing.id));
      
      // Update streak
      await updateStreak(habitId, date, false);
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: date
        })
        .select()
        .single();
      
      if (!error && data) {
        setCompletions(prev => [...prev, data]);
        
        // Update streak
        await updateStreak(habitId, date, true);
      }
    }
  };

  const updateStreak = async (habitId: string, date: string, completed: boolean) => {
    if (!user) return;
    
    // Recalculate streak from completions
    const { data: allCompletions } = await supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('habit_id', habitId)
      .order('completed_date', { ascending: false });
    
    if (!allCompletions) return;
    
    const dates = allCompletions.map(c => c.completed_date).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate current streak (consecutive days ending today or yesterday)
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Check if today is completed, if not start from yesterday
    if (!dates.includes(today)) {
      checkDate = new Date(Date.now() - 86400000);
    }
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    
    // Calculate longest streak ever
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...dates].sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Get existing longest streak to not decrease it
    const existingStreak = streaks[habitId];
    const finalLongestStreak = Math.max(longestStreak, existingStreak?.longest_streak || 0);
    
    const lastCompletedDate = dates.length > 0 ? dates[0] : null;
    
    const { error } = await supabase
      .from('streaks')
      .upsert({
        habit_id: habitId,
        user_id: user.id,
        current_streak: currentStreak,
        longest_streak: finalLongestStreak,
        last_completed_date: lastCompletedDate,
        updated_at: new Date().toISOString()
      });
    
    if (!error) {
      setStreaks(prev => ({
        ...prev,
        [habitId]: {
          habit_id: habitId,
          current_streak: currentStreak,
          longest_streak: finalLongestStreak,
          last_completed_date: lastCompletedDate
        }
      }));
    }
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(c => c.habit_id === habitId && c.completed_date === today);
  };

  const isCompletedOnDate = (habitId: string, date: string) => {
    return completions.some(c => c.habit_id === habitId && c.completed_date === date);
  };

  const getCompletionRate = (habitId: string, days: number = 30) => {
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const habitCompletions = completions.filter(
      c => c.habit_id === habitId && c.completed_date >= startDate
    );
    return Math.round((habitCompletions.length / days) * 100);
  };

  const getCompletionsForDateRange = (startDate: string, endDate: string) => {
    return completions.filter(
      c => c.completed_date >= startDate && c.completed_date <= endDate
    );
  };

  // Refresh completions for a wider date range (for calendar view)
  const refreshCompletionsForMonth = async (year: number, month: number) => {
    if (!user) return;
    
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate);
    
    if (!error && data) {
      // Merge with existing completions, avoiding duplicates
      setCompletions(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newCompletions = data.filter(c => !existingIds.has(c.id));
        return [...prev, ...newCompletions];
      });
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Fetch 90 days of history for better calendar support
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    
    Promise.all([
      fetchHabits(),
      fetchCompletions(ninetyDaysAgo, today),
      fetchStreaks()
    ]).then(() => setLoading(false));
  }, [user, fetchHabits, fetchCompletions, fetchStreaks]);

  return {
    habits,
    completions,
    streaks,
    loading,
    isDemo,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompletedToday,
    isCompletedOnDate,
    getCompletionRate,
    getCompletionsForDateRange,
    refreshCompletionsForMonth,
    refreshHabits: fetchHabits,
    refreshStreaks: fetchStreaks
  };
};
