import React, { useState, useEffect } from 'react';
import { Plus, Crown, Loader2, Eye, Brain, Sparkles, ChevronRight, MessageSquare, Lightbulb, Users, Trophy, Share2, Globe, Swords, Heart, Wifi, Clock, Gift, Check } from 'lucide-react';

import { Link } from 'react-router-dom';


import { useAuth } from '@/contexts/AuthContext';
import { useHabits, Habit } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useAICoach } from '@/hooks/useAICoach';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/navigation/Navbar';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';
import StatsCards from './StatsCards';
import ProgressChart from './ProgressChart';
import CalendarHeatmap from './CalendarHeatmap';
import HabitCalendar from './HabitCalendar';
import StreakRewards from './StreakRewards';
import SettingsModal from './SettingsModal';
import UpgradeModal from './UpgradeModal';
import TrialBanner from './TrialBanner';
import TrialExpiredModal from './TrialExpiredModal';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import SocialShareModal from '@/components/social/SocialShareModal';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user, profile, trialStatus } = useAuth();
  const { habits, completions, streaks, loading, isDemo, createHabit, updateHabit, deleteHabit, toggleCompletion, isCompletedToday, getCompletionRate } = useHabits();
  const { isPremium, motivation, getDailyMotivation, motivationLoading } = useAICoach();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareHabit, setShareHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<'habits' | 'calendar' | 'rewards'>('habits');
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const today = new Date().toISOString().split('T')[0];
  
  // Show trial expired modal when trial expires (only once per session)
  useEffect(() => {
    if (trialStatus.isTrialExpired && !profile?.is_premium && !viewOnlyMode) {
      setShowTrialExpired(true);
    }
  }, [trialStatus.isTrialExpired, profile?.is_premium, viewOnlyMode]);

  // Load daily motivation for premium users
  useEffect(() => {
    if (isPremium && !motivation && !motivationLoading) {
      getDailyMotivation();
    }
  }, [isPremium]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'es' ? 'Buenos días' : 'Good morning';
    if (hour < 18) return language === 'es' ? 'Buenas tardes' : 'Good afternoon';
    return language === 'es' ? 'Buenas noches' : 'Good evening';
  };

  // Determine if user is in view-only mode (trial expired and not premium)
  const isViewOnly = trialStatus.isTrialExpired && !profile?.is_premium && viewOnlyMode;
  const isTrialActive = !trialStatus.isTrialExpired && !profile?.is_premium;

  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    if (trialStatus.isTrialExpired && !profile?.is_premium && !isDemo) {
      setShowTrialExpired(true);
      return;
    }
    
    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
    } else {
      await createHabit(habitData);
    }
    setEditingHabit(null);
  };

  const handleEditHabit = (habit: Habit) => {
    if (trialStatus.isTrialExpired && !profile?.is_premium && !isDemo) {
      setShowTrialExpired(true);
      return;
    }
    setEditingHabit(habit);
    setShowAddModal(true);
  };

  const handleDeleteHabit = async () => {
    if (!deletingHabit) return;
    setIsDeleting(true);
    try {
      await deleteHabit(deletingHabit.id);
      const name = deletingHabit.name;
      setDeletingHabit(null);
      toast({
        title: language === 'es' ? 'Hábito eliminado' : 'Habit deleted',
        description: `"${name}" has been removed.`,
      });
    } catch {
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' ? 'No se pudo eliminar el hábito.' : 'Failed to delete habit.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleCompletion = async (habitId: string, date?: string) => {
    // In demo mode, always allow toggling
    if (isDemo) {
      await toggleCompletion(habitId, date || today);
      return;
    }
    
    if (trialStatus.isTrialExpired && !profile?.is_premium) {
      setShowTrialExpired(true);
      return;
    }
    await toggleCompletion(habitId, date || today);
  };

  const handleCompleteAllToday = async () => {
    const incompleteHabits = habits.filter(habit => !isCompletedToday(habit.id));
    
    for (const habit of incompleteHabits) {
      await handleToggleCompletion(habit.id);
    }
  };

  const handleContinueViewOnly = () => {
    setViewOnlyMode(true);
    setShowTrialExpired(false);
  };

  // Calculate habit limit based on tier
  const tier = profile?.subscription_tier;
  const canAddHabit = !isViewOnly; // Can add habits unless in view-only mode



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-[#7C9885] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-x-hidden">
      {/* Trial Banner - show for non-premium users */}
      {!profile?.is_premium && !isDemo && (
        <TrialBanner
          daysRemaining={trialStatus.daysRemaining}
          isExpired={trialStatus.isTrialExpired}
          onUpgrade={() => setShowUpgrade(true)}
          trialStartDate={profile?.trial_started_at ? new Date(profile.trial_started_at) : null}
        />
      )}

      {/* Demo mode banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 text-center text-sm">
          <span className="font-medium">{language === 'es' ? 'Modo Demo' : 'Demo Mode'}</span>
          <span className="mx-2">-</span>
          <span>{language === 'es' ? 'Inicia sesión para guardar tu progreso' : 'Sign in to save your progress'}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar 
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
        onOpenProfile={() => setShowProfile(true)}
      />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome section with AI motivation for premium */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {isPremium && motivation ? motivation.greeting : `${greeting()}, ${(profile as any)?.display_name || profile?.full_name?.split(' ')[0] || 'there'}!`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          
          {/* Trial status indicator */}
          {isTrialActive && !isDemo && (
            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-sm">
              <Gift className="w-4 h-4" />
              <span>
                {language === 'es' 
                  ? `Prueba gratuita: ${trialStatus.daysRemaining} días restantes`
                  : `Free trial: ${trialStatus.daysRemaining} days remaining`}
              </span>
            </div>
          )}
          
          {/* AI Daily Message for Premium Users */}
          {isPremium && motivation && (
            <div className="mt-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-purple-800 dark:text-purple-300 font-medium text-sm sm:text-base">{motivation.mainMessage}</p>
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 mt-1">
                    <span className="font-medium">{language === 'es' ? 'Desafío de hoy:' : "Today's challenge:"}</span> {motivation.dailyChallenge}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View-only mode notice */}
        {isViewOnly && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300 text-sm sm:text-base">
                  {language === 'es' ? 'Estás en modo de solo lectura' : "You're in view-only mode"}
                </p>
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                  {language === 'es' 
                    ? 'Tu prueba gratuita ha terminado. Actualiza a Premium para continuar rastreando tus hábitos.'
                    : 'Your free trial has ended. Upgrade to Premium to continue tracking your habits.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="bg-gradient-to-r from-[#7C9885] to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {language === 'es' ? 'Actualizar por $4.99/mes' : 'Upgrade for $4.99/mo'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 sm:mb-8">
          <StatsCards habits={habits} completions={completions} streaks={streaks} />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'habits'
                ? 'border-[#7C9885] text-[#7C9885]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {language === 'es' ? 'Hábitos de Hoy' : "Today's Habits"}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[#7C9885] text-[#7C9885]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {language === 'es' ? 'Calendario' : 'Calendar'}
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'rewards'
                ? 'border-[#7C9885] text-[#7C9885]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Trophy className="w-4 h-4" />
            {language === 'es' ? 'Recompensas' : 'Rewards'}
          </button>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8" style={{ display: 'block' }}>
          {/* Main content area */}
          <div className="lg:col-span-2">
            {/* Today's Habits Tab */}
            {activeTab === 'habits' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                    {language === 'es' ? 'Hábitos de Hoy' : "Today's Habits"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Complete All Today Button */}
                    {habits.length > 0 && !isViewOnly && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCompleteAllToday();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                        title={language === 'es' ? 'Completar todos los hábitos de hoy' : 'Complete all habits for today'}
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'es' ? 'Completar Todo' : 'Complete All'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (isViewOnly) {
                          setShowTrialExpired(true);
                        } else if (canAddHabit) {
                          setEditingHabit(null);
                          setShowAddModal(true);
                        } else {
                          setShowUpgrade(true);
                        }
                      }}
                      disabled={isViewOnly}
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isViewOnly
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-[#7C9885] text-white hover:bg-[#6a8573]'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.dashboard.addHabit}</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-800">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#7C9885]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-[#7C9885]" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">{t.dashboard.noHabits}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">{t.dashboard.startTracking}</p>
                    <button
                      onClick={() => {
                        if (isViewOnly) {
                          setShowTrialExpired(true);
                        } else {
                          setShowAddModal(true);
                        }
                      }}
                      disabled={isViewOnly}
                      className={`inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base ${
                        isViewOnly
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-[#7C9885] text-white hover:bg-[#6a8573]'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      {language === 'es' ? 'Crear Tu Primer Hábito' : 'Create Your First Habit'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Progress indicator for today */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {language === 'es' ? 'Progreso de Hoy' : "Today's Progress"}
                        </span>
                        <span className="text-sm font-semibold text-[#7C9885]">
                          {habits.filter(h => isCompletedToday(h.id)).length}/{habits.length} {language === 'es' ? 'completados' : 'completed'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-[#7C9885] to-green-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${habits.length > 0 ? (habits.filter(h => isCompletedToday(h.id)).length / habits.length) * 100 : 0}%` }}
                        />
                      </div>
                      {habits.filter(h => isCompletedToday(h.id)).length === habits.length && habits.length > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {language === 'es' ? '¡Todos los hábitos completados hoy!' : 'All habits completed today!'}
                        </p>
                      )}
                    </div>

                    {habits.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        streak={streaks[habit.id]}
                        isCompleted={isCompletedToday(habit.id)}
                        onToggle={() => handleToggleCompletion(habit.id)}
                        onEdit={() => handleEditHabit(habit)}
                        onDelete={() => {
                          if (trialStatus.isTrialExpired && !profile?.is_premium && !isDemo) {
                            setShowTrialExpired(true);
                            return;
                          }
                          setDeletingHabit(habit);
                        }}
                        disabled={isViewOnly}
                      />
                    ))}

                  </div>
                )}
              </>
            )}


            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <HabitCalendar
                habits={habits}
                completions={completions}
                streaks={streaks}
                onToggleCompletion={handleToggleCompletion}
                disabled={isViewOnly}
              />
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <StreakRewards
                habits={habits}
                streaks={streaks}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Upgrade CTA for trial users */}
            {isTrialActive && trialStatus.daysRemaining <= 10 && !isDemo && (
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 sm:p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {language === 'es' ? 'Prueba Terminando Pronto' : 'Trial Ending Soon'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80">
                      {language === 'es' 
                        ? `${trialStatus.daysRemaining} días restantes`
                        : `${trialStatus.daysRemaining} days remaining`}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-white/90 mb-4">
                  {language === 'es' 
                    ? '¡No pierdas tu progreso! Actualiza ahora para mantener todas tus rachas y datos.'
                    : "Don't lose your progress! Upgrade now to keep all your streaks and data."}
                </p>
                
                <button 
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-amber-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  {language === 'es' ? 'Actualizar por $4.99/mes' : 'Upgrade for $4.99/mo'}
                </button>
              </div>
            )}

            {/* Accountability Partners Card */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mt-5 p-4 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {language === 'es' ? 'Socios de Responsabilidad' : 'Accountability Partners'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    {language === 'es' ? 'Mantente motivado juntos' : 'Stay motivated together'}
                  </p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-white/90 mb-4">
                {language === 'es' 
                  ? 'Invita amigos para ver el progreso de cada uno y enviarse mensajes de ánimo.'
                  : "Invite friends to see each other's progress and send encouragement messages."}
              </p>
              
              <Link 
                to="/accountability"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                {language === 'es' ? 'Ver Socios' : 'View Partners'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>


            {/* Global Community Card */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {language === 'es' ? 'Comunidad Global' : 'Global Community'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    {language === 'es' ? 'Hubs, Duelos y Mentores' : 'Hubs, Duels & Mentors'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <Swords className="w-4 h-4" />
                  <span>{language === 'es' ? 'Duelos de Disciplina' : 'Discipline Duels'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <Heart className="w-4 h-4" />
                  <span>{language === 'es' ? 'Patrocina Rachas' : 'Sponsor Streaks'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <Users className="w-4 h-4" />
                  <span>{language === 'es' ? 'Mentoría y Eventos' : 'Mentorship & Events'}</span>
                </div>
              </div>
              
              <Link 
                to="/community"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'es' ? 'Explorar Comunidad' : 'Explore Community'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Device Integrations Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {language === 'es' ? 'Integraciones' : 'Integrations'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    {language === 'es' ? 'Dispositivos y Apps' : 'Devices & Apps'}
                  </p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-white/90 mb-4">
                {language === 'es' 
                  ? 'Conecta wearables, asistentes de voz y dispositivos inteligentes para auto-rastrear hábitos.'
                  : 'Connect wearables, voice assistants, and smart devices to auto-track habits.'}
              </p>
              
              <Link 
                to="/integrations"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                <Wifi className="w-4 h-4" />
                {language === 'es' ? 'Conectar Dispositivos' : 'Connect Devices'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>


            {/* Community Challenges Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">{t.challenges.title}</h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    {language === 'es' ? 'Compite con amigos' : 'Compete with friends'}
                  </p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-white/90 mb-4">
                {language === 'es' 
                  ? '¡Únete a desafíos de hábitos, compite en tablas de posiciones y gana insignias!'
                  : 'Join habit challenges, compete on leaderboards, and earn badges with the community!'}
              </p>
              
              <Link 
                to="/challenges"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                <Trophy className="w-4 h-4" />
                {language === 'es' ? 'Ver Desafíos' : 'Browse Challenges'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>


            {/* AI Features Card */}
            {habits.length > 0 && (
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">{t.ai.title}</h3>
                    <p className="text-xs sm:text-sm text-white/80">
                      {isPremium 
                        ? (language === 'es' ? 'Impulsado por IA' : 'Powered by AI')
                        : t.ai.premiumFeature}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <Link 
                    to="/insights"
                    className="flex items-center gap-3 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="flex-1 text-xs sm:text-sm">{t.ai.insights}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                  <Link 
                    to="/insights?tab=coach"
                    className="flex items-center gap-3 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="flex-1 text-xs sm:text-sm">{t.ai.coach}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                  <Link 
                    to="/insights?tab=suggestions"
                    className="flex items-center gap-3 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                  >
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="flex-1 text-xs sm:text-sm">{t.ai.suggestions}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                </div>
                
                {!isPremium && (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    {t.ai.unlockPremium}
                  </button>
                )}
              </div>
            )}
            
            <CalendarHeatmap habits={habits} completions={completions} />
            {(profile?.is_premium || habits.length > 0) && (
              <ProgressChart habits={habits} completions={completions} />
            )}
          </div>

        </div>
      </main>


      {/* Modals */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />

      <TrialExpiredModal
        isOpen={showTrialExpired}
        onClose={() => setShowTrialExpired(false)}
        onContinueViewOnly={handleContinueViewOnly}
      />

      <ProfileSettingsModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Delete Habit Confirmation - uses AlertDialog instead of native confirm() */}
      <AlertDialog open={!!deletingHabit} onOpenChange={(open) => { if (!open && !isDeleting) setDeletingHabit(null); }}>
        <AlertDialogContent className="duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'es' ? 'Eliminar hábito' : 'Delete Habit'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'es'
                ? `¿Estás seguro de que quieres eliminar "${deletingHabit?.name}"? Esta acción no se puede deshacer. Se perderán todos los progresos y datos de racha.`
                : `Are you sure you want to delete "${deletingHabit?.name}"? This action cannot be undone. All your progress and streak data for this habit will be lost.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-shrink-0 border-t border-border pt-4 mt-4">
            <AlertDialogCancel disabled={isDeleting}>{language === 'es' ? 'Cancelar' : 'Cancel'}</AlertDialogCancel>
            <button
              type="button"
              onClick={handleDeleteHabit}
              disabled={isDeleting}
              className={cn(buttonVariants(), 'bg-red-600 hover:bg-red-700 focus:ring-red-600')}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'es' ? 'Eliminando...' : 'Deleting...'}
                </>
              ) : (
                language === 'es' ? 'Eliminar' : 'Delete'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
