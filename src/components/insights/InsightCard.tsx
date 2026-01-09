import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Target, 
  Flame, 
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface InsightCardProps {
  type?: 'positive' | 'negative' | 'neutral' | 'warning' | 'info';
  icon?: string;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'calendar': Calendar,
  'clock': Clock,
  'target': Target,
  'flame': Flame,
  'star': Star,
  'alert': AlertTriangle,
  'check': CheckCircle,
  'info': Info,
  'lightbulb': Lightbulb
};

const typeStyles: Record<string, { bg: string; border: string; icon: string; iconBg: string }> = {
  positive: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/40'
  },
  negative: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40'
  },
  neutral: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-100 dark:bg-gray-800'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40'
  }
};

const InsightCard: React.FC<InsightCardProps> = ({
  type = 'neutral',
  icon = 'info',
  title,
  description,
  action,
  onAction,
  className = ''
}) => {
  const styles = typeStyles[type] || typeStyles.neutral;
  const IconComponent = iconMap[icon] || Info;

  return (
    <div className={`rounded-xl border p-4 ${styles.bg} ${styles.border} ${className}`}>
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
          {action && onAction && (
            <button
              onClick={onAction}
              className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${styles.icon} hover:underline`}
            >
              {action}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
