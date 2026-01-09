import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Habit, Streak } from '@/hooks/useHabits';

interface NotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | null;
  isLoading: boolean;
}

interface ScheduledReminder {
  habitId: string;
  habitName: string;
  time: string;
  timeoutId: NodeJS.Timeout | null;
  snoozedUntil: Date | null;
}

export interface HabitReminder {
  habitId: string;
  habitName: string;
  reminderTime: string;
  enabled: boolean;
  snoozedUntil: string | null;
  frequency: 'daily' | 'specific_days';
  specificDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  customMessage: string | null;
  snoozeOptions: number[]; // minutes
}

// Motivational messages based on streak status
const motivationalMessages = {
  noStreak: [
    "Every journey begins with a single step. Start your streak today!",
    "Today is a fresh start. Let's build something amazing together!",
    "The best time to start was yesterday. The second best time is now!",
    "Small steps lead to big changes. You've got this!",
    "Your future self will thank you for starting today."
  ],
  shortStreak: [
    "You're building momentum! Keep that streak alive!",
    "Great start! Every day counts towards your goal.",
    "You're on a roll! Don't break the chain!",
    "Consistency is key, and you're nailing it!",
    "Your dedication is inspiring. Keep pushing forward!"
  ],
  weekStreak: [
    "A whole week! You're developing a real habit now!",
    "Your commitment is paying off. Keep going strong!",
    "You're in the habit-forming zone! This is where magic happens.",
    "Impressive streak! You're proving what you're capable of.",
    "Week by week, you're becoming unstoppable!"
  ],
  monthStreak: [
    "A month of consistency! You're a habit champion!",
    "30+ days! This habit is now part of who you are.",
    "Your dedication is remarkable. You're an inspiration!",
    "A month strong! You've proven you can do anything.",
    "This is no longer just a habit - it's your lifestyle!"
  ],
  longStreak: [
    "100+ days! You're absolutely legendary!",
    "Triple digits! Your consistency is world-class!",
    "You've mastered the art of habit building. Incredible!",
    "100+ days of dedication. You're unstoppable!",
    "This streak is a testament to your incredible willpower!"
  ]
};

