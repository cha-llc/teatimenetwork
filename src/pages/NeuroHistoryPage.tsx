import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainStateTrendsChart } from '@/components/neuro/BrainStateTrendsChart';
import { CorrelationChart } from '@/components/neuro/CorrelationChart';
import { 
  Brain, 
  History, 
  TrendingUp, 
  Clock, 
  Download, 
  Sparkles,
  Target,
  Music,
  RefreshCw,
  BarChart3,
  Lightbulb,
  Crown,
  Coffee,
  Sun,
  Moon,
  Sunset,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

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
  habit_id?: string;
  completion_boost?: number;
  notes?: string;
}

interface Blend {
  id: string;
  name: string;
  blend_type: string;
  tea_flavor: string;
  play_count: number;
  effectiveness_score?: number;
}

interface Habit {
  id: string;
  name: string;
  category: string;
  completed_today: boolean;
  streak: number;
}

interface AIInsights {
  overallAssessment: string;
  optimalTimes: {
    focus: { hour: number; description: string };
    calm: { hour: number; description: string };
    creativity: { hour: number; description: string };
  };
  habitRecommendations: { habitType: string; optimalTime: string; reason: string }[];
  blendSuggestions: { timeOfDay: string; blendType: string; reason: string }[];
  weeklyGoals: { goal: string; metric: string; target: number }[];
  teaWisdom: string;
  focusTrend: string;
  calmTrend: string;
  correlationInsight: string;
}

