import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

// Demo habits for testing and unauthenticated users
const demoHabits: Habit[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Meditate',
    description: '10 minutes of mindfulness',
    category: 'mindfulness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    reminder_time: '07:00',
    color: '#8B5CF6',
    icon: 'brain',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
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
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    name: 'Read',
    description: '20 pages daily',
    category: 'learning',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    reminder_time: '21:00',
    color: '#3B82F6',
    icon: 'book',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  streaks: Record<string, Streak>;
  loading: boolean;
  error: string | null;
  completingHabitId: string | null;
  
  // Actions
  fetchHabits: (userId?: string) => Promise<void>;
  addHabit: (habit: Partial<Habit>, userId: string) => Promise<Habit | null>;
  editHabit: (habitId: string, updates: Partial<Habit>) => Promise<boolean>;
  deleteHabit: (habitId: string) => Promise<boolean>;
  completeHabit: (habitId: string, date?: string) => Promise<void>;
  uncompleteHabit: (habitId: string, date?: string) => Promise<void>;
  isCompletedToday: (habitId: string) => boolean;
  getStreak: (habitId: string) => Streak | undefined;
  reset: () => void;
  
  // For testing
  _setHabits: (habits: Habit[]) => void;
  _setStreaks: (streaks: Record<string, Streak>) => void;
  _setCompletions: (completions: HabitCompletion[]) => void;
}


