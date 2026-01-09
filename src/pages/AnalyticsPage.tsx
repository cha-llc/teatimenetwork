import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, FileText, FileJson, Printer, 
  Calendar, TrendingUp, BarChart3, 
  Crown, Loader2, Lock, ChevronDown,
  Leaf, Brain, Coins, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import Navbar from '@/components/navigation/Navbar';
import CompletionTrendsChart from '@/components/analytics/CompletionTrendsChart';
import CategoryBreakdownChart from '@/components/analytics/CategoryBreakdownChart';
import BestHabitsChart from '@/components/analytics/BestHabitsChart';
import InsightsCard from '@/components/analytics/InsightsCard';
import AIAnalyticsSummary from '@/components/analytics/AIAnalyticsSummary';
import LifetimeForecastChart from '@/components/analytics/LifetimeForecastChart';
import SettingsModal from '@/components/dashboard/SettingsModal';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import SEOHead, { SEO_CONFIG, generatePageStructuredData } from '@/components/seo/SEOHead';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type TimeRange = '7' | '30' | '90' | '180' | '365';
type ChartView = 'daily' | 'weekly' | 'monthly';
type AnalyticsTab = 'overview' | 'ai' | 'eco' | 'tokens';

const AnalyticsPage: React.FC = () => {

  const { user, profile } = useAuth();
  const { habits, completions, streaks, loading: habitsLoading } = useHabits();
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [chartView, setChartView] = useState<ChartView>('daily');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    analytics, 
    loading: analyticsLoading,
    fetchExtendedCompletions,
    exportToCSV, 
    exportToJSON, 
    generatePDFReport 
  } = useAnalytics(habits, completions, streaks, parseInt(timeRange));

  const {
    loading: advancedLoading,
    aiSummary,
    forecast,
    ecoHabits,
    tokens,
    tokenTransactions,
    totalCarbonSaved,
    isPremium,
    generateAISummary,
    generateForecast,
    fetchEcoHabits,
    fetchTokens
  } = useAdvancedAnalytics();

  // Fetch extended data when time range changes
  useEffect(() => {
    if (user && parseInt(timeRange) > 30) {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(timeRange) * 86400000).toISOString().split('T')[0];
      fetchExtendedCompletions(startDate, endDate);
    }
  }, [timeRange, user, fetchExtendedCompletions]);

  // Fetch eco habits and tokens
  useEffect(() => {
    if (user) {
      fetchEcoHabits();
      fetchTokens();
    }
  }, [user, fetchEcoHabits, fetchTokens]);

  const loading = habitsLoading || analyticsLoading;

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days', premium: false },
    { value: '30', label: 'Last 30 days', premium: false },
    { value: '90', label: 'Last 90 days', premium: true },
    { value: '180', label: 'Last 6 months', premium: true },
    { value: '365', label: 'Last year', premium: true },
  ];

  const handleTimeRangeChange = (value: TimeRange) => {
    const option = timeRangeOptions.find(o => o.value === value);
    if (option?.premium && !isPremium) {
      setShowUpgrade(true);
      return;
    }
    setTimeRange(value);
  };

  const handleExport = (type: 'csv' | 'json' | 'pdf') => {
    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }
    
    switch (type) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'pdf':
        generatePDFReport();
        break;
    }
  };

  const handleGenerateAISummary = () => {
    generateAISummary({
      totalCompletions: analytics.overallStats.totalCompletions,
      averageRate: analytics.overallStats.averageRate,
      currentStreak: analytics.overallStats.currentOverallStreak,
      longestStreak: analytics.overallStats.longestOverallStreak,
      mostConsistentHabit: analytics.overallStats.mostConsistentHabit,
      leastConsistentHabit: analytics.overallStats.leastConsistentHabit,
      categoryStats: analytics.categoryStats,
      weeklyTrend: analytics.weeklyStats.length >= 2 
        ? analytics.weeklyStats[analytics.weeklyStats.length - 1].rate > analytics.weeklyStats[analytics.weeklyStats.length - 2].rate 
          ? 'improving' : 'declining'
        : 'stable'
    }, parseInt(timeRange));
  };

  const handleGenerateForecast = () => {
    generateForecast({
      averageRate: analytics.overallStats.averageRate,
      currentStreak: analytics.overallStats.currentOverallStreak,
      longestStreak: analytics.overallStats.longestOverallStreak,
      categoryStats: analytics.categoryStats,
      habitPerformance: analytics.habitPerformance.map(hp => ({
        name: hp.habit.name,
        rate: hp.rate,
        streak: hp.currentStreak
      })),
      weeklyTrend: analytics.weeklyStats.length >= 2 
        ? analytics.weeklyStats[analytics.weeklyStats.length - 1].rate > analytics.weeklyStats[analytics.weeklyStats.length - 2].rate 
          ? 'improving' : 'declining'
        : 'stable'
    }, parseInt(timeRange));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Sign in Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Please sign in to view your analytics.</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-[#7C9885] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-[#7C9885] animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'eco', label: 'Eco Impact', icon: Leaf },
    { id: 'tokens', label: 'Tokens', icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-x-hidden">
      <SEOHead 
        {...SEO_CONFIG.analytics}
        canonicalUrl="https://teatimenetwork.com/analytics"
        structuredData={generatePageStructuredData('analytics', 'https://teatimenetwork.com/analytics')}
      />
      {/* Navigation */}

      <Navbar 
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
      />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Page Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#7C9885]" />
              Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Track your habit progress and patterns</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Calendar className="w-4 h-4" />
                {timeRangeOptions.find(o => o.value === timeRange)?.label}
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {timeRangeOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleTimeRangeChange(option.value as TimeRange)}
                    className="flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    {option.premium && !isPremium && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-[#7C9885] text-white rounded-lg text-sm font-medium hover:bg-[#6a8573] transition-colors">
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Export as CSV
                  {!isPremium && <Crown className="w-4 h-4 text-amber-500 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')} className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Export as JSON
                  {!isPremium && <Crown className="w-4 h-4 text-amber-500 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print Report
                  {!isPremium && <Crown className="w-4 h-4 text-amber-500 ml-auto" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#7C9885] text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {habits.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Data Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start tracking habits to see your analytics and insights.</p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-[#7C9885] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6a8573] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Chart View Toggle */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#7C9885]" />
                    Performance Overview
                  </h2>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {['daily', 'weekly', 'monthly'].map(view => (
                      <button
                        key={view}
                        onClick={() => setChartView(view as ChartView)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                          chartView === view 
                            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <CompletionTrendsChart
                    dailyStats={analytics.dailyStats}
                    weeklyStats={analytics.weeklyStats}
                    monthlyStats={analytics.monthlyStats}
                    view={chartView}
                  />
                  <CategoryBreakdownChart categoryStats={analytics.categoryStats} />
                </div>

                {/* Habit Performance */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <BestHabitsChart habitPerformance={analytics.habitPerformance} />
                  <InsightsCard 
                    insights={analytics.insights}
                    overallStats={analytics.overallStats}
                  />
                </div>
              </>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <AIAnalyticsSummary
                  summary={aiSummary}
                  loading={advancedLoading}
                  onGenerate={handleGenerateAISummary}
                />
                
                <LifetimeForecastChart
                  forecast={forecast}
                  loading={advancedLoading}
                  isPremium={isPremium || false}
                  onGenerate={handleGenerateForecast}
                  onUpgrade={() => setShowUpgrade(true)}
                />
              </div>
            )}

            {/* Eco Impact Tab */}
            {activeTab === 'eco' && (
              <div className="space-y-6">
                {/* Carbon Impact Summary */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your Eco Impact</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Track your sustainable habits</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{totalCarbonSaved.toFixed(1)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">kg CO₂ Saved</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-emerald-600">{(totalCarbonSaved / 21).toFixed(1)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Trees Equivalent</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-teal-600">{ecoHabits.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Eco Habits</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-cyan-600">{Math.round(totalCarbonSaved * 0.5)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Eco Points</div>
                    </div>
                  </div>
                </div>

                {/* Eco Categories */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Eco Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: 'transport', label: 'Transport', icon: '🚲', color: 'bg-blue-100 text-blue-600', impact: '2.5 kg/day' },
                      { id: 'energy', label: 'Energy', icon: '💡', color: 'bg-yellow-100 text-yellow-600', impact: '0.5 kg/day' },
                      { id: 'food', label: 'Food', icon: '🥗', color: 'bg-green-100 text-green-600', impact: '1.8 kg/day' },
                      { id: 'waste', label: 'Waste', icon: '♻️', color: 'bg-emerald-100 text-emerald-600', impact: '0.3 kg/day' },
                      { id: 'water', label: 'Water', icon: '💧', color: 'bg-cyan-100 text-cyan-600', impact: '0.1 kg/day' },
                      { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'bg-purple-100 text-purple-600', impact: '1.2 kg/day' },
                    ].map(cat => (
                      <div key={cat.id} className={`${cat.color} rounded-xl p-4`}>
                        <div className="text-2xl mb-2">{cat.icon}</div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-sm opacity-75">{cat.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carbon Offset CTA */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Offset Your Carbon Footprint</h3>
                      <p className="text-green-100 mb-4">Donate to verified carbon offset projects and earn bonus tokens!</p>
                      <button className="px-6 py-2.5 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors">
                        Donate Now
                      </button>
                    </div>
                    <div className="text-6xl opacity-50">🌍</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tokens Tab */}
            {activeTab === 'tokens' && (
              <div className="space-y-6">
                {/* Token Balance */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Habit Tokens</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Community reward system</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-amber-600">{tokens?.balance?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">HBT Balance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-xl font-bold text-green-600">+{tokens?.total_earned?.toFixed(0) || '0'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Earned</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-xl font-bold text-red-600">-{tokens?.total_spent?.toFixed(0) || '0'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Spent</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-xl font-bold text-purple-600">{tokenTransactions.filter(t => t.transaction_type === 'vote').length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Votes Cast</div>
                    </div>
                  </div>
                </div>

                {/* How to Earn */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">How to Earn Tokens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { action: 'Complete a habit', tokens: '+1 HBT', icon: '✓' },
                      { action: 'Maintain 7-day streak', tokens: '+10 HBT', icon: '🔥' },
                      { action: 'Complete mindfulness session', tokens: '+5 HBT', icon: '🧘' },
                      { action: 'Win a challenge', tokens: '+50 HBT', icon: '🏆' },
                      { action: 'Refer a friend', tokens: '+100 HBT', icon: '👥' },
                      { action: 'Carbon offset donation', tokens: '+20 HBT per $1', icon: '🌍' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.action}</span>
                        </div>
                        <span className="text-sm font-medium text-amber-600">{item.tokens}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h3>
                  {tokenTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {tokenTransactions.slice(0, 10).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">{tx.description}</div>
                            <div className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                          </div>
                          <span className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} HBT
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions yet. Start earning tokens!</p>
                    </div>
                  )}
                </div>

                {/* Community Voting */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Community Voting</h3>
                  </div>
                  <p className="text-purple-100 mb-4">
                    Use your tokens to vote on new features, community challenges, and reward distributions. 
                    Your voice matters in shaping the future of our habit community!
                  </p>
                  <button className="px-6 py-2.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                    View Active Votes
                  </button>
                </div>
              </div>
            )}

            {/* Premium Upsell for Free Users */}
            {!isPremium && activeTab === 'overview' && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Unlock Advanced Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Upgrade to Premium for extended time ranges (up to 1 year), exportable reports, 
                      AI-narrated summaries, lifetime trend forecasts, and more!
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowUpgrade(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                      >
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium - $4.99/mo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
};

export default AnalyticsPage;
