import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';

interface BrainState {
  alpha: number;
  beta: number;
  gamma: number;
  theta: number;
  delta: number;
  focus: number;
  calm: number;
  timestamp: number;
}

interface Session {
  id: string;
  started_at: string;
  ended_at?: string;
  brain_states: BrainState[];
}

interface BrainStateTrendsChartProps {
  sessions: Session[];
  timeRange: '7d' | '30d' | '90d';
}

export function BrainStateTrendsChart({ sessions, timeRange }: BrainStateTrendsChartProps) {
  // Process sessions into daily averages
  const dailyData = React.useMemo(() => {
    const days: Record<string, { focus: number[]; calm: number[]; alpha: number[]; beta: number[] }> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.started_at).toISOString().split('T')[0];
      if (!days[date]) {
        days[date] = { focus: [], calm: [], alpha: [], beta: [] };
      }
      
      session.brain_states?.forEach(state => {
        days[date].focus.push(state.focus);
        days[date].calm.push(state.calm);
        days[date].alpha.push(state.alpha);
        days[date].beta.push(state.beta);
      });
    });

    return Object.entries(days)
      .map(([date, values]) => ({
        date,
        focus: values.focus.length > 0 ? values.focus.reduce((a, b) => a + b, 0) / values.focus.length : 0,
        calm: values.calm.length > 0 ? values.calm.reduce((a, b) => a + b, 0) / values.calm.length : 0,
        alpha: values.alpha.length > 0 ? values.alpha.reduce((a, b) => a + b, 0) / values.alpha.length : 0,
        beta: values.beta.length > 0 ? values.beta.reduce((a, b) => a + b, 0) / values.beta.length : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-parseInt(timeRange));
  }, [sessions, timeRange]);

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 'stable';
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  };

  const focusTrend = calculateTrend(dailyData.map(d => d.focus));
  const calmTrend = calculateTrend(dailyData.map(d => d.calm));

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const maxValue = Math.max(
    ...dailyData.flatMap(d => [d.focus, d.calm])
  ) || 100;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Brain State Trends
          </span>
          <div className="flex gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 flex items-center gap-1">
              <TrendIcon trend={focusTrend} />
              Focus
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
              <TrendIcon trend={calmTrend} />
              Calm
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dailyData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No session data available for this period</p>
          </div>
        ) : (
          <>
            {/* Chart Area */}
            <div className="relative h-64 mt-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
              
              {/* Chart */}
              <div className="ml-10 h-full flex items-end gap-1">
                {dailyData.map((day, index) => (
                  <div 
                    key={day.date} 
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    {/* Bars */}
                    <div className="w-full flex gap-0.5 items-end h-full">
                      {/* Focus bar */}
                      <div 
                        className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${(day.focus / maxValue) * 100}%` }}
                      />
                      {/* Calm bar */}
                      <div 
                        className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${(day.calm / maxValue) * 100}%` }}
                      />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                      <div className="font-medium text-white mb-1">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-gray-400">Focus: {day.focus.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-gray-400">Calm: {day.calm.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="ml-10 flex justify-between mt-2 text-xs text-gray-500">
              {dailyData.length > 0 && (
                <>
                  <span>{new Date(dailyData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {dailyData.length > 2 && (
                    <span>{new Date(dailyData[Math.floor(dailyData.length / 2)].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  )}
                  <span>{new Date(dailyData[dailyData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-600 to-purple-400" />
                <span className="text-sm text-gray-400">Focus Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-600 to-blue-400" />
                <span className="text-sm text-gray-400">Calm Score</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
