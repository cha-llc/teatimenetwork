import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { CategoryStats } from '@/hooks/useAnalytics';

interface CategoryBreakdownChartProps {
  categoryStats: CategoryStats[];
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ categoryStats }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'habits' | 'completions'>('habits');

  const data = categoryStats.map(cat => ({
    name: cat.category,
    value: viewMode === 'habits' ? cat.habitCount : cat.completions,
    color: cat.color,
    rate: cat.rate,
    habitCount: cat.habitCount,
    completions: cat.completions
  }));

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#374151" className="text-lg font-semibold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#6b7280" className="text-sm">
          {(percent * 100).toFixed(0)}%
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-gray-800">{data.name}</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              Habits: <span className="font-medium">{data.habitCount}</span>
            </p>
            <p className="text-gray-600">
              Completions: <span className="font-medium">{data.completions}</span>
            </p>
            <p className="text-gray-600">
              Completion Rate: <span className="font-medium text-[#7C9885]">{data.rate}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={index}
            className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No category data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Category Breakdown</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution by category</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('habits')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'habits' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Habits
          </button>
          <button
            onClick={() => setViewMode('completions')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'completions' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completions
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Stats Table */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="space-y-3">
          {categoryStats.map((cat, index) => (
            <div 
              key={cat.category}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-gray-700">{cat.category}</span>
                <span className="text-sm text-gray-400">({cat.habitCount} habits)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${cat.rate}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {cat.rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;
