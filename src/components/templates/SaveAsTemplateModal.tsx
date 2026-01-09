import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Lightbulb, Crown,
  Heart, Dumbbell, Book, Brain, Target, Sun, Moon,
  Coffee, Music, Camera, Palette, Code, Globe, Home, Briefcase,
  Wallet, Gift, Trophy, Flame, Zap, Clock, Calendar, Check, Star
} from 'lucide-react';
import { Habit } from '@/hooks/useHabits';
import { HabitTemplate } from '@/hooks/useTemplates';
import { useAuth } from '@/contexts/AuthContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  dumbbell: Dumbbell,
  book: Book,
  brain: Brain,
  target: Target,
  star: Star,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  music: Music,
  camera: Camera,
  palette: Palette,
  code: Code,
  globe: Globe,
  home: Home,
  briefcase: Briefcase,
  wallet: Wallet,
  gift: Gift,
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  clock: Clock,
  calendar: Calendar,
  check: Check
};

const availableColors = [
  '#7C9885', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6'
];

const availableIcons = [
  'heart', 'dumbbell', 'book', 'brain', 'target', 'star', 'sun', 'moon',
  'coffee', 'music', 'camera', 'palette', 'code', 'globe', 'home', 'briefcase',
  'wallet', 'gift', 'trophy', 'flame', 'zap', 'clock', 'calendar', 'check'
];

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  onSave: (template: Partial<HabitTemplate>) => Promise<void>;
}

const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  isOpen,
  onClose,
  habit,
  onSave
}) => {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    goal: 'custom' as const,
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '09:00',
    tips: ['', '', ''],
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    duration_minutes: 15,
    color: '#7C9885',
    icon: 'target'
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        category: habit.category,
        goal: 'custom',
        frequency: habit.frequency,
        target_days: habit.target_days,
        recommended_time: habit.reminder_time || '09:00',
        tips: ['', '', ''],
        difficulty: 'medium',
        duration_minutes: 15,
        color: habit.color,
        icon: habit.icon
      });
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        tips: formData.tips.filter(t => t.trim() !== '')
      });
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...formData.tips];
    newTips[index] = value;
    setFormData({ ...formData, tips: newTips });
  };

  const addTip = () => {
    if (formData.tips.length < 6) {
      setFormData({ ...formData, tips: [...formData.tips, ''] });
    }
  };

  const removeTip = (index: number) => {
    if (formData.tips.length > 1) {
      const newTips = formData.tips.filter((_, i) => i !== index);
      setFormData({ ...formData, tips: newTips });
    }
  };

  if (!isOpen) return null;

  const isPremium = profile?.is_premium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Save as Template</h2>
            <p className="text-sm text-gray-500 mt-1">Create a reusable template from this habit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!isPremium ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Feature</h3>
            <p className="text-gray-500 mb-6">
              Creating custom templates is available for Premium users. Upgrade to save your habits as templates and share them with the community.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Upgrade to Premium
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all"
                  placeholder="e.g., Morning Meditation"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Describe what this habit is about and its benefits..."
                />
              </div>

              {/* Color and Icon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.color === color 
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {availableIcons.slice(0, 12).map(icon => {
                      const IconComp = iconMap[icon];
                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            formData.icon === icon 
                              ? 'bg-[#7C9885] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Difficulty and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all"
                    min={1}
                    max={480}
                  />
                </div>
              </div>

              {/* Tips */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Tips for Success
                  </label>
                  {formData.tips.length < 6 && (
                    <button
                      type="button"
                      onClick={addTip}
                      className="text-sm text-[#7C9885] hover:text-[#6a8573] font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Tip
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.tips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => updateTip(index, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent transition-all text-sm"
                        placeholder={`Tip ${index + 1}`}
                      />
                      {formData.tips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTip(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="px-8 py-2.5 bg-[#7C9885] text-white rounded-xl font-medium hover:bg-[#6a8573] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SaveAsTemplateModal;
