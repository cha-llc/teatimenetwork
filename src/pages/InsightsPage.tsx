import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Target, 
  Flame, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  Zap,
  Calendar,
  Award,
  Lightbulb,
  ArrowUpRight,
  Shield,
  Star,
  MessageSquare,
  Crown,
  Dna,
  GitBranch,
  Coffee,
  Activity,
  Battery,
  Heart,
  Map,
  BookOpen,
  Compass,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIInsights, Pattern, Recommendation, StreakPrediction } from '@/hooks/useAIInsights';
import { useAICoach } from '@/hooks/useAICoach';
import { useHabitGenome } from '@/hooks/useHabitGenome';
import { useHabits } from '@/hooks/useHabits';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import Navbar from '@/components/navigation/Navbar';
import InsightCard from '@/components/insights/InsightCard';
import PremiumAIGate from '@/components/ai/PremiumAIGate';
import AICoachChat from '@/components/ai/AICoachChat';
import AIHabitSuggestions from '@/components/ai/AIHabitSuggestions';
import HabitGenomeProfile from '@/components/genome/HabitGenomeProfile';
import LifeOutcomeSimulator from '@/components/genome/LifeOutcomeSimulator';
import WhatIfScenarios from '@/components/genome/WhatIfScenarios';
import HabitBlendsBrewery from '@/components/genome/HabitBlendsBrewery';
import MoodTracker from '@/components/ai/MoodTracker';
import SettingsModal from '@/components/dashboard/SettingsModal';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

type AITab = 'insights' | 'coach' | 'suggestions' | 'motivation' | 'genome' | 'advanced';
type GenomeSubTab = 'profile' | 'outcomes' | 'scenarios' | 'blends';
type AdvancedSubTab = 'mood' | 'energy' | 'simulation' | 'blueprint' | 'recovery';

