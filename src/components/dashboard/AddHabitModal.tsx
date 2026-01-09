import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Bell, Clock, ChevronDown, Shield, Cigarette, Wine, Coffee, Candy } from 'lucide-react';
import { Habit } from '@/hooks/useHabits';
import { useCategories, defaultCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import CategoryIcon from '@/components/categories/CategoryIcon';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Partial<Habit>) => Promise<void>;
  editHabit?: Habit | null;
}

const colors = [
  '#7C9885', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4'
];

const quickTimeOptions = [
  { label: 'Morning', time: '07:00' },
  { label: 'Noon', time: '12:00' },
  { label: 'Evening', time: '18:00' },
  { label: 'Night', time: '21:00' },
];

// Quick habit suggestions including "Stop" habits
const quickHabitSuggestions = [
  // Breaking Bad Habits (Free)
  { 
    name: 'Stop Vaping', 
    description: 'Track vape-free days and build healthier coping mechanisms',
    category: 'health',
    color: '#EF4444',
    icon: 'shield'
  },
  { 
    name: 'Stop Smoking', 
    description: 'Quit smoking and reclaim your health',
    category: 'health',
    color: '#DC2626',
    icon: 'shield'
  },
  { 
    name: 'Stop Drinking Alcohol', 
    description: 'Track sober days and discover a clearer, healthier you',
    category: 'health',
    color: '#7C3AED',
    icon: 'shield'
  },
  { 
    name: 'Stop Eating Sugar', 
    description: 'Break sugar addiction for better energy and mood',
    category: 'health',
    color: '#F59E0B',
    icon: 'shield'
  },
  { 
    name: 'Stop Consuming Caffeine', 
    description: 'Reduce caffeine for better sleep and natural energy',
    category: 'health',
    color: '#8B5CF6',
    icon: 'coffee'
  },
  // Popular Positive Habits
  { 
    name: 'Morning Meditation', 
    description: 'Start your day with mindfulness',
    category: 'mindfulness',
    color: '#8B5CF6',
    icon: 'brain'
  },
  { 
    name: 'Daily Exercise', 
    description: 'Stay active with daily workouts',
    category: 'fitness',
    color: '#F59E0B',
    icon: 'dumbbell'
  },
  { 
    name: 'Read 30 Minutes', 
    description: 'Expand your knowledge through reading',
    category: 'learning',
    color: '#3B82F6',
    icon: 'book'
  },
  { 
    name: 'Drink 8 Glasses of Water', 
    description: 'Stay hydrated for better health',
    category: 'health',
    color: '#0EA5E9',
    icon: 'coffee'
  },
  { 
    name: 'Gratitude Journal', 
    description: 'Write 3 things you are grateful for',
    category: 'mindfulness',
    color: '#F59E0B',
    icon: 'sun'
  },
];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onSave, editHabit }) => {
  const { user, profile } = useAuth();
  const { categories } = useCategories();
  const { isEnabled: notificationsEnabled, setHabitReminder, getHabitReminder } = useNotifications();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [color, setColor] = useState('#7C9885');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Combine default and custom categories
  const allCategories = useMemo(() => {
    const customCats = categories.filter(c => !c.is_default);
    const defaultCats = defaultCategories.map(d => ({
      id: d.name.toLowerCase(),
      label: d.name,
      color: d.color,
      icon: d.icon
    }));
    const customCatsMapped = customCats.map(c => ({
      id: c.id,
      label: c.name,
      color: c.color,
      icon: c.icon
    }));
    return [...defaultCats, ...customCatsMapped];
  }, [categories]);

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setDescription(editHabit.description || '');
      setCategory(editHabit.category);
      setFrequency(editHabit.frequency);
      setSelectedDays(editHabit.target_days);
      setColor(editHabit.color);
      
      // Check for existing reminder
      const existingReminder = getHabitReminder(editHabit.id);
      if (existingReminder) {
        setReminderEnabled(existingReminder.enabled);
        setReminderTime(existingReminder.reminderTime);
      } else if (editHabit.reminder_time) {
        setReminderEnabled(true);
        setReminderTime(editHabit.reminder_time.slice(0, 5));
      } else {
        setReminderEnabled(false);
        setReminderTime('09:00');
      }
    } else {
      setName('');
      setDescription('');
      setCategory('general');
      setFrequency('daily');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setColor('#7C9885');
      setReminderEnabled(false);
      setReminderTime('09:00');
    }
  }, [editHabit, isOpen, getHabitReminder]);

  if (!isOpen) return null;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const selectQuickHabit = (habit: typeof quickHabitSuggestions[0]) => {
    setName(habit.name);
    setDescription(habit.description);
    setCategory(habit.category);
    setColor(habit.color);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        category,
        frequency,
        target_days: selectedDays,
        color,
        reminder_time: reminderEnabled ? reminderTime + ':00' : null
      });
      
      // Set up browser notification reminder if enabled
      if (reminderEnabled && notificationsEnabled && editHabit) {
        setHabitReminder(editHabit.id, name.trim(), reminderTime, true);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const getIconForSuggestion = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <Shield className="w-4 h-4" />;
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      default:
        return <CategoryIcon icon={iconName} size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Quick Habit Suggestions */}
          {!editHabit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Start (Optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    Choose from popular habits...
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                </button>
                
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {/* Breaking Bad Habits Section */}
                    <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Break Bad Habits
                      </span>
                    </div>
                    {quickHabitSuggestions.slice(0, 5).map((habit, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectQuickHabit(habit)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                        >
                          {getIconForSuggestion(habit.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{habit.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{habit.description}</p>
                        </div>
                      </button>
                    ))}
                    
                    {/* Positive Habits Section */}
                    <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                        Build Good Habits
                      </span>
                    </div>
                    {quickHabitSuggestions.slice(5).map((habit, index) => (
                      <button
                        key={index + 5}
                        type="button"
                        onClick={() => selectQuickHabit(habit)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                        >
                          {getIconForSuggestion(habit.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{habit.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{habit.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              placeholder="e.g., Morning meditation"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              placeholder="Add a note about this habit..."
              rows={2}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {allCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={category === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <CategoryIcon icon={cat.icon} size={14} />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrequency('daily');
                  setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  frequency === 'daily'
                    ? 'bg-[#7C9885] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  frequency === 'weekly'
                    ? 'bg-[#7C9885] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Specific Days
              </button>
            </div>
          </div>

          {/* Day selector */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Days
              </label>
              <div className="flex gap-2">
                {days.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedDays.includes(index)
                        ? 'bg-[#7C9885] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-800 dark:text-white">Daily Reminder</span>
              </div>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {reminderEnabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {quickTimeOptions.map(option => (
                    <button
                      key={option.time}
                      type="button"
                      onClick={() => setReminderTime(option.time)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        reminderTime === option.time
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {!notificationsEnabled && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Enable browser notifications in settings to receive reminders
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {editHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
