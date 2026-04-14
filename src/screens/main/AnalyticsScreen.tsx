import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Flame,
  CheckCircle,
  Calendar,
  BarChart2,
  Award,
  Lock,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalyticsData {
  totalHabits: number;
  completedThisWeek: number;
  bestStreak: number;
  averageCompletion: number;
  weeklyData: { day: string; count: number; total: number }[];
  topHabits: { name: string; streak: number; color: string }[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AnalyticsScreen: React.FC = () => {
  const { user, subscriptionStatus } = useAuth();
  const navigation = useNavigation<any>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isPremium = subscriptionStatus === 'active';

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      const startDate = weekAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const [habitsRes, completionsRes, streaksRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase
          .from('habit_completions')
          .select('completed_date, habit_id')
          .eq('user_id', user.id)
          .gte('completed_date', startDate)
          .lte('completed_date', endDate),
        supabase
          .from('streaks')
          .select('habit_id, current_streak, longest_streak')
          .eq('user_id', user.id)
          .order('current_streak', { ascending: false }),
      ]);

      const habits = habitsRes.data || [];
      const completions = completionsRes.data || [];
      const streaks = streaksRes.data || [];

      // Weekly breakdown
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayCompletions = completions.filter(c => c.completed_date === dateStr);
        weeklyData.push({
          day: DAY_LABELS[date.getDay()],
          count: dayCompletions.length,
          total: habits.length,
        });
      }

      // Stats
      const totalHabits = habits.length;
      const completedThisWeek = completions.length;
      const bestStreak = streaks[0]?.current_streak || 0;
      const avgPerDay = weeklyData.reduce((sum, d) => sum + (d.total > 0 ? d.count / d.total : 0), 0) / 7;
      const averageCompletion = Math.round(avgPerDay * 100);

      // Top habits by streak
      const topHabits = streaks.slice(0, 5).map(s => {
        const habit = habits.find(h => h.id === s.habit_id);
        return {
          name: habit?.name || 'Unknown',
          streak: s.current_streak,
          color: habit?.color || Colors.primary,
        };
      }).filter(h => h.streak > 0);

      setData({ totalHabits, completedThisWeek, bestStreak, averageCompletion, weeklyData, topHabits });
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const maxCount = data ? Math.max(...data.weeklyData.map(d => d.count), 1) : 1;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAnalytics(); }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your habit performance</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <CheckCircle color={Colors.primary} size={20} />
            </View>
            <Text style={styles.statValue}>{data?.totalHabits || 0}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.streak + '20' }]}>
              <Flame color={Colors.streak} size={20} />
            </View>
            <Text style={styles.statValue}>{data?.bestStreak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
              <TrendingUp color={Colors.success} size={20} />
            </View>
            <Text style={styles.statValue}>{data?.averageCompletion || 0}%</Text>
            <Text style={styles.statLabel}>Avg Rate</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.info + '20' }]}>
              <Calendar color={Colors.info} size={20} />
            </View>
            <Text style={styles.statValue}>{data?.completedThisWeek || 0}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart2 color={Colors.primary} size={18} />
            <Text style={styles.cardTitle}>7-Day Overview</Text>
          </View>
          <View style={styles.barChart}>
            {(data?.weeklyData || []).map((d, i) => {
              const heightPercent = maxCount > 0 ? (d.count / maxCount) : 0;
              const barHeight = Math.max(heightPercent * 100, d.count > 0 ? 8 : 4);
              return (
                <View key={i} style={styles.barColumn}>
                  <Text style={styles.barCount}>{d.count > 0 ? d.count : ''}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: d.count > 0 ? Colors.primary : Colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barDay}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Habits by Streak */}
        {(data?.topHabits.length || 0) > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Award color={Colors.gold} size={18} />
              <Text style={styles.cardTitle}>Top Streaks</Text>
            </View>
            {data!.topHabits.map((habit, i) => (
              <View key={i} style={styles.habitRow}>
                <View style={styles.habitRank}>
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>
                <View style={styles.habitBarContainer}>
                  <Text style={styles.habitRowName} numberOfLines={1}>{habit.name}</Text>
                  <View style={styles.habitBarBg}>
                    <View
                      style={[
                        styles.habitBarFill,
                        {
                          width: `${Math.min((habit.streak / (data!.bestStreak || 1)) * 100, 100)}%` as any,
                          backgroundColor: habit.color,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.streakBadge}>
                  <Flame color={Colors.streak} size={12} />
                  <Text style={styles.streakText}>{habit.streak}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Premium Lock Banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.lockBanner}
            onPress={() => navigation.navigate('Pricing')}
            activeOpacity={0.8}
          >
            <Lock color={Colors.secondary} size={20} />
            <View style={styles.lockText}>
              <Text style={styles.lockTitle}>Unlock Advanced Analytics</Text>
              <Text style={styles.lockSubtitle}>
                90-day trends, AI insights, export reports & more
              </Text>
            </View>
            <Text style={styles.lockCTA}>Upgrade →</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: Spacing.md, marginBottom: Spacing.lg },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4, minHeight: 16 },
  barBg: { width: '70%', height: 100, justifyContent: 'flex-end', backgroundColor: Colors.border + '40', borderRadius: 4 },
  barFill: { width: '100%', borderRadius: 4, minHeight: 4 },
  barDay: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  habitRank: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted },
  habitBarContainer: { flex: 1 },
  habitRowName: { fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 4, fontWeight: FontWeight.medium },
  habitBarBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  habitBarFill: { height: '100%', borderRadius: 3 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.streak },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
    gap: Spacing.md,
  },
  lockText: { flex: 1 },
  lockTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  lockSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary },
  lockCTA: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.secondary },
  bottomPad: { height: Spacing.xl },
});

export default AnalyticsScreen;