function getMotivationalMessage(currentStreak: number): string {
  let messages: string[];
  
  if (currentStreak === 0) {
    messages = motivationalMessages.noStreak;
  } else if (currentStreak < 7) {
    messages = motivationalMessages.shortStreak;
  } else if (currentStreak < 30) {
    messages = motivationalMessages.weekStreak;
  } else if (currentStreak < 100) {
    messages = motivationalMessages.monthStreak;
  } else {
    messages = motivationalMessages.longStreak;
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
}

export const useNotifications = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: null,
    isLoading: false,
  });
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [habitReminders, setHabitReminders] = useState<HabitReminder[]>([]);
  const schedulerRef = useRef<NodeJS.Timeout | null>(null);
  const snoozeTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Check if notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window;
    const permission = isSupported ? Notification.permission : null;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
      isEnabled: permission === 'granted',
    }));
  }, []);

  // Load habit reminders from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`habitReminders_${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Migrate old format to new format
          const migrated = parsed.map((r: any) => ({
            ...r,
            frequency: r.frequency || 'daily',
            specificDays: r.specificDays || [0, 1, 2, 3, 4, 5, 6],
            customMessage: r.customMessage || null,
            snoozeOptions: r.snoozeOptions || [5, 10, 15, 30, 60],
          }));
          setHabitReminders(migrated);
        } catch (e) {
          console.error('Failed to parse stored reminders:', e);
        }
      }
    }
  }, [user]);

  // Save habit reminders to localStorage
  const saveHabitReminders = useCallback((reminders: HabitReminder[]) => {
    if (user) {
      localStorage.setItem(`habitReminders_${user.id}`, JSON.stringify(reminders));
      setHabitReminders(reminders);
    }
  }, [user]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === 'granted',
        isLoading: false,
      }));

      if (permission === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive habit reminders.',
        });

        if (user) {
          await registerPushSubscription();
        }

        return true;
      } else if (permission === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to enable notifications. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [state.isSupported, user, toast]);

  // Register push subscription with the server
  const registerPushSubscription = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          push_notifications_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    } catch (error) {
      console.error('Error registering push subscription:', error);
    }
  }, [user]);

  // Send a notification with motivational message and action buttons
  const sendNotification = useCallback((
    title: string, 
    body: string, 
    options?: { 
      tag?: string; 
      requireInteraction?: boolean;
      streak?: number;
      habitName?: string;
      habitId?: string;
      actions?: { action: string; title: string }[];
    }
  ) => {
    if (!state.isEnabled) return;

    try {
      let finalBody = body;
      if (options?.streak !== undefined) {
        const motivation = getMotivationalMessage(options.streak);
        finalBody = `${body}\n\n${motivation}`;
      }

      const notificationOptions: NotificationOptions = {
        body: finalBody,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'habit-reminder',
        requireInteraction: options?.requireInteraction || false,
        data: {
          habitId: options?.habitId,
          habitName: options?.habitName,
        },
      };

      const notification = new Notification(title, notificationOptions);

      // Handle notification click - mark as complete or snooze
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Dispatch custom event for habit completion from notification
        if (options?.habitId) {
          window.dispatchEvent(new CustomEvent('habit-notification-click', {
            detail: { habitId: options.habitId, action: 'complete' }
          }));
        }
        
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [state.isEnabled]);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (!state.isEnabled) {
      toast({
        title: 'Notifications Disabled',
        description: 'Please enable notifications first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      sendNotification(
        'Test Notification',
        'Your habit reminders are working! You\'ll receive notifications at your scheduled times.',
        { tag: 'test-notification', streak: 7 }
      );

      toast({
        title: 'Test Notification Sent',
        description: 'Check your notification center!',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      });
    }
  }, [state.isEnabled, toast, sendNotification]);

  // Set reminder for a specific habit with advanced options
  const setHabitReminder = useCallback((
    habitId: string, 
    habitName: string, 
    reminderTime: string,
    enabled: boolean = true,
    options?: {
      frequency?: 'daily' | 'specific_days';
      specificDays?: number[];
      customMessage?: string;
      snoozeOptions?: number[];
    }
  ) => {
    const newReminders = habitReminders.filter(r => r.habitId !== habitId);
    newReminders.push({
      habitId,
      habitName,
      reminderTime,
      enabled,
      snoozedUntil: null,
      frequency: options?.frequency || 'daily',
      specificDays: options?.specificDays || [0, 1, 2, 3, 4, 5, 6],
      customMessage: options?.customMessage || null,
      snoozeOptions: options?.snoozeOptions || [5, 10, 15, 30, 60],
    });
    saveHabitReminders(newReminders);
    
    toast({
      title: enabled ? 'Reminder Set' : 'Reminder Disabled',
      description: enabled 
        ? `You'll be reminded about "${habitName}" at ${reminderTime}`
        : `Reminder for "${habitName}" has been disabled`,
    });
  }, [habitReminders, saveHabitReminders, toast]);

  // Update existing reminder
  const updateHabitReminder = useCallback((
    habitId: string,
    updates: Partial<HabitReminder>
  ) => {
    const newReminders = habitReminders.map(r => 
      r.habitId === habitId ? { ...r, ...updates } : r
    );
    saveHabitReminders(newReminders);
  }, [habitReminders, saveHabitReminders]);

  // Remove reminder for a habit
  const removeHabitReminder = useCallback((habitId: string) => {
    const newReminders = habitReminders.filter(r => r.habitId !== habitId);
    saveHabitReminders(newReminders);
    
    // Clear any pending snooze timeouts
    const timeout = snoozeTimeoutsRef.current.get(habitId);
    if (timeout) {
      clearTimeout(timeout);
      snoozeTimeoutsRef.current.delete(habitId);
    }
  }, [habitReminders, saveHabitReminders]);

  // Get reminder for a specific habit
  const getHabitReminder = useCallback((habitId: string): HabitReminder | undefined => {
    return habitReminders.find(r => r.habitId === habitId);
  }, [habitReminders]);

  // Snooze a habit reminder with custom duration
  const snoozeReminder = useCallback((habitId: string, minutes: number = 15) => {
    const reminder = habitReminders.find(r => r.habitId === habitId);
    if (!reminder) return;

    // Clear any existing snooze timeout
    const existingTimeout = snoozeTimeoutsRef.current.get(habitId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
    const newReminders = habitReminders.map(r => 
      r.habitId === habitId 
        ? { ...r, snoozedUntil: snoozedUntil.toISOString() }
        : r
    );
    saveHabitReminders(newReminders);

    toast({
      title: 'Reminder Snoozed',
      description: `"${reminder.habitName}" reminder snoozed for ${minutes} minutes`,
    });

    // Schedule the snoozed notification
    const timeout = setTimeout(() => {
      const message = reminder.customMessage || `Time to get back to "${reminder.habitName}"!`;
      sendNotification(
        `Snoozed Reminder: ${reminder.habitName}`,
        message,
        { 
          tag: `snooze-${habitId}`, 
          requireInteraction: true,
          habitId,
          habitName: reminder.habitName,
        }
      );
      
      // Clear the snooze
      const updatedReminders = habitReminders.map(r =>
        r.habitId === habitId ? { ...r, snoozedUntil: null } : r
      );
      saveHabitReminders(updatedReminders);
      snoozeTimeoutsRef.current.delete(habitId);
    }, minutes * 60 * 1000);

    snoozeTimeoutsRef.current.set(habitId, timeout);
  }, [habitReminders, saveHabitReminders, toast, sendNotification]);

  // Check if reminder should fire today based on frequency settings
  const shouldReminderFireToday = useCallback((reminder: HabitReminder): boolean => {
    if (reminder.frequency === 'daily') return true;
    
    const today = new Date().getDay(); // 0 = Sunday
    return reminder.specificDays.includes(today);
  }, []);

  // Check and trigger due reminders
  const checkReminders = useCallback((habits: Habit[], streaks: Record<string, Streak>, completions: string[]) => {
    if (!state.isEnabled) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    habitReminders.forEach(reminder => {
      if (!reminder.enabled) return;
      
      // Check if should fire today
      if (!shouldReminderFireToday(reminder)) return;
      
      // Check if snoozed
      if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) return;
      
      // Check if it's time for the reminder (within 1 minute window)
      if (reminder.reminderTime === currentTime) {
        const habit = habits.find(h => h.id === reminder.habitId);
        if (!habit) return;

        // Check if already completed today
        const today = new Date().toISOString().split('T')[0];
        if (completions.includes(`${reminder.habitId}_${today}`)) return;

        const streak = streaks[reminder.habitId];
        const currentStreak = streak?.current_streak || 0;

        const message = reminder.customMessage || habit.description || `Don't forget to complete "${habit.name}" today!`;

        sendNotification(
          `Time for: ${habit.name}`,
          message,
          { 
            tag: `habit-${reminder.habitId}`, 
            requireInteraction: true,
            streak: currentStreak,
            habitName: habit.name,
            habitId: reminder.habitId,
          }
        );
      }
    });
  }, [state.isEnabled, habitReminders, sendNotification, shouldReminderFireToday]);

  // Start the reminder scheduler
  const startScheduler = useCallback((
    habits: Habit[], 
    streaks: Record<string, Streak>,
    completedHabitIds: string[]
  ) => {
    // Clear existing scheduler
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
    }

    // Check reminders every minute
    schedulerRef.current = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      const completionKeys = completedHabitIds.map(id => `${id}_${today}`);
      checkReminders(habits, streaks, completionKeys);
    }, 60000); // Check every minute

    // Also check immediately
    const today = new Date().toISOString().split('T')[0];
    const completionKeys = completedHabitIds.map(id => `${id}_${today}`);
    checkReminders(habits, streaks, completionKeys);
  }, [checkReminders]);

  // Stop the scheduler
  const stopScheduler = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    
    // Clear all snooze timeouts
    snoozeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    snoozeTimeoutsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScheduler();
    };
  }, [stopScheduler]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          push_notifications_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      stopScheduler();

      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }, [user, toast, stopScheduler]);

  // Schedule a one-time notification
  const scheduleNotification = useCallback((title: string, body: string, delay: number = 0) => {
    if (!state.isEnabled) return;

    setTimeout(() => {
      sendNotification(title, body);
    }, delay);
  }, [state.isEnabled, sendNotification]);

  // Send streak warning notification
  const sendStreakWarning = useCallback((habit: Habit, streak: Streak) => {
    if (!state.isEnabled) return;

    const currentStreak = streak?.current_streak || 0;
    let title = 'Streak Alert!';
    let body = '';

    if (currentStreak >= 30) {
      title = 'Your streak is at risk!';
      body = `Your ${currentStreak}-day streak for "${habit.name}" is at risk! Don't let it slip away!`;
    } else if (currentStreak >= 7) {
      body = `Keep your ${currentStreak}-day streak going for "${habit.name}"!`;
    } else if (currentStreak > 0) {
      body = `Continue building your streak for "${habit.name}"! Day ${currentStreak + 1} awaits!`;
    } else {
      body = `Time to work on "${habit.name}"! Start a new streak today!`;
    }

    sendNotification(title, body, { 
      tag: `streak-warning-${habit.id}`,
      requireInteraction: true,
      streak: currentStreak,
      habitId: habit.id,
      habitName: habit.name,
    });
  }, [state.isEnabled, sendNotification]);

  // Mark habit complete from notification (called via custom event)
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { habitId, action } = event.detail;
      if (action === 'complete' && habitId) {
        // Dispatch event to complete habit
        window.dispatchEvent(new CustomEvent('complete-habit-from-notification', {
          detail: { habitId }
        }));
      }
    };

    window.addEventListener('habit-notification-click', handleNotificationClick as EventListener);
    return () => {
      window.removeEventListener('habit-notification-click', handleNotificationClick as EventListener);
    };
  }, []);

  return {
    ...state,
    habitReminders,
    requestPermission,
    sendTestNotification,
    sendNotification,
    scheduleNotification,
    disableNotifications,
    setHabitReminder,
    updateHabitReminder,
    removeHabitReminder,
    getHabitReminder,
    snoozeReminder,
    startScheduler,
    stopScheduler,
    sendStreakWarning,
    getMotivationalMessage,
    shouldReminderFireToday,
  };
};