const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { habits } = useHabits();
  const { 
    insights, 
    loading, 
    error, 
    lastGenerated, 
    generateInsights, 
    hasData 
  } = useAIInsights();
  const {
    isPremium,
    motivation,
    motivationLoading,
    getDailyMotivation
  } = useAICoach();
  const {
    genome,
    lifeOutcomes,
    whatIfScenarios,
    habitBlends,
    genomeLoading,
    outcomesLoading,
    scenariosLoading,
    blendsLoading,
    generateGenome,
    simulateOutcomes,
    generateScenarios,
    generateBlends,
    hasData: hasGenomeData
  } = useHabitGenome();
  
  // Advanced AI features
  const {
    moodEntries,
    saveMoodEntry,
    getRecentMoodEntries,
    energyAnalysis,
    energyLoading,
    analyzeEnergyPatterns,
    simulation,
    simulationLoading,
    runPredictiveSimulation,
    learningPath,
    learningPathLoading,
    generateLearningPath,
    moodSuggestions,
    moodSuggestionsLoading,
    getMoodBasedSuggestions,
    recoveryPlan,
    recoveryLoading,
    generateRecoveryPlan,
    error: advancedError
  } = useAdvancedAI();
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('insights');
  const [genomeSubTab, setGenomeSubTab] = useState<GenomeSubTab>('profile');
  const [advancedSubTab, setAdvancedSubTab] = useState<AdvancedSubTab>('mood');
  const [selectedHabitForSim, setSelectedHabitForSim] = useState<string>('');
  const [selectedScenarioType, setSelectedScenarioType] = useState<string>('miss_tomorrow');

  useEffect(() => {
    if (user && hasData && !insights && !loading && isPremium) {
      generateInsights();
    }
  }, [user, hasData, isPremium]);

  useEffect(() => {
    if (isPremium && activeTab === 'motivation' && !motivation && !motivationLoading) {
      getDailyMotivation();
    }
  }, [activeTab, isPremium, motivation, motivationLoading]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-[#7C9885]';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-[#7C9885] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access AI-powered insights.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'insights' as AITab, label: 'AI Insights', icon: Brain },
    { id: 'advanced' as AITab, label: 'AI Coach Pro', icon: Compass },
    { id: 'genome' as AITab, label: 'Habit Genome', icon: Dna },
    { id: 'coach' as AITab, label: 'Chat', icon: MessageSquare },
    { id: 'suggestions' as AITab, label: 'Suggestions', icon: Lightbulb },
    { id: 'motivation' as AITab, label: 'Motivation', icon: Zap }
  ];

  const genomeSubTabs = [
    { id: 'profile' as GenomeSubTab, label: 'DNA Profile', icon: Dna },
    { id: 'outcomes' as GenomeSubTab, label: 'Life Outcomes', icon: Activity },
    { id: 'scenarios' as GenomeSubTab, label: 'What-If', icon: GitBranch },
    { id: 'blends' as GenomeSubTab, label: 'Habit Blends', icon: Coffee }
  ];

  const advancedSubTabs = [
    { id: 'mood' as AdvancedSubTab, label: 'Mood Tracker', icon: Heart },
    { id: 'energy' as AdvancedSubTab, label: 'Energy Analysis', icon: Battery },
    { id: 'simulation' as AdvancedSubTab, label: 'Predictive Sim', icon: GitBranch },
    { id: 'blueprint' as AdvancedSubTab, label: 'Discipline Blueprint', icon: Map },
    { id: 'recovery' as AdvancedSubTab, label: 'Recovery Plan', icon: RotateCcw }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar 
        onOpenSettings={() => setSettingsOpen(true)} 
        onOpenUpgrade={() => setUpgradeOpen(true)} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Features</h1>
                <p className="text-gray-600 dark:text-gray-400">Powered by advanced AI for personalized guidance</p>
              </div>
            </div>
          </div>
          
          {!isPremium && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Crown className="w-5 h-5" />
              Upgrade for Full Access
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {!isPremium && (
                  <Crown className="w-3 h-3 text-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Premium Gate or Content */}
        {!isPremium ? (
          <PremiumAIGate 
            feature={activeTab === 'coach' ? 'chat' : activeTab === 'suggestions' ? 'suggestions' : activeTab === 'motivation' ? 'motivation' : activeTab === 'genome' ? 'genome' : activeTab === 'advanced' ? 'advanced' : 'insights'} 
            onUpgrade={() => setUpgradeOpen(true)} 
          />
        ) : (
          <>
            {/* Advanced AI Coach Tab - NEW */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Advanced Sub-tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  {advancedSubTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdvancedSubTab(tab.id)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                          advancedSubTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden md:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mood Tracker Sub-tab */}
                {advancedSubTab === 'mood' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MoodTracker
                      onSaveMood={saveMoodEntry}
                      recentEntries={getRecentMoodEntries(7)}
                      onGetSuggestions={getMoodBasedSuggestions}
                      suggestionsLoading={moodSuggestionsLoading}
                    />
                    
                    {/* Mood-Based Suggestions */}
                    {moodSuggestions && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            moodSuggestions.moodAssessment.overallState === 'thriving' ? 'bg-green-100 dark:bg-green-900/30' :
                            moodSuggestions.moodAssessment.overallState === 'good' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            moodSuggestions.moodAssessment.overallState === 'neutral' ? 'bg-gray-100 dark:bg-gray-700' :
                            'bg-amber-100 dark:bg-amber-900/30'
                          }`}>
                            <Heart className={`w-6 h-6 ${
                              moodSuggestions.moodAssessment.overallState === 'thriving' ? 'text-green-600 dark:text-green-400' :
                              moodSuggestions.moodAssessment.overallState === 'good' ? 'text-blue-600 dark:text-blue-400' :
                              moodSuggestions.moodAssessment.overallState === 'neutral' ? 'text-gray-600 dark:text-gray-400' :
                              'text-amber-600 dark:text-amber-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Adaptive Plan</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              State: <span className="capitalize font-medium">{moodSuggestions.moodAssessment.overallState}</span>
                            </p>
                          </div>
                        </div>

                        {/* Prioritized Habits */}
                        {moodSuggestions.prioritizedHabits.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Habit Priorities</h4>
                            <div className="space-y-2">
                              {moodSuggestions.prioritizedHabits.map((habit, idx) => (
                                <div key={idx} className={`p-3 rounded-lg ${
                                  habit.priority === 'must-do' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                                  habit.priority === 'if-possible' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' :
                                  'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">{habit.habitName}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      habit.priority === 'must-do' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                      habit.priority === 'if-possible' ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200' :
                                      'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                    }`}>
                                      {habit.priority}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{habit.adaptedApproach}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Minimum: {habit.minimumViableVersion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mood Boosters */}
                        {moodSuggestions.moodBoosters.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Mood Boosters</h4>
                            <div className="flex flex-wrap gap-2">
                              {moodSuggestions.moodBoosters.map((booster, idx) => (
                                <div key={idx} className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <span className="text-sm text-purple-800 dark:text-purple-300">{booster.activity}</span>
                                  <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">({booster.duration})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Self-Compassion Reminder */}
                        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                          <p className="text-sm text-pink-800 dark:text-pink-300 italic">"{moodSuggestions.selfCompassionReminder}"</p>
                        </div>

                        {/* Affirmation */}
                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Affirmation:</p>
                          <p className="text-purple-700 dark:text-purple-400 font-semibold">"{moodSuggestions.affirmation}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Energy Analysis Sub-tab */}
                {advancedSubTab === 'energy' && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <button
                        onClick={analyzeEnergyPatterns}
                        disabled={energyLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {energyLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Battery className="w-5 h-5" />
                            Analyze Energy Patterns
                          </>
                        )}
                      </button>
                    </div>

                    {energyLoading && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Analyzing your energy patterns...</p>
                      </div>
                    )}

                    {energyAnalysis && !energyLoading && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Energy Profile */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              energyAnalysis.energyProfile.type === 'early_bird' ? 'bg-amber-100 dark:bg-amber-900/30' :
                              energyAnalysis.energyProfile.type === 'night_owl' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                              'bg-green-100 dark:bg-green-900/30'
                            }`}>
                              <Battery className={`w-6 h-6 ${
                                energyAnalysis.energyProfile.type === 'early_bird' ? 'text-amber-600' :
                                energyAnalysis.energyProfile.type === 'night_owl' ? 'text-indigo-600' :
                                'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {energyAnalysis.energyProfile.type.replace('_', ' ')}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Your Energy Type</p>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{energyAnalysis.energyProfile.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Peak Hours</p>
                              <p className="font-medium text-green-800 dark:text-green-300">
                                {energyAnalysis.energyProfile.peakHours.join(', ')}
                              </p>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <p className="text-xs text-red-600 dark:text-red-400 mb-1">Low Energy</p>
                              <p className="font-medium text-red-800 dark:text-red-300">
                                {energyAnalysis.energyProfile.lowEnergyHours.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Habit Time Optimizations */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimal Habit Times</h3>
                          </div>
                          <div className="space-y-3">
                            {energyAnalysis.habitTimeOptimizations.map((opt, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white">{opt.habitName}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    opt.confidence === 'high' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                    opt.confidence === 'medium' ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200' :
                                    'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                  }`}>
                                    {opt.confidence} confidence
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">{opt.currentTime}</span>
                                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600 dark:text-green-400 font-medium">{opt.suggestedTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.reasoning}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Energy Management Tips */}
                        <div className="lg:col-span-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                          <h3 className="text-lg font-semibold mb-4">Energy Management Tips</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {energyAnalysis.energyManagementTips.map((tip, idx) => (
                              <div key={idx} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                <p className="font-medium mb-1">{tip.tip}</p>
                                <p className="text-sm text-white/80">When: {tip.timing}</p>
                                <p className="text-xs text-white/70 mt-1">Impact: {tip.impact}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-4 text-white/90 italic">"{energyAnalysis.personalizedInsight}"</p>
                        </div>
                      </div>
                    )}

                    {!energyAnalysis && !energyLoading && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center border border-amber-200 dark:border-amber-800">
                        <Battery className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Discover Your Energy Patterns</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Log your mood regularly and click "Analyze Energy Patterns" to get personalized time optimization suggestions.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Predictive Simulation Sub-tab */}
                {advancedSubTab === 'simulation' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Run Predictive Simulation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Habit</label>
                          <select
                            value={selectedHabitForSim}
                            onChange={(e) => setSelectedHabitForSim(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                          >
                            <option value="">Choose a habit...</option>
                            {habits.map(h => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scenario Type</label>
                          <select
                            value={selectedScenarioType}
                            onChange={(e) => setSelectedScenarioType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                          >
                            <option value="miss_tomorrow">What if I miss tomorrow?</option>
                            <option value="miss_week">What if I miss a week?</option>
                            <option value="double_down">What if I double my effort?</option>
                            <option value="change_time">What if I change the time?</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => selectedHabitForSim && runPredictiveSimulation(selectedHabitForSim, selectedScenarioType)}
                        disabled={simulationLoading || !selectedHabitForSim}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-5 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {simulationLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Running Simulation...
                          </>
                        ) : (
                          <>
                            <GitBranch className="w-5 h-5" />
                            Run Simulation
                          </>
                        )}
                      </button>
                    </div>

                    {simulation && !simulationLoading && (
                      <div className="space-y-6">
                        {/* Scenario Overview */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <GitBranch className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scenario: {simulation.scenario.type.replace('_', ' ')}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{simulation.scenario.description}</p>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">Probability: {simulation.scenario.probability}</p>
                        </div>

                        {/* Consequences & Recovery */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Immediate Consequences */}
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Immediate Consequences</h4>
                            <div className="space-y-3">
                              {simulation.immediateConsequences.map((c, idx) => (
                                <div key={idx} className={`p-3 rounded-lg ${
                                  c.impact === 'negative' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                                  c.impact === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                                  'bg-gray-50 dark:bg-gray-700/50'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm ${
                                      c.impact === 'negative' ? 'text-red-800 dark:text-red-300' :
                                      c.impact === 'positive' ? 'text-green-800 dark:text-green-300' :
                                      'text-gray-800 dark:text-gray-300'
                                    }`}>{c.description}</span>
                                    <span className="text-xs font-medium">Severity: {c.severity}/10</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Psychological Impact */}
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Psychological Impact</h4>
                            <div className="space-y-4">
                              {Object.entries(simulation.psychologicalImpact).map(([key, value]) => (
                                <div key={key}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{key}</span>
                                    <span className={`text-sm font-medium ${
                                      value.change === 'decrease' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {value.change === 'decrease' ? '-' : '+'}{value.magnitude}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${value.change === 'decrease' ? 'bg-red-500' : 'bg-green-500'}`}
                                      style={{ width: `${value.magnitude * 10}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recovery Path */}
                        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
                          <h4 className="font-semibold mb-4">Recovery Path ({simulation.recoveryPath.difficulty} - {simulation.recoveryPath.estimatedDays} days)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {simulation.recoveryPath.steps.slice(0, 3).map((step, idx) => (
                              <div key={idx} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                <p className="text-sm text-white/70">Day {step.day}</p>
                                <p className="font-medium">{step.action}</p>
                                <p className="text-sm text-white/80 mt-1">Goal: {step.goal}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-white/90 italic">"{simulation.coachingMessage}"</p>
                        </div>

                        {/* Alternative Scenario */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">If You Stay On Track...</h4>
                          <p className="text-green-700 dark:text-green-400 mb-3">{simulation.alternativeScenario.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {simulation.alternativeScenario.benefits.map((b, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm">
                                {b}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 text-green-600 dark:text-green-400 font-medium">
                            Projected Streak: {simulation.alternativeScenario.projectedStreak} days
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Discipline Blueprint Sub-tab */}
                {advancedSubTab === 'blueprint' && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <button
                        onClick={generateLearningPath}
                        disabled={learningPathLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {learningPathLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Creating Blueprint...
                          </>
                        ) : (
                          <>
                            <Map className="w-5 h-5" />
                            Generate Discipline Blueprint
                          </>
                        )}
                      </button>
                    </div>

                    {learningPathLoading && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Creating your personalized discipline blueprint...</p>
                      </div>
                    )}

                    {learningPath && !learningPathLoading && (
                      <div className="space-y-6">
                        {/* Blueprint Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                          <h2 className="text-2xl font-bold mb-2">{learningPath.blueprintName}</h2>
                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="px-4 py-2 bg-white/20 rounded-lg">
                              <p className="text-xs text-white/70">Level</p>
                              <p className="font-medium capitalize">{learningPath.userProfile.disciplineLevel}</p>
                            </div>
                            <div className="px-4 py-2 bg-white/20 rounded-lg">
                              <p className="text-xs text-white/70">Type</p>
                              <p className="font-medium">{learningPath.userProfile.personalityType}</p>
                            </div>
                          </div>
                          <p className="mt-4 text-white/90 text-lg italic">"{learningPath.motivationalMantra}"</p>
                        </div>

                        {/* Phases */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Learning Phases</h3>
                          <div className="space-y-6">
                            {learningPath.phases.map((phase, idx) => (
                              <div key={idx} className="relative pl-8 pb-6 border-l-2 border-emerald-200 dark:border-emerald-800 last:border-0 last:pb-0">
                                <div className="absolute left-0 top-0 w-4 h-4 -ml-2 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800" />
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Phase {phase.phase}: {phase.name}</h4>
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400">{phase.duration}</span>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 mb-3">{phase.focus}</p>
                                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3">
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Psychology Principle</p>
                                    <p className="text-sm text-purple-800 dark:text-purple-300">{phase.psychologyPrinciple}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {phase.dailyActions.map((action, aIdx) => (
                                      <span key={aIdx} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded text-xs">
                                        {action}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Habit Stacking Plan */}
                        {learningPath.habitStackingPlan.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Habit Stacking Plan</h3>
                            <div className="space-y-3">
                              {learningPath.habitStackingPlan.map((stack, idx) => (
                                <div key={idx} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                  <p className="text-amber-800 dark:text-amber-300 font-medium">{stack.implementation}</p>
                                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Cue: {stack.cue}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expected Outcomes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Week 2</p>
                            <p className="text-blue-800 dark:text-blue-300">{learningPath.expectedOutcomes.week2}</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Month 1</p>
                            <p className="text-purple-800 dark:text-purple-300">{learningPath.expectedOutcomes.month1}</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Month 3</p>
                            <p className="text-emerald-800 dark:text-emerald-300">{learningPath.expectedOutcomes.month3}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!learningPath && !learningPathLoading && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 text-center border border-emerald-200 dark:border-emerald-800">
                        <Map className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Your Discipline Blueprint</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Get a personalized learning path with phased goals, habit stacking suggestions, and psychology-backed strategies.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recovery Plan Sub-tab */}
                {advancedSubTab === 'recovery' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Recovery Plan</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Broke a streak? Don't worry - get a personalized recovery plan to get back on track.
                      </p>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Habit to Recover</label>
                        <select
                          value={selectedHabitForSim}
                          onChange={(e) => setSelectedHabitForSim(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                        >
                          <option value="">Choose a habit...</option>
                          {habits.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => selectedHabitForSim && generateRecoveryPlan(selectedHabitForSim)}
                        disabled={recoveryLoading || !selectedHabitForSim}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {recoveryLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Creating Recovery Plan...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-5 h-5" />
                            Generate Recovery Plan
                          </>
                        )}
                      </button>
                    </div>

                    {recoveryPlan && !recoveryLoading && (
                      <div className="space-y-6">
                        {/* Acknowledgment */}
                        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
                          <h3 className="text-xl font-bold mb-2">You've Got This</h3>
                          <p className="text-white/90">{recoveryPlan.acknowledgment}</p>
                        </div>

                        {/* Perspective */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Perspective Shift</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Reframe</p>
                              <p className="text-blue-800 dark:text-blue-300">{recoveryPlan.perspective.reframe}</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Did You Know?</p>
                              <p className="text-purple-800 dark:text-purple-300">{recoveryPlan.perspective.statistic}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Remember</p>
                              <p className="text-green-800 dark:text-green-300">{recoveryPlan.perspective.reminder}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recovery Timeline */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recovery Timeline</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                              <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Day 1</p>
                              <p className="font-medium text-rose-800 dark:text-rose-300 mb-1">{recoveryPlan.recoveryTimeline.day1.focus}</p>
                              <p className="text-sm text-rose-700 dark:text-rose-400">Action: {recoveryPlan.recoveryTimeline.day1.minimumAction}</p>
                              <p className="text-xs text-rose-600 dark:text-rose-500 mt-2 italic">Mindset: {recoveryPlan.recoveryTimeline.day1.mindset}</p>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                              <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Days 2-3</p>
                              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">{recoveryPlan.recoveryTimeline.day2to3.focus}</p>
                              <p className="text-sm text-amber-700 dark:text-amber-400">Milestone: {recoveryPlan.recoveryTimeline.day2to3.milestone}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Week 1</p>
                              <p className="font-medium text-green-800 dark:text-green-300 mb-1">{recoveryPlan.recoveryTimeline.week1.goal}</p>
                              <p className="text-sm text-green-700 dark:text-green-400">Reward: {recoveryPlan.recoveryTimeline.week1.reward}</p>
                            </div>
                          </div>
                        </div>

                        {/* New Streak Goal */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                          <h4 className="font-semibold mb-2">Your New Goal: {recoveryPlan.newStreakGoal.target} Day Streak</h4>
                          <p className="text-white/90 mb-2">{recoveryPlan.newStreakGoal.reasoning}</p>
                          <p className="text-white/80 text-sm">Celebration: {recoveryPlan.newStreakGoal.celebrationPlan}</p>
                        </div>

                        {/* Motivational Message */}
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                          <p className="text-lg text-purple-800 dark:text-purple-300 italic">"{recoveryPlan.motivationalMessage}"</p>
                        </div>
                      </div>
                    )}

                    {!recoveryPlan && !recoveryLoading && (
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center border border-rose-200 dark:border-rose-800">
                        <RotateCcw className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Back on Track</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Select a habit and generate a compassionate, actionable recovery plan to rebuild your streak.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <>
                {/* Generate button */}
                <div className="flex justify-end mb-6">
                  {lastGenerated && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-4 self-center">
                      Last updated: {new Date(lastGenerated).toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={generateInsights}
                    disabled={loading || !hasData}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Insights
                      </>
                    )}
                  </button>
                </div>

                {/* No Data State */}
                {!hasData && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Habits Yet</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Add some habits and start tracking to unlock AI-powered insights and personalized recommendations.
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center gap-2 bg-[#7C9885] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6B8574] transition-colors"
                    >
                      Go to Dashboard
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto w-10 h-10 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Analyzing Your Habits</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        Our AI is examining your patterns, streaks, and completion rates to generate personalized insights...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                {/* Insights Content */}
                {insights && !loading && hasData && (
                  <div className="space-y-8">
                    {/* Overall Score & Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Score Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Habit Health Score</h3>
                        <div className="flex items-center justify-center mb-4">
                          <div className="relative">
                            <svg className="w-32 h-32 transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                className="text-gray-200 dark:text-gray-700"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${(insights.overallScore / 100) * 352} 352`}
                              />
                              <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" style={{ stopColor: insights.overallScore >= 60 ? '#7C9885' : insights.overallScore >= 40 ? '#F59E0B' : '#EF4444' }} />
                                  <stop offset="100%" style={{ stopColor: insights.overallScore >= 60 ? '#9AB4A3' : insights.overallScore >= 40 ? '#F97316' : '#F87171' }} />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-4xl font-bold ${getScoreColor(insights.overallScore)}`}>
                                {insights.overallScore}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            insights.overallScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            insights.overallScore >= 60 ? 'bg-[#7C9885]/20 text-[#7C9885] dark:bg-[#7C9885]/30' :
                            insights.overallScore >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {insights.overallScore >= 80 ? 'Excellent' :
                             insights.overallScore >= 60 ? 'Good' :
                             insights.overallScore >= 40 ? 'Needs Work' : 'Getting Started'}
                          </span>
                        </div>
                      </div>

                      {/* Summary Card */}
                      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Summary</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{insights.summary}</p>
                          </div>
                        </div>

                        {/* Weekly Focus */}
                        {insights.weeklyFocus && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <h4 className="font-semibold text-purple-900 dark:text-purple-300">This Week's Focus</h4>
                            </div>
                            <p className="text-purple-800 dark:text-purple-300 font-medium mb-1">
                              {insights.weeklyFocus.habitToFocus}
                            </p>
                            <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">{insights.weeklyFocus.reason}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-purple-800 dark:text-purple-300">Mini Goal: {insights.weeklyFocus.miniGoal}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Patterns Section */}
                    {insights.patterns && insights.patterns.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Patterns Detected</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {insights.patterns.map((pattern, index) => (
                            <InsightCard
                              key={index}
                              type={pattern.type}
                              icon={pattern.icon}
                              title={pattern.title}
                              description={pattern.description}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optimal Times & Streak Predictions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Optimal Times */}
                      {insights.optimalTimes && insights.optimalTimes.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Optimal Times</h3>
                          </div>
                          <div className="space-y-4">
                            {insights.optimalTimes.map((time, index) => (
                              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900 dark:text-white">{time.habitName}</span>
                                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                                    {time.suggestedTime}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{time.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Streak Predictions */}
                      {insights.streakPredictions && insights.streakPredictions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Streak Predictions</h3>
                          </div>
                          <div className="space-y-4">
                            {insights.streakPredictions.map((prediction, index) => (
                              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900 dark:text-white">{prediction.habitName}</span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.riskLevel)}`}>
                                    {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Risk
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{prediction.prediction}</p>
                                <div className="flex items-start gap-2 text-sm">
                                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-amber-700 dark:text-amber-400">{prediction.preventionTip}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommendations</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {insights.recommendations.map((rec, index) => (
                            <div key={index} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                                  {rec.priority.toUpperCase()}
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{rec.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-[#7C9885]">Expected Impact:</span> {rec.expectedImpact}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Motivational Tips */}
                    {insights.motivationalTips && insights.motivationalTips.length > 0 && (
                      <div className="bg-gradient-to-r from-[#7C9885] to-[#9AB4A3] rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold">Motivational Tips</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {insights.motivationalTips.map((tip, index) => (
                            <div key={index} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                              <p className="font-medium mb-2">"{tip.tip}"</p>
                              <p className="text-sm text-white/80">{tip.context}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Habit Genome Tab */}
            {activeTab === 'genome' && (
              <div className="space-y-6">
                {/* Genome Sub-tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  {genomeSubTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGenomeSubTab(tab.id)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                          genomeSubTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* No Data State */}
                {!hasGenomeData && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6">
                      <Dna className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Discover Your Habit Genome</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Add habits and track them to unlock your unique behavioral DNA profile and life outcome simulations.
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      Go to Dashboard
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {hasGenomeData && (
                  <>
                    {/* DNA Profile Sub-tab */}
                    {genomeSubTab === 'profile' && (
                      <div>
                        <div className="flex justify-end mb-6">
                          <button
                            onClick={generateGenome}
                            disabled={genomeLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {genomeLoading ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Mapping Genome...
                              </>
                            ) : (
                              <>
                                <Dna className="w-5 h-5" />
                                {genome ? 'Regenerate Genome' : 'Map My Genome'}
                              </>
                            )}
                          </button>
                        </div>

                        {genomeLoading && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
                                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                                <Dna className="absolute inset-0 m-auto w-10 h-10 text-purple-500" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Mapping Your Habit Genome</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Our AI is analyzing your behavioral patterns to create your unique habit DNA profile...
                              </p>
                            </div>
                          </div>
                        )}

                        {genome && !genomeLoading && (
                          <HabitGenomeProfile genome={genome} />
                        )}

                        {!genome && !genomeLoading && (
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center border border-purple-200 dark:border-purple-800">
                            <Dna className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Habit Genome Awaits</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Click "Map My Genome" to discover your unique behavioral DNA profile.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Life Outcomes Sub-tab */}
                    {genomeSubTab === 'outcomes' && (
                      <div>
                        <div className="flex justify-end mb-6">
                          <button
                            onClick={simulateOutcomes}
                            disabled={outcomesLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {outcomesLoading ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Simulating...
                              </>
                            ) : (
                              <>
                                <Activity className="w-5 h-5" />
                                {lifeOutcomes ? 'Re-simulate' : 'Simulate Life Outcomes'}
                              </>
                            )}
                          </button>
                        </div>

                        {outcomesLoading && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-emerald-200 dark:border-emerald-900"></div>
                                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                                <Activity className="absolute inset-0 m-auto w-10 h-10 text-emerald-500" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Simulating Life Outcomes</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Running predictive models based on your habit patterns...
                              </p>
                            </div>
                          </div>
                        )}

                        {lifeOutcomes && !outcomesLoading && (
                          <LifeOutcomeSimulator outcomes={lifeOutcomes} />
                        )}

                        {!lifeOutcomes && !outcomesLoading && (
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 text-center border border-emerald-200 dark:border-emerald-800">
                            <Activity className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Predict Your Future</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              See how your habits could impact your lifespan, career, and mental wellness.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* What-If Scenarios Sub-tab */}
                    {genomeSubTab === 'scenarios' && (
                      <div>
                        <div className="flex justify-end mb-6">
                          <button
                            onClick={() => generateScenarios('general')}
                            disabled={scenariosLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {scenariosLoading ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <GitBranch className="w-5 h-5" />
                                {whatIfScenarios ? 'Regenerate Scenarios' : 'Generate What-If Scenarios'}
                              </>
                            )}
                          </button>
                        </div>

                        {scenariosLoading && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-violet-200 dark:border-violet-900"></div>
                                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
                                <GitBranch className="absolute inset-0 m-auto w-10 h-10 text-violet-500" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Generating Branching Scenarios</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Creating alternative paths based on different habit choices...
                              </p>
                            </div>
                          </div>
                        )}

                        {whatIfScenarios && !scenariosLoading && (
                          <WhatIfScenarios scenarios={whatIfScenarios} />
                        )}

                        {!whatIfScenarios && !scenariosLoading && (
                          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center border border-violet-200 dark:border-violet-800">
                            <GitBranch className="w-16 h-16 text-violet-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Explore Alternative Paths</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              See how different habit choices could change your life trajectory.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Habit Blends Sub-tab */}
                    {genomeSubTab === 'blends' && (
                      <div>
                        <div className="flex justify-end mb-6">
                          <button
                            onClick={() => generateBlends('general')}
                            disabled={blendsLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {blendsLoading ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Brewing...
                              </>
                            ) : (
                              <>
                                <Coffee className="w-5 h-5" />
                                {habitBlends ? 'Brew New Blends' : 'Brew Habit Blends'}
                              </>
                            )}
                          </button>
                        </div>

                        {blendsLoading && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-amber-200 dark:border-amber-900"></div>
                                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                                <Coffee className="absolute inset-0 m-auto w-10 h-10 text-amber-500" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Brewing Custom Blends</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Creating personalized habit combinations for optimal results...
                              </p>
                            </div>
                          </div>
                        )}

                        {habitBlends && !blendsLoading && (
                          <HabitBlendsBrewery blends={habitBlends} />
                        )}

                        {!habitBlends && !blendsLoading && (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center border border-amber-200 dark:border-amber-800">
                            <Coffee className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Brew Your Perfect Blend</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Discover AI-crafted habit combinations designed for your unique genome.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* AI Coach Tab */}
            {activeTab === 'coach' && (
              <AICoachChat />
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <AIHabitSuggestions />
              </div>
            )}

            {/* Motivation Tab */}
            {activeTab === 'motivation' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={getDailyMotivation}
                    disabled={motivationLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${motivationLoading ? 'animate-spin' : ''}`} />
                    Refresh Motivation
                  </button>
                </div>

                {motivationLoading && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Generating your personalized motivation...</p>
                  </div>
                )}

                {motivation && !motivationLoading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main greeting */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
                      <h2 className="text-2xl font-bold mb-2">{motivation.greeting}</h2>
                      <p className="text-lg text-white/90">{motivation.mainMessage}</p>
                    </div>

                    {/* Daily Challenge */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Today's Challenge</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{motivation.dailyChallenge}</p>
                    </div>

                    {/* Affirmation */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                          <Star className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Daily Affirmation</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 italic">"{motivation.affirmation}"</p>
                    </div>

                    {/* Fun Fact */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Did You Know?</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{motivation.funFact}</p>
                    </div>

                    {/* Focus Tip */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Focus Tip</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{motivation.focusTip}</p>
                    </div>

                    {/* Celebration Note */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-[#7C9885] to-[#9AB4A3] rounded-2xl p-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="w-6 h-6" />
                        <h3 className="font-semibold">Celebration</h3>
                      </div>
                      <p className="text-white/90">{motivation.celebrationNote}</p>
                    </div>
                  </div>
                )}

                {!motivation && !motivationLoading && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Your Daily Motivation</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Click the button above to generate personalized motivation for today!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};

export default InsightsPage;
