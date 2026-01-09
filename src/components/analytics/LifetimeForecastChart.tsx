import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle, Lightbulb, Trophy, Crown, Lock } from 'lucide-react';
import { LifetimeForecast } from '@/hooks/useAdvancedAnalytics';

interface LifetimeForecastChartProps {
  forecast: LifetimeForecast | null;
  loading: boolean;
  isPremium: boolean;
  onGenerate: () => void;
  onUpgrade: () => void;
}

const LifetimeForecastChart: React.FC<LifetimeForecastChartProps> = ({
  forecast,
  loading,
  isPremium,
  onGenerate,
  onUpgrade
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'declining':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Lifetime Trend Forecasts</h3>
            <p className="text-sm text-amber-600 dark:text-amber-400">Premium Feature</p>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
          <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unlock AI-powered predictions of your habit journey, including 30-day, 90-day, and yearly forecasts.
          </p>
          <button
            onClick={onUpgrade}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Upgrade to Premium - $4.99/mo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Lifetime Trend Forecasts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered predictions</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : forecast ? 'Refresh' : 'Generate Forecast'}
        </button>
      </div>

      {forecast ? (
        <div className="space-y-6">
          {/* Forecast Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">30 Days</span>
                {getTrendIcon(forecast.thirtyDayForecast.trend)}
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {forecast.thirtyDayForecast.predictedRate}%
              </div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${getTrendColor(forecast.thirtyDayForecast.trend)}`}>
                {forecast.thirtyDayForecast.confidence}% confidence
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">90 Days</span>
                {getTrendIcon(forecast.ninetyDayForecast.trend)}
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {forecast.ninetyDayForecast.predictedRate}%
              </div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${getTrendColor(forecast.ninetyDayForecast.trend)}`}>
                {forecast.ninetyDayForecast.confidence}% confidence
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">1 Year</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {forecast.yearForecast.predictedRate}%
              </div>
              <div className="text-xs px-2 py-1 rounded-full inline-block mt-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                {forecast.yearForecast.confidence}% confidence
              </div>
            </div>
          </div>

          {/* Mastery Timeline */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">Habit Mastery Timeline</h4>
            <div className="flex items-center justify-between">
              {Object.entries(forecast.habitMasteryTimeline).map(([level, time], index) => (
                <div key={level} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    time === 'achieved' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {time === 'achieved' ? '✓' : index + 1}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{level}</span>
                  <span className="text-xs text-gray-500">{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk & Opportunities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-gray-800 dark:text-white">Risk Factors</span>
              </div>
              <ul className="space-y-2">
                {forecast.riskFactors.map((risk, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-800 dark:text-white">Growth Opportunities</span>
              </div>
              <ul className="space-y-2">
                {forecast.growthOpportunities.map((opp, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">Year Milestones</h4>
            <div className="flex flex-wrap gap-2">
              {forecast.yearForecast.milestones.map((milestone, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                >
                  {milestone}
                </span>
              ))}
            </div>
          </div>

          {/* Streak Potential */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Projected Streak Potential</span>
              <div className="text-2xl font-bold text-amber-600">{Math.round(forecast.projectedStreakPotential)} days</div>
            </div>
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Click "Generate Forecast" to see AI predictions of your habit journey
          </p>
        </div>
      )}
    </div>
  );
};

export default LifetimeForecastChart;