export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completions: [],
  streaks: {},
  loading: true,
  error: null,
  completingHabitId: null,

  fetchHabits: async (userId?: string) => {
    set({ loading: true, error: null });
    
    try {
      if (!userId) {
        // Demo mode
        const demoStreaks: Record<string, Streak> = {};
        demoHabits.forEach((habit) => {
          demoStreaks[habit.id] = {
            habit_id: habit.id,
            current_streak: 0,
            longest_streak: 0,
            last_completed_date: null,
          };
        });
        
        set({
          habits: demoHabits,
          streaks: demoStreaks,
          completions: [],
          loading: false,
        });
        return;
      }

      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
        .toISOString()
        .split('T')[0];

      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_date', thirtyDaysAgo)
        .lte('completed_date', today);

      if (completionsError) throw completionsError;

      const { data: streaksData, error: streaksError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId);

      if (streaksError) throw streaksError;

      const streaksMap: Record<string, Streak> = {};
      streaksData?.forEach((s) => {
        streaksMap[s.habit_id] = s;
      });

      set({
        habits: habits || [],
        completions: completions || [],
        streaks: streaksMap,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
        loading: false,
      });
    }
  },

  addHabit: async (habitData: Partial<Habit>, userId: string) => {
    const state = get();
    set({ error: null });

    try {
      // For demo mode, create a local habit
      if (!userId || userId === 'demo') {
        const newHabit: Habit = {
          id: `demo-${Date.now()}`,
          user_id: 'demo',
          name: habitData.name || 'New Habit',
          description: habitData.description || null,
          category: habitData.category || 'general',
          frequency: habitData.frequency || 'daily',
          target_days: habitData.target_days || [0, 1, 2, 3, 4, 5, 6],
          reminder_time: habitData.reminder_time || null,
          color: habitData.color || '#7C9885',
          icon: habitData.icon || 'star',
          is_active: true,
          created_at: new Date().toISOString(),
        };

        set({
          habits: [...state.habits, newHabit],
          streaks: {
            ...state.streaks,
            [newHabit.id]: {
              habit_id: newHabit.id,
              current_streak: 0,
              longest_streak: 0,
              last_completed_date: null,
            },
          },
        });

        return newHabit;
      }

      // Insert into database
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: habitData.name,
          description: habitData.description || null,
          category: habitData.category || 'general',
          frequency: habitData.frequency || 'daily',
          target_days: habitData.target_days || [0, 1, 2, 3, 4, 5, 6],
          reminder_time: habitData.reminder_time || null,
          color: habitData.color || '#7C9885',
          icon: habitData.icon || 'star',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set({
        habits: [...state.habits, data],
        streaks: {
          ...state.streaks,
          [data.id]: {
            habit_id: data.id,
            current_streak: 0,
            longest_streak: 0,
            last_completed_date: null,
          },
        },
      });

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add habit',
      });
      return null;
    }
  },

  editHabit: async (habitId: string, updates: Partial<Habit>) => {
    const state = get();
    const habitIndex = state.habits.findIndex((h) => h.id === habitId);
    
    if (habitIndex === -1) {
      set({ error: 'Habit not found' });
      return false;
    }

    const previousHabits = [...state.habits];
    const updatedHabit = { ...state.habits[habitIndex], ...updates };

    // Optimistic update
    set({
      habits: state.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
      error: null,
    });

    try {
      // For demo mode, just keep the local update
      if (state.habits[habitIndex].user_id === 'demo') {
        return true;
      }

      // Update in database
      const { error } = await supabase
        .from('habits')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          frequency: updates.frequency,
          target_days: updates.target_days,
          reminder_time: updates.reminder_time,
          color: updates.color,
          icon: updates.icon,
        })
        .eq('id', habitId);

      if (error) throw error;

      return true;
    } catch (error) {
      // Rollback on error
      set({
        habits: previousHabits,
        error: error instanceof Error ? error.message : 'Failed to update habit',
      });
      return false;
    }
  },

  deleteHabit: async (habitId: string) => {
    const state = get();
    const habit = state.habits.find((h) => h.id === habitId);
    
    if (!habit) {
      set({ error: 'Habit not found' });
      return false;
    }

    const previousHabits = [...state.habits];
    const previousStreaks = { ...state.streaks };
    const previousCompletions = [...state.completions];

    // Optimistic update - remove from local state
    const newStreaks = { ...state.streaks };
    delete newStreaks[habitId];

    set({
      habits: state.habits.filter((h) => h.id !== habitId),
      streaks: newStreaks,
      completions: state.completions.filter((c) => c.habit_id !== habitId),
      error: null,
    });

    try {
      // For demo mode, just keep the local update
      if (habit.user_id === 'demo') {
        return true;
      }

      // Soft delete in database (set is_active to false)
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId);

      if (error) throw error;

      return true;
    } catch (error) {
      // Rollback on error
      set({
        habits: previousHabits,
        streaks: previousStreaks,
        completions: previousCompletions,
        error: error instanceof Error ? error.message : 'Failed to delete habit',
      });
      return false;
    }
  },

  completeHabit: async (habitId: string, date?: string) => {

    const state = get();
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Prevent double-click
    if (state.completingHabitId === habitId) {
      return;
    }

    // Store previous state for rollback
    const previousCompletions = [...state.completions];
    const previousStreaks = { ...state.streaks };

    // Optimistic update
    const newCompletion: HabitCompletion = {
      id: `temp-${Date.now()}`,
      habit_id: habitId,
      user_id: 'temp',
      completed_date: targetDate,
      notes: null,
    };

    const currentStreak = (state.streaks[habitId]?.current_streak || 0) + 1;
    const longestStreak = Math.max(
      state.streaks[habitId]?.longest_streak || 0,
      currentStreak
    );

    set({
      completingHabitId: habitId,
      completions: [...state.completions, newCompletion],
      streaks: {
        ...state.streaks,
        [habitId]: {
          habit_id: habitId,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_completed_date: targetDate,
        },
      },
      error: null,
    });

    try {
      // Make API call
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: targetDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete habit');
      }

      const data = await response.json();

      // Update with server response
      set((state) => ({
        completingHabitId: null,
        completions: state.completions.map((c) =>
          c.id === newCompletion.id ? { ...c, id: data.completionId || c.id } : c
        ),
        streaks: {
          ...state.streaks,
          [habitId]: {
            habit_id: habitId,
            current_streak: data.streak ?? currentStreak,
            longest_streak: Math.max(data.streak ?? currentStreak, longestStreak),
            last_completed_date: targetDate,
          },
        },
      }));
    } catch (error) {
      // Rollback on error
      set({
        completingHabitId: null,
        completions: previousCompletions,
        streaks: previousStreaks,
        error: 'Failed to complete habit. Please try again.',
      });
    }
  },

  uncompleteHabit: async (habitId: string, date?: string) => {
    const state = get();
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Prevent double-click
    if (state.completingHabitId === habitId) {
      return;
    }

    const existingCompletion = state.completions.find(
      (c) => c.habit_id === habitId && c.completed_date === targetDate
    );

    if (!existingCompletion) return;

    // Store previous state for rollback
    const previousCompletions = [...state.completions];
    const previousStreaks = { ...state.streaks };

    // Optimistic update
    const newStreak = Math.max(0, (state.streaks[habitId]?.current_streak || 1) - 1);

    set({
      completingHabitId: habitId,
      completions: state.completions.filter((c) => c.id !== existingCompletion.id),
      streaks: {
        ...state.streaks,
        [habitId]: {
          ...state.streaks[habitId],
          habit_id: habitId,
          current_streak: newStreak,
          longest_streak: state.streaks[habitId]?.longest_streak || 0,
          last_completed_date: newStreak > 0 ? state.streaks[habitId]?.last_completed_date || null : null,
        },
      },
      error: null,
    });

    try {
      const response = await fetch(`/api/habits/${habitId}/uncomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: targetDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to uncomplete habit');
      }

      set({ completingHabitId: null });
    } catch (error) {
      // Rollback on error
      set({
        completingHabitId: null,
        completions: previousCompletions,
        streaks: previousStreaks,
        error: 'Failed to update habit. Please try again.',
      });
    }
  },

  isCompletedToday: (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return get().completions.some(
      (c) => c.habit_id === habitId && c.completed_date === today
    );
  },

  getStreak: (habitId: string) => {
    return get().streaks[habitId];
  },

  reset: () => {
    set({
      habits: [],
      completions: [],
      streaks: {},
      loading: true,
      error: null,
      completingHabitId: null,
    });
  },

  // Testing helpers
  _setHabits: (habits: Habit[]) => set({ habits }),
  _setStreaks: (streaks: Record<string, Streak>) => set({ streaks }),
  _setCompletions: (completions: HabitCompletion[]) => set({ completions }),
}));
