import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { DailyStats, WeeklyStats, MonthlyStats } from '@/hooks/useAnalytics';

interface CompletionTrendsChartProps {
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  view: 'daily' | 'weekly' | 'monthly';
}

const CompletionTrendsChart: React.FC<CompletionTrendsChartProps> = ({
  dailyStats,
  weeklyStats,
  monthlyStats,
  view
}) => {
  const getData = () => {
    switch (view) {
      case 'daily':
        return dailyStats.map(d => ({
          name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate: d.rate,
          completions: d.completions
        }));
      case 'weekly':
        return weeklyStats.map(w => ({
          name: w.week,
          rate: w.rate,
          completions: w.completions
        }));
      case 'monthly':
        return monthlyStats.map(m => ({
          name: `${m.month} ${m.year}`,
          rate: m.rate,
          completions: m.completions
        }));
      default:
        return [];
    }
  };

  const data = getData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-[#7C9885]">
            Completion Rate: <span className="font-semibold">{payload[0].value}%</span>
          </p>
          <p className="text-gray-500 text-sm">
            {payload[1]?.value} habits completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Completion Trends</h3>
        <p className="text-sm text-gray-500 mt-1">
          {view === 'daily' && 'Daily completion rates over time'}
          {view === 'weekly' && 'Weekly average completion rates'}
          {view === 'monthly' && 'Monthly average completion rates'}
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C9885" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C9885" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval={view === 'daily' ? Math.floor(data.length / 7) : 0}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#7C9885"
              strokeWidth={2}
              fill="url(#colorRate)"
              dot={view !== 'daily'}
              activeDot={{ r: 6, fill: '#7C9885', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="completions"
              stroke="#F4A460"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              opacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#7C9885]" />
          <span className="text-gray-600">Completion Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#F4A460]" style={{ width: '12px' }} />
          <span className="text-gray-600">Habits Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CompletionTrendsChart;
