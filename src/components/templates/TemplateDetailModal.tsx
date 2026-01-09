import React from 'react';
import { 
  X, Clock, Users, Star, Flame, Calendar, Lightbulb, Crown,
  Heart, Dumbbell, Book, Brain, Target, Sun, Moon,
  Coffee, Music, Camera, Palette, Code, Globe, Home, Briefcase,
  Wallet, Gift, Trophy, Zap, Check, Shield, Wine, Cigarette, Candy, Ban
} from 'lucide-react';
import { HabitTemplate } from '@/hooks/useTemplates';

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
  check: Check,
  shield: Shield,
  wine: Wine,
  cigarette: Cigarette,
  candy: Candy,
  ban: Ban
};


interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: HabitTemplate | null;
  onUse: (template: HabitTemplate) => void;
}

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  isOpen,
  onClose,
  template,
  onUse
}) => {
  if (!isOpen || !template) return null;

  const IconComponent = iconMap[template.icon] || Target;

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { color: 'bg-green-100 text-green-700', label: 'Easy', desc: 'Great for beginners' };
      case 'medium': return { color: 'bg-amber-100 text-amber-700', label: 'Medium', desc: 'Some commitment required' };
      case 'hard': return { color: 'bg-red-100 text-red-700', label: 'Hard', desc: 'For dedicated practitioners' };
      default: return { color: 'bg-gray-100 text-gray-700', label: difficulty, desc: '' };
    }
  };

  const difficultyInfo = getDifficultyInfo(template.difficulty);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} min` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatUseCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header with color accent */}
        <div 
          className="h-3"
          style={{ backgroundColor: template.color }}
        />
        
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            {/* Header section */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${template.color}20` }}
              >
                <IconComponent 
                  className="w-8 h-8" 
                  style={{ color: template.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-2">
                  {template.is_official && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      Official
                    </span>
                  )}
                  {template.is_community && !template.is_official && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Users className="w-3 h-3" />
                      Community
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {template.name}
                </h2>
                <p className="text-gray-600">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="font-medium">{formatUseCount(template.use_count)}</span>
                <span className="text-gray-400">users</span>
              </div>
              {template.rating > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-medium">{template.rating.toFixed(1)}</span>
                  <span className="text-gray-400">rating</span>
                </div>
              )}
              {template.creator_name && (
                <div className="text-gray-500 text-sm">
                  by <span className="font-medium text-gray-700">{template.creator_name}</span>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Flame className="w-4 h-4" />
                  Difficulty
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${difficultyInfo.color}`}>
                  {difficultyInfo.label}
                </div>
                <p className="text-xs text-gray-400 mt-1">{difficultyInfo.desc}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Duration
                </div>
                <div className="font-semibold text-gray-800">
                  {formatDuration(template.duration_minutes)}
                </div>
                <p className="text-xs text-gray-400 mt-1">per session</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Frequency
                </div>
                <div className="font-semibold text-gray-800 capitalize">
                  {template.frequency}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {template.target_days.length === 7 
                    ? 'Every day' 
                    : template.target_days.map(d => dayNames[d]).join(', ')}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Best Time
                </div>
                <div className="font-semibold text-gray-800">
                  {formatTime(template.recommended_time)}
                </div>
                <p className="text-xs text-gray-400 mt-1">recommended</p>
              </div>
            </div>

            {/* Tips section */}
            {template.tips && template.tips.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Tips for Success</h3>
                </div>
                <ul className="space-y-2">
                  {template.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-[#7C9885]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#7C9885]" />
                      </div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span>Category:</span>
              <span 
                className="px-3 py-1 rounded-lg font-medium"
                style={{ 
                  backgroundColor: `${template.color}20`,
                  color: template.color
                }}
              >
                {template.category}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onUse(template)}
              className="px-8 py-2.5 bg-[#7C9885] text-white rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailModal;
