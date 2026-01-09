import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, Target } from 'lucide-react';

interface Session {
  id: string;
  started_at: string;
  brain_states: { focus: number; calm: number }[];
  habit_id?: string;
  completion_boost?: number;
}

interface Habit {
  id: string;
  name: string;
  completed_today: boolean;
  streak: number;
}

interface CorrelationChartProps {
  sessions: Session[];
  habits: Habit[];
}

export function CorrelationChart({ sessions, habits }: CorrelationChartProps) {
  // Calculate correlation data
  const correlationData = React.useMemo(() => {
    // Group sessions by focus/calm ranges and calculate completion rates
    const ranges = [
      { min: 0, max: 25, label: '0-25' },
      { min: 25, max: 50, label: '25-50' },
      { min: 50, max: 75, label: '50-75' },
      { min: 75, max: 100, label: '75-100' },
    ];

    const focusCorrelation = ranges.map(range => {
      const sessionsInRange = sessions.filter(s => {
        const avgFocus = s.brain_states?.length > 0
          ? s.brain_states.reduce((a, b) => a + b.focus, 0) / s.brain_states.length
          : 0;
        return avgFocus >= range.min && avgFocus < range.max;
      });
      
      const completedSessions = sessionsInRange.filter(s => (s.completion_boost || 0) > 0);
      const completionRate = sessionsInRange.length > 0 
        ? (completedSessions.length / sessionsInRange.length) * 100 
        : 0;

      return {
        range: range.label,
        sessions: sessionsInRange.length,
        completionRate,
      };
    });

    const calmCorrelation = ranges.map(range => {
      const sessionsInRange = sessions.filter(s => {
        const avgCalm = s.brain_states?.length > 0
          ? s.brain_states.reduce((a, b) => a + b.calm, 0) / s.brain_states.length
          : 0;
        return avgCalm >= range.min && avgCalm < range.max;
      });
      
      const completedSessions = sessionsInRange.filter(s => (s.completion_boost || 0) > 0);
      const completionRate = sessionsInRange.length > 0 
        ? (completedSessions.length / sessionsInRange.length) * 100 
        : 0;

      return {
        range: range.label,
        sessions: sessionsInRange.length,
        completionRate,
      };
    });

    // Calculate overall correlation coefficient (simplified)
    const focusValues = sessions.map(s => 
      s.brain_states?.length > 0 
        ? s.brain_states.reduce((a, b) => a + b.focus, 0) / s.brain_states.length 
        : 0
    );
    const completionValues = sessions.map(s => s.completion_boost || 0 > 0 ? 100 : 0);
    
    const avgFocus = focusValues.reduce((a, b) => a + b, 0) / focusValues.length || 0;
    const avgCompletion = completionValues.reduce((a, b) => a + b, 0) / completionValues.length || 0;
    
    let numerator = 0;
    let denomFocus = 0;
    let denomCompletion = 0;
    
    for (let i = 0; i < focusValues.length; i++) {
      const focusDiff = focusValues[i] - avgFocus;
      const completionDiff = completionValues[i] - avgCompletion;
      numerator += focusDiff * completionDiff;
      denomFocus += focusDiff * focusDiff;
      denomCompletion += completionDiff * completionDiff;
    }
    
    const correlation = denomFocus > 0 && denomCompletion > 0
      ? numerator / Math.sqrt(denomFocus * denomCompletion)
      : 0;

    return {
      focusCorrelation,
      calmCorrelation,
      overallCorrelation: Math.round(correlation * 100) / 100,
    };
  }, [sessions]);

  const getCorrelationColor = (value: number) => {
    if (value > 0.5) return 'text-green-400';
    if (value > 0.2) return 'text-yellow-400';
    if (value > -0.2) return 'text-gray-400';
    return 'text-red-400';
  };

  const getCorrelationLabel = (value: number) => {
    if (value > 0.7) return 'Strong Positive';
    if (value > 0.4) return 'Moderate Positive';
    if (value > 0.1) return 'Weak Positive';
    if (value > -0.1) return 'No Correlation';
    if (value > -0.4) return 'Weak Negative';
    return 'Strong Negative';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Focus-Completion Correlation
          </span>
          <Badge className={`${correlationData.overallCorrelation > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            r = {correlationData.overallCorrelation.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Complete more sessions to see correlation data</p>
          </div>
        ) : (
          <>
            {/* Correlation Summary */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Correlation Strength</h4>
                  <p className={`text-lg font-bold ${getCorrelationColor(correlationData.overallCorrelation)}`}>
                    {getCorrelationLabel(correlationData.overallCorrelation)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Based on {sessions.length} sessions</p>
                  <p className="text-sm text-gray-400">
                    Higher focus = {correlationData.overallCorrelation > 0 ? 'Better' : 'Lower'} completion
                  </p>
                </div>
              </div>
            </div>

            {/* Focus Correlation Bars */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Focus Score vs Completion Rate
              </h4>
              <div className="space-y-3">
                {correlationData.focusCorrelation.map((item, index) => (
                  <div key={item.range} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12">{item.range}</span>
                    <div className="flex-1 h-6 bg-gray-900/50 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.completionRate}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {item.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {item.sessions} sessions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calm Correlation Bars */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                Calm Score vs Completion Rate
              </h4>
              <div className="space-y-3">
                {correlationData.calmCorrelation.map((item, index) => (
                  <div key={item.range} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12">{item.range}</span>
                    <div className="flex-1 h-6 bg-gray-900/50 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.completionRate}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {item.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {item.sessions} sessions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight */}
            <div className="mt-6 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-purple-400">Insight:</span>{' '}
                {correlationData.overallCorrelation > 0.3
                  ? "Your habit completion improves significantly when your focus is higher. Like a well-steeped tea, concentration enhances results."
                  : correlationData.overallCorrelation > 0
                  ? "There's a positive relationship between focus and completion. Keep brewing those focused sessions!"
                  : "Focus and completion show varied patterns. Consider experimenting with different times and blends."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
