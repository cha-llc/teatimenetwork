import React from 'react';
import { Insight } from '@/hooks/useAnalytics';
import { 
  Trophy, Flame, Crown, Star, AlertTriangle, Lightbulb, 
  TrendingUp, TrendingDown, BarChart3, Sparkles 
} from 'lucide-react';

interface InsightsCardProps {
  insights: Insight[];
  overallStats: {
    totalCompletions: number;
    averageRate: number;
    bestDay: string;
    bestDayRate: number;
    currentOverallStreak: number;
    longestOverallStreak: number;
    mostConsistentHabit: string | null;
    leastConsistentHabit: string | null;
  };
}

const InsightsCard: React.FC<InsightsCardProps> = ({ insights, overallStats }) => {
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'trophy': <Trophy className="w-5 h-5" />,
      'flame': <Flame className="w-5 h-5" />,
      'crown': <Crown className="w-5 h-5" />,
      'star': <Star className="w-5 h-5" />,
      'alert-triangle': <AlertTriangle className="w-5 h-5" />,
      'lightbulb': <Lightbulb className="w-5 h-5" />,
      'trending-up': <TrendingUp className="w-5 h-5" />,
      'trending-down': <TrendingDown className="w-5 h-5" />,
      'bar-chart': <BarChart3 className="w-5 h-5" />,
    };
    return icons[iconName] || <Sparkles className="w-5 h-5" />;
  };

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'bg-green-100 text-green-600',
          title: 'text-green-800',
          desc: 'text-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'bg-amber-100 text-amber-600',
          title: 'text-amber-800',
          desc: 'text-amber-700'
        };
      case 'tip':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          title: 'text-blue-800',
          desc: 'text-blue-700'
        };
      case 'achievement':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'bg-purple-100 text-purple-600',
          title: 'text-purple-800',
          desc: 'text-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'bg-gray-100 text-gray-600',
          title: 'text-gray-800',
          desc: 'text-gray-700'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-[#7C9885]/10 to-[#7C9885]/5 rounded-xl">
            <div className="text-3xl font-bold text-[#7C9885]">{overallStats.totalCompletions}</div>
            <div className="text-sm text-gray-500 mt-1">Total Completions</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">{overallStats.averageRate}%</div>
            <div className="text-sm text-gray-500 mt-1">Avg. Rate</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-600">{overallStats.currentOverallStreak}</div>
            <div className="text-sm text-gray-500 mt-1">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600">{overallStats.longestOverallStreak}</div>
            <div className="text-sm text-gray-500 mt-1">Best Streak</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid md:grid-cols-2 gap-4">
            {overallStats.bestDay && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Best Day</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(overallStats.bestDay)} ({overallStats.bestDayRate}%)
                  </p>
                </div>
              </div>
            )}
            {overallStats.mostConsistentHabit && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-[#7C9885]/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#7C9885]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Most Consistent</p>
                  <p className="font-medium text-gray-800">{overallStats.mostConsistentHabit}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Personalized Insights</h3>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Complete more habits to unlock personalized insights!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const styles = getInsightStyles(insight.type);
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
                      {getIcon(insight.icon)}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${styles.title}`}>{insight.title}</h4>
                      <p className={`text-sm mt-1 ${styles.desc}`}>{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-br from-[#7C9885] to-[#5a7363] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-medium italic">
              "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
            </p>
            <p className="text-sm text-white/70 mt-2">— Aristotle</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