export default function NeuroHistoryPage() {
  const { user, isPremium } = useAuth();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [blends, setBlends] = useState<Blend[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [sessionsRes, blendsRes, habitsRes] = await Promise.all([
        supabase
          .from('neuro_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', startDate.toISOString())
          .order('started_at', { ascending: false }),
        supabase
          .from('neuro_tea_blends')
          .select('*')
          .eq('user_id', user.id)
          .order('play_count', { ascending: false }),
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (blendsRes.data) setBlends(blendsRes.data);
      if (habitsRes.data) setHabits(habitsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get AI insights
  const getAIInsights = async () => {
    if (sessions.length === 0) {
      toast.error('Need session data to generate insights');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('neuro-feedback', {
        body: {
          action: 'analyze-session-history',
          data: {
            sessions,
            habits,
            blends
          }
        }
      });

      if (error) throw error;
      if (data?.insights) {
        setAiInsights(data.insights);
        toast.success('AI insights generated!');
      }
    } catch (error) {
      console.error('Error getting insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export report
  const exportReport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('neuro-feedback', {
        body: {
          action: 'generate-analytics-report',
          data: {
            sessions,
            habits,
            blends,
            dateRange: {
              start: new Date(Date.now() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;

      // Create downloadable report
      const reportContent = {
        ...data.report,
        rawData: {
          sessions: sessions.length,
          blends: blends.length,
          habits: habits.length
        },
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuro-feedback-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => {
      if (s.ended_at) {
        const duration = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000;
        return sum + duration;
      }
      return sum;
    }, 0);

    const avgFocus = sessions.reduce((sum, s) => {
      const states = s.brain_states || [];
      const avg = states.length > 0 ? states.reduce((a, b) => a + b.focus, 0) / states.length : 0;
      return sum + avg;
    }, 0) / Math.max(totalSessions, 1);

    const avgCalm = sessions.reduce((sum, s) => {
      const states = s.brain_states || [];
      const avg = states.length > 0 ? states.reduce((a, b) => a + b.calm, 0) / states.length : 0;
      return sum + avg;
    }, 0) / Math.max(totalSessions, 1);

    // Find best blend
    const bestBlend = blends.reduce((best, b) => {
      if (!best || (b.effectiveness_score || 0) > (best.effectiveness_score || 0)) {
        return b;
      }
      return best;
    }, null as Blend | null);

    return {
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      avgFocus: Math.round(avgFocus),
      avgCalm: Math.round(avgCalm),
      bestBlend
    };
  }, [sessions, blends]);

  // Get time of day icon
  const getTimeIcon = (hour: number) => {
    if (hour >= 5 && hour < 12) return <Sun className="w-4 h-4 text-yellow-500" />;
    if (hour >= 12 && hour < 17) return <Coffee className="w-4 h-4 text-orange-500" />;
    if (hour >= 17 && hour < 21) return <Sunset className="w-4 h-4 text-pink-500" />;
    return <Moon className="w-4 h-4 text-blue-500" />;
  };

  // Premium gate
  if (!isPremium) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <History className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Session History & Analytics</h1>
          <p className="text-muted-foreground mb-8">
            Unlock detailed neuro-feedback analytics, brain state trends, and AI-powered insights.
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Session History"
      description="Detailed analytics & AI-powered insights"
      icon={<History className="w-5 h-5" />}
      action={
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-purple-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <Button
            onClick={exportReport}
            variant="outline"
            disabled={isExporting || sessions.length === 0}
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMinutes}</p>
                <p className="text-xs text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgFocus}%</p>
                <p className="text-xs text-muted-foreground">Avg Focus</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                <Activity className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCalm}%</p>
                <p className="text-xs text-muted-foreground">Avg Calm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="blends">
            <Music className="w-4 h-4 mr-2" />
            Best Blends
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Session Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrainStateTrendsChart sessions={sessions} timeRange={timeRange} />
            <CorrelationChart sessions={sessions} habits={habits} />
          </div>

          {/* Hourly Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Hourly Brain State Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Complete sessions to see hourly patterns</p>
                </div>
              ) : (
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourSessions = sessions.filter(s => 
                      new Date(s.started_at).getHours() === hour
                    );
                    const avgFocus = hourSessions.reduce((sum, s) => {
                      const states = s.brain_states || [];
                      return sum + (states.length > 0 
                        ? states.reduce((a, b) => a + b.focus, 0) / states.length 
                        : 0);
                    }, 0) / Math.max(hourSessions.length, 1);

                    return (
                      <div 
                        key={hour}
                        className="flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group relative"
                      >
                        <span className="text-xs text-muted-foreground mb-1">
                          {hour.toString().padStart(2, '0')}
                        </span>
                        <div 
                          className="w-full h-12 rounded bg-gradient-to-t from-purple-600/50 to-purple-400/50"
                          style={{ 
                            opacity: hourSessions.length > 0 ? 0.3 + (avgFocus / 100) * 0.7 : 0.1 
                          }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {hourSessions.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {!aiInsights ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate AI Insights</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our AI will analyze your session history to provide personalized recommendations 
                  for optimal habit times, blend suggestions, and weekly goals.
                </p>
                <Button
                  onClick={getAIInsights}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  disabled={isAnalyzing || sessions.length === 0}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Insights
                    </>
                  )}
                </Button>
                {sessions.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-4">
                    Complete some neuro-feedback sessions first to generate insights
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overall Assessment */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Overall Assessment</h3>
                      <p className="text-muted-foreground">{aiInsights.overallAssessment}</p>
                      <div className="flex gap-4 mt-4">
                        <Badge className={`${aiInsights.focusTrend === 'improving' ? 'bg-green-100 text-green-700' : aiInsights.focusTrend === 'declining' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          Focus: {aiInsights.focusTrend}
                        </Badge>
                        <Badge className={`${aiInsights.calmTrend === 'improving' ? 'bg-green-100 text-green-700' : aiInsights.calmTrend === 'declining' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          Calm: {aiInsights.calmTrend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimal Times */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      Optimal Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getTimeIcon(aiInsights.optimalTimes.focus.hour)}
                        <span className="font-medium">Focus Peak</span>
                        <Badge className="ml-auto bg-purple-100 text-purple-700">
                          {aiInsights.optimalTimes.focus.hour}:00
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{aiInsights.optimalTimes.focus.description}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getTimeIcon(aiInsights.optimalTimes.calm.hour)}
                        <span className="font-medium">Calm Peak</span>
                        <Badge className="ml-auto bg-blue-100 text-blue-700">
                          {aiInsights.optimalTimes.calm.hour}:00
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{aiInsights.optimalTimes.calm.description}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getTimeIcon(aiInsights.optimalTimes.creativity.hour)}
                        <span className="font-medium">Creativity Peak</span>
                        <Badge className="ml-auto bg-pink-100 text-pink-700">
                          {aiInsights.optimalTimes.creativity.hour}:00
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{aiInsights.optimalTimes.creativity.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Blend Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-green-500" />
                      Blend Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiInsights.blendSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          {suggestion.timeOfDay === 'morning' && <Sun className="w-4 h-4 text-yellow-500" />}
                          {suggestion.timeOfDay === 'afternoon' && <Coffee className="w-4 h-4 text-orange-500" />}
                          {suggestion.timeOfDay === 'evening' && <Moon className="w-4 h-4 text-blue-500" />}
                          <span className="font-medium capitalize">{suggestion.timeOfDay}</span>
                          <Badge className="ml-auto bg-green-100 text-green-700 capitalize">
                            {suggestion.blendType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Tea Wisdom */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <p className="text-lg text-amber-800 dark:text-amber-200 italic">"{aiInsights.teaWisdom}"</p>
                </CardContent>
              </Card>

              {/* Regenerate Button */}
              <div className="text-center">
                <Button
                  onClick={getAIInsights}
                  variant="outline"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Regenerate Insights
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Best Blends Tab */}
        <TabsContent value="blends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blends.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No Blends Yet</h3>
                  <p className="text-sm text-muted-foreground">Create Neuro-Tea Blends to see performance data</p>
                </CardContent>
              </Card>
            ) : (
              blends.map((blend, index) => (
                <Card key={blend.id} className={index === 0 ? 'ring-2 ring-yellow-500/50' : ''}>
                  <CardContent className="p-4">
                    {index === 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700 mb-3">
                        <Crown className="w-3 h-3 mr-1" />
                        Top Performer
                      </Badge>
                    )}
                    <h3 className="font-semibold mb-1">{blend.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-100 text-purple-700 capitalize">
                        {blend.blend_type}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 capitalize">
                        {blend.tea_flavor.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-muted-foreground">Play Count</p>
                        <p className="font-medium">{blend.play_count}</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-muted-foreground">Effectiveness</p>
                        <p className="font-medium text-green-600">
                          {blend.effectiveness_score ? `${blend.effectiveness_score}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Session Log Tab */}
        <TabsContent value="history" className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium">No Sessions Yet</h3>
                <p className="text-sm text-muted-foreground">Start a neuro-feedback session to see your history</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => {
              const duration = session.ended_at
                ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
                : 0;
              const avgFocus = session.brain_states?.length > 0
                ? session.brain_states.reduce((a, b) => a + b.focus, 0) / session.brain_states.length
                : 0;
              const avgCalm = session.brain_states?.length > 0
                ? session.brain_states.reduce((a, b) => a + b.calm, 0) / session.brain_states.length
                : 0;

              return (
                <Card key={session.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(session.started_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {duration} min • {session.brain_states?.length || 0} readings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Focus</p>
                          <p className="font-medium text-purple-600">{avgFocus.toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Calm</p>
                          <p className="font-medium text-blue-600">{avgCalm.toFixed(0)}%</p>
                        </div>
                        {session.completion_boost && session.completion_boost > 0 && (
                          <Badge className="bg-green-100 text-green-700">
                            +{session.completion_boost.toFixed(0)}% boost
                          </Badge>
                        )}
                      </div>
                    </div>
                    {session.notes && (
                      <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                        {session.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
