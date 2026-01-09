import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HabitPerformance } from '@/hooks/useAnalytics';
import { Flame, Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface BestHabitsChartProps {
  habitPerformance: HabitPerformance[];
}

const BestHabitsChart: React.FC<BestHabitsChartProps> = ({ habitPerformance }) => {
  const [sortBy, setSortBy] = useState<'rate' | 'streak'>('rate');

  const sortedHabits = [...habitPerformance].sort((a, b) => {
    if (sortBy === 'rate') {
      return b.rate - a.rate;
    }
    return b.currentStreak - a.currentStreak;
  });

  const chartData = sortedHabits.slice(0, 8).map(hp => ({
    name: hp.habit.name.length > 15 ? hp.habit.name.slice(0, 15) + '...' : hp.habit.name,
    fullName: hp.habit.name,
    rate: hp.rate,
    streak: hp.currentStreak,
    longestStreak: hp.longestStreak,
    color: hp.habit.color || '#7C9885',
    category: hp.habit.category
  }));

  const getBarColor = (rate: number) => {
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#7C9885';
    if (rate >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800 mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              Category: <span className="font-medium">{data.category}</span>
            </p>
            <p className="text-gray-600">
              Completion Rate: <span className="font-medium text-[#7C9885]">{data.rate}%</span>
            </p>
            <p className="text-gray-600">
              Current Streak: <span className="font-medium text-orange-500">{data.streak} days</span>
            </p>
            <p className="text-gray-600">
              Longest Streak: <span className="font-medium">{data.longestStreak} days</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (habitPerformance.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Habit Performance</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No habit data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Habit Performance</h3>
          <p className="text-sm text-gray-500 mt-1">Your habits ranked by performance</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSortBy('rate')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              sortBy === 'rate' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Rate
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              sortBy === 'streak' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Streak
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 152, 133, 0.1)' }} />
            <Bar 
              dataKey="rate" 
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="space-y-3">
          {sortedHabits.map((hp, index) => (
            <div 
              key={hp.habit.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-600' :
                  index === 1 ? 'bg-gray-200 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{hp.habit.name}</p>
                  <p className="text-xs text-gray-500">{hp.habit.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {hp.rate >= 50 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-semibold ${
                      hp.rate >= 80 ? 'text-green-600' :
                      hp.rate >= 60 ? 'text-[#7C9885]' :
                      hp.rate >= 40 ? 'text-amber-600' :
                      'text-red-500'
                    }`}>
                      {hp.rate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">completion</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-600">{hp.currentStreak}</span>
                  </div>
                  <p className="text-xs text-gray-400">streak</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BestHabitsChart;
