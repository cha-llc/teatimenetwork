import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Flame,
  Trophy,
  CheckSquare,
  TrendingUp,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';

interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  completionRate: number;
}

const HomeScreen: React.FC = () => {
  const { user, profile, subscriptionStatus, trialStatus } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats>({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      // Habits count
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Today's completions
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      // Streaks
      const { data: streaks } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .order('current_streak', { ascending: false })
        .limit(1);

      const totalHabits = habits?.length || 0;
      const completedToday = completions?.length || 0;
      const currentStreak = streaks?.[0]?.current_streak || 0;
      const completionRate = totalHabits > 0
        ? Math.round((completedToday / totalHabits) * 100)
        : 0;

      setStats({ totalHabits, completedToday, currentStreak, completionRate });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.display_name || profile?.full_name || 'there';
  const isPremium = subscriptionStatus === 'active';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {displayName} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.logoMini}>
            <Text style={styles.logoEmoji}>🍵</Text>
          </View>
        </View>

        {/* Trial/Subscription Banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.trialBanner}
            onPress={() => navigation.navigate('Pricing')}
            activeOpacity={0.8}
          >
            {trialStatus.isTrialActive ? (
              <>
                <Star color={Colors.secondary} size={18} />
                <Text style={styles.trialText}>
                  {trialStatus.daysRemaining} days left in your free trial
                </Text>
              </>
            ) : (
              <>
                <Zap color={Colors.secondary} size={18} />
                <Text style={styles.trialText}>Upgrade to unlock all features</Text>
              </>
            )}
            <ChevronRight color={Colors.secondary} size={16} />
          </TouchableOpacity>
        )}

        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Habits completed</Text>
              <Text style={styles.progressCount}>
                {stats.completedToday}/{stats.totalHabits}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(stats.completionRate, 100)}%` as any },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{stats.completionRate}% complete</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.streak + '20' }]}>
                <Flame color={Colors.streak} size={22} />
              </View>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
                <CheckSquare color={Colors.primary} size={22} />
              </View>
              <Text style={styles.statValue}>{stats.totalHabits}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
                <TrendingUp color={Colors.success} size={22} />
              </View>
              <Text style={styles.statValue}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Today's Rate</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.gold + '20' }]}>
                <Trophy color={Colors.gold} size={22} />
              </View>
              <Text style={styles.statValue}>{stats.completedToday}</Text>
              <Text style={styles.statLabel}>Done Today</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Habits')}
              activeOpacity={0.8}
            >
              <CheckSquare color={Colors.primary} size={24} />
              <Text style={styles.actionLabel}>Track Habits</Text>
              <ChevronRight color={Colors.textMuted} size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Analytics')}
              activeOpacity={0.8}
            >
              <TrendingUp color={Colors.success} size={24} />
              <Text style={styles.actionLabel}>View Analytics</Text>
              <ChevronRight color={Colors.textMuted} size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Challenges')}
              activeOpacity={0.8}
            >
              <Trophy color={Colors.gold} size={24} />
              <Text style={styles.actionLabel}>Challenges</Text>
              <ChevronRight color={Colors.textMuted} size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Community')}
              activeOpacity={0.8}
            >
              <Star color={Colors.secondary} size={24} />
              <Text style={styles.actionLabel}>Community</Text>
              <ChevronRight color={Colors.textMuted} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Footer */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationQuote}>
            "Small daily improvements are the key to staggering long-term results."
          </Text>
          <Text style={styles.motivationAuthor}>— Keep brewing great habits ☕</Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  logoMini: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoEmoji: {
    fontSize: 24,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
    gap: Spacing.sm,
  },
  trialText: {
    flex: 1,
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  progressCount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressPercent: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    gap: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  motivationCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: Spacing.md,
  },
  motivationQuote: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  motivationAuthor: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  bottomPad: {
    height: Spacing.xl,
  },
});

export default HomeScreen;
