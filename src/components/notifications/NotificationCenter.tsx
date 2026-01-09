import React, { useState } from 'react';
import { Bell, BellOff, BellRing, Clock, Zap, Settings, X, Check, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Habit, Streak } from '@/hooks/useHabits';

interface NotificationCenterProps {
  habits: Habit[];
  streaks: Record<string, Streak>;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ habits, streaks }) => {
  const {
    isSupported,
    isEnabled,
    isLoading,
    habitReminders,
    requestPermission,
    sendTestNotification,
    setHabitReminder,
    removeHabitReminder,
    getMotivationalMessage
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState('09:00');

  const activeReminders = habitReminders.filter(r => r.enabled);

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  const handleSetReminder = (habitId: string, habitName: string) => {
    setHabitReminder(habitId, habitName, reminderTime, true);
    setSelectedHabit(null);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {isEnabled ? (
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        {activeReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
            {activeReminders.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Enable Notifications */}
              {!isEnabled && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Enable Notifications
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Get reminders to complete your habits
                      </p>
                      <button
                        onClick={handleEnableNotifications}
                        disabled={isLoading}
                        className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Enabling...' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Reminders */}
              {activeReminders.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Active Reminders
                  </h4>
                  <div className="space-y-2">
                    {activeReminders.map(reminder => (
                      <div
                        key={reminder.habitId}
                        className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {reminder.habitName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(reminder.reminderTime)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeHabitReminder(reminder.habitId)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Add Reminder */}
              {isEnabled && habits.length > 0 && (
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Quick Add Reminder
                  </h4>
                  
                  {selectedHabit ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedHabit(null)}
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const habit = habits.find(h => h.id === selectedHabit);
                            if (habit) handleSetReminder(habit.id, habit.name);
                          }}
                          className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
                        >
                          Set Reminder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {habits
                        .filter(h => !habitReminders.find(r => r.habitId === h.id && r.enabled))
                        .slice(0, 5)
                        .map(habit => (
                          <button
                            key={habit.id}
                            onClick={() => setSelectedHabit(habit.id)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${habit.color}20` }}
                            >
                              <Bell className="w-4 h-4" style={{ color: habit.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                {habit.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tap to set reminder
                              </p>
                            </div>
                            <Zap className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Motivational Tip */}
              {isEnabled && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-1">
                        Tip of the Day
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300 italic">
                        "{getMotivationalMessage(Math.max(...Object.values(streaks).map(s => s.current_streak || 0), 0))}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Notification */}
              {isEnabled && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={sendTestNotification}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Send Test Notification
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
