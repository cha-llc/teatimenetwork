import React from 'react';
import { 
  Clock, Users, Star, Flame, Zap, Trophy, 
  Heart, Dumbbell, Book, Brain, Target, Sun, Moon,
  Coffee, Music, Camera, Palette, Code, Globe, Home, Briefcase,
  Wallet, Gift, Calendar, Check, Crown, Share2, Trash2, Shield, Wine, Cigarette, Candy, Ban
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


interface TemplateCardProps {
  template: HabitTemplate;
  onClick: () => void;
  onUse?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
  showActions?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  onUse,
  onShare,
  onDelete,
  isOwner = false,
  showActions = true
}) => {
  const IconComponent = iconMap[template.icon] || Target;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'medium': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'hard': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const getGoalBadge = (goal: string) => {
    switch (goal) {
      case 'fitness': return { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', icon: Dumbbell };
      case 'productivity': return { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: Target };
      case 'wellness': return { color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400', icon: Heart };
      case 'learning': return { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Book };
      default: return { color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400', icon: Star };
    }
  };

  const goalBadge = getGoalBadge(template.goal);
  const GoalIcon = goalBadge.icon;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatUseCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="h-2" style={{ backgroundColor: template.color }} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${template.color}20` }}
          >
            <IconComponent className="w-6 h-6" style={{ color: template.color }} />
          </div>
          
          <div className="flex items-center gap-2">
            {template.is_official && (
              <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                Official
              </span>
            )}
            {template.is_community && !template.is_official && (
              <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                <Users className="w-3 h-3" />
                Community
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2 group-hover:text-[#7C9885] transition-colors">
          {template.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${goalBadge.color}`}>
            <GoalIcon className="w-3 h-3" />
            {template.goal.charAt(0).toUpperCase() + template.goal.slice(1)}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
            <Flame className="w-3 h-3" />
            {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            {formatDuration(template.duration_minutes)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {formatUseCount(template.use_count)} uses
            </span>
            {template.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {template.rating.toFixed(1)}
              </span>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-1">
              {isOwner && onShare && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(); }}
                  className={`p-2 rounded-lg transition-colors ${
                    template.is_community 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              {isOwner && onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {onUse && (
                <button
                  onClick={(e) => { e.stopPropagation(); onUse(); }}
                  className="px-4 py-2 bg-[#7C9885] text-white rounded-lg text-sm font-medium hover:bg-[#6a8573] transition-colors"
                >
                  Use
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
