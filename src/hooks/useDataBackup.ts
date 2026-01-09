import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Habit, HabitCompletion, Streak } from '@/hooks/useHabits';

interface BackupData {
  version: string;
  exportDate: string;
  user: {
    id: string;
    email: string;
  };
  profile: {
    display_name: string | null;
    timezone: string | null;
    reminder_enabled: boolean;
    reminder_time: string | null;
  };
  habits: Habit[];
  completions: HabitCompletion[];
  streaks: Streak[];
  categories: any[];
  settings: {
    habitReminders: any[];
    theme: string;
    language: string;
  };
}

export const useDataBackup = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);

  const fetchAllData = useCallback(async (): Promise<BackupData | null> => {
    if (!user) return null;

    try {
      setExportProgress(10);

      // Fetch habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      if (habitsError) throw habitsError;
      setExportProgress(30);

      // Fetch all completions (not just last 30 days)
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_date', { ascending: false });

      if (completionsError) throw completionsError;
      setExportProgress(50);

      // Fetch streaks
      const { data: streaks, error: streaksError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id);

      if (streaksError) throw streaksError;
      setExportProgress(70);

      // Fetch categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      setExportProgress(90);

      // Get local settings
      const habitReminders = localStorage.getItem(`habitReminders_${user.id}`);
      const theme = localStorage.getItem('vite-ui-theme') || 'system';
      const language = localStorage.getItem('app-language') || 'en';

      setExportProgress(100);

      return {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email || '',
        },
        profile: {
          display_name: profile?.display_name || null,
          timezone: profile?.timezone || null,
          reminder_enabled: profile?.reminder_enabled || false,
          reminder_time: profile?.reminder_time || null,
        },
        habits: habits || [],
        completions: completions || [],
        streaks: streaks || [],
        categories: categories || [],
        settings: {
          habitReminders: habitReminders ? JSON.parse(habitReminders) : [],
          theme,
          language,
        },
      };
    } catch (error) {
      console.error('Error fetching data for backup:', error);
      throw error;
    }
  }, [user, profile]);

  const exportToJSON = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to export data.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const data = await fetchAllData();
      if (!data) throw new Error('Failed to fetch data');

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Exported ${data.habits.length} habits, ${data.completions.length} completions, and all settings.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [user, fetchAllData, toast]);

  const exportToCSV = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to export data.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const data = await fetchAllData();
      if (!data) throw new Error('Failed to fetch data');

      // Create CSV for habits
      const habitsCSV = [
        ['ID', 'Name', 'Description', 'Category', 'Frequency', 'Color', 'Created At', 'Current Streak', 'Longest Streak'].join(','),
        ...data.habits.map(h => {
          const streak = data.streaks.find(s => s.habit_id === h.id);
          return [
            h.id,
            `"${h.name.replace(/"/g, '""')}"`,
            `"${(h.description || '').replace(/"/g, '""')}"`,
            h.category,
            h.frequency,
            h.color,
            h.created_at,
            streak?.current_streak || 0,
            streak?.longest_streak || 0,
          ].join(',');
        }),
      ].join('\n');

      // Create CSV for completions
      const completionsCSV = [
        ['Habit ID', 'Habit Name', 'Completed Date', 'Notes'].join(','),
        ...data.completions.map(c => {
          const habit = data.habits.find(h => h.id === c.habit_id);
          return [
            c.habit_id,
            `"${(habit?.name || 'Unknown').replace(/"/g, '""')}"`,
            c.completed_date,
            `"${(c.notes || '').replace(/"/g, '""')}"`,
          ].join(',');
        }),
      ].join('\n');

      // Download habits CSV
      const habitsBlob = new Blob([habitsCSV], { type: 'text/csv' });
      const habitsUrl = URL.createObjectURL(habitsBlob);
      const habitsLink = document.createElement('a');
      habitsLink.href = habitsUrl;
      habitsLink.download = `habits-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(habitsLink);
      habitsLink.click();
      document.body.removeChild(habitsLink);
      URL.revokeObjectURL(habitsUrl);

      // Download completions CSV
      const completionsBlob = new Blob([completionsCSV], { type: 'text/csv' });
      const completionsUrl = URL.createObjectURL(completionsBlob);
      const completionsLink = document.createElement('a');
      completionsLink.href = completionsUrl;
      completionsLink.download = `completions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(completionsLink);
      completionsLink.click();
      document.body.removeChild(completionsLink);
      URL.revokeObjectURL(completionsUrl);

      toast({
        title: 'Export Successful',
        description: 'Downloaded habits.csv and completions.csv files.',
      });
    } catch (error) {
      console.error('CSV Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [user, fetchAllData, toast]);

  const importFromJSON = useCallback(async (file: File): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to import data.',
        variant: 'destructive',
      });
      return false;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      // Validate backup structure
      if (!data.version || !data.habits || !data.completions) {
        throw new Error('Invalid backup file format');
      }

      setImportProgress(10);

      // Import habits
      let habitsImported = 0;
      const habitIdMap: Record<string, string> = {};

      for (const habit of data.habits) {
        const { data: newHabit, error } = await supabase
          .from('habits')
          .insert({
            user_id: user.id,
            name: habit.name,
            description: habit.description,
            category: habit.category,
            frequency: habit.frequency,
            target_days: habit.target_days,
            reminder_time: habit.reminder_time,
            color: habit.color,
            icon: habit.icon,
            is_active: habit.is_active,
          })
          .select()
          .single();

        if (!error && newHabit) {
          habitIdMap[habit.id] = newHabit.id;
          habitsImported++;
        }
      }

      setImportProgress(40);

      // Import completions
      let completionsImported = 0;
      const completionBatches = [];
      const batchSize = 100;

      for (let i = 0; i < data.completions.length; i += batchSize) {
        const batch = data.completions.slice(i, i + batchSize).map(c => ({
          user_id: user.id,
          habit_id: habitIdMap[c.habit_id] || c.habit_id,
          completed_date: c.completed_date,
          notes: c.notes,
        })).filter(c => habitIdMap[data.completions.find(orig => orig.completed_date === c.completed_date)?.habit_id || '']);

        if (batch.length > 0) {
          completionBatches.push(batch);
        }
      }

      for (let i = 0; i < completionBatches.length; i++) {
        const { error } = await supabase
          .from('habit_completions')
          .insert(completionBatches[i]);

        if (!error) {
          completionsImported += completionBatches[i].length;
        }
        setImportProgress(40 + Math.round((i / completionBatches.length) * 40));
      }

      setImportProgress(80);

      // Import streaks
      for (const streak of data.streaks) {
        const newHabitId = habitIdMap[streak.habit_id];
        if (newHabitId) {
          await supabase
            .from('streaks')
            .upsert({
              user_id: user.id,
              habit_id: newHabitId,
              current_streak: streak.current_streak,
              longest_streak: streak.longest_streak,
              last_completed_date: streak.last_completed_date,
            });
        }
      }

      setImportProgress(90);

      // Import local settings
      if (data.settings?.habitReminders) {
        const remappedReminders = data.settings.habitReminders.map((r: any) => ({
          ...r,
          habitId: habitIdMap[r.habitId] || r.habitId,
        }));
        localStorage.setItem(`habitReminders_${user.id}`, JSON.stringify(remappedReminders));
      }

      setImportProgress(100);

      toast({
        title: 'Import Successful',
        description: `Imported ${habitsImported} habits and ${completionsImported} completions.`,
      });

      return true;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import data. Please check the file format.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [user, toast]);

  const getBackupStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { count: habitsCount } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: completionsCount } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        habits: habitsCount || 0,
        completions: completionsCount || 0,
        lastBackup: localStorage.getItem(`lastBackup_${user.id}`) || null,
      };
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return null;
    }
  }, [user]);

  const recordBackup = useCallback(() => {
    if (user) {
      localStorage.setItem(`lastBackup_${user.id}`, new Date().toISOString());
    }
  }, [user]);

  return {
    isExporting,
    isImporting,
    exportProgress,
    importProgress,
    exportToJSON,
    exportToCSV,
    importFromJSON,
    getBackupStats,
    recordBackup,
  };
};
