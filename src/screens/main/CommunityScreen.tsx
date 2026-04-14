import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Trophy, Flame, Star, ChevronRight, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';

interface LeaderboardEntry {
  display_name: string;
  full_name: string;
  avatar_url: string | null;
  total_completions: number;
  current_streak: number;
}

const CommunityScreen: React.FC = () => {
  const { user, subscriptionStatus } = useAuth();
  const navigation = useNavigation<any>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isPremium = subscriptionStatus === 'active';

  const fetchLeaderboard = async () => {
    try {
      // Fetch top users by habit completions this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startDate = weekAgo.toISOString().split('T')[0];

      const { data } = await supabase
        .from('profiles')
        .select('display_name, full_name, avatar_url')
        .limit(10);

      // Simplified leaderboard using mock data for demo
      const mockLeaderboard: LeaderboardEntry[] = (data || []).map((profile, i) => ({
        display_name: profile.display_name || profile.full_name || 'User',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url,
        total_completions: Math.max(0, 35 - i * 3 + Math.floor(Math.random() * 5)),
        current_streak: Math.max(0, 15 - i * 1 + Math.floor(Math.random() * 3)),
      }));

      setLeaderboard(mockLeaderboard);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return Colors.gold;
    if (rank === 2) return Colors.silver;
    if (rank === 3) return Colors.bronze;
    return Colors.textMuted;
  };

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
            onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Connect and compete with others</Text>
        </View>

        {/* Community Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users color={Colors.primary} size={24} />
            <Text style={styles.statValue}>2.4K+</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Flame color={Colors.streak} size={24} />
            <Text style={styles.statValue}>18K+</Text>
            <Text style={styles.statLabel}>Habits tracked</Text>
          </View>
          <View style={styles.statCard}>
            <Star color={Colors.gold} size={24} />
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Satisfaction</Text>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy color={Colors.gold} size={18} />
            <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
          </View>

          {isPremium ? (
            <View style={styles.leaderboardList}>
              {leaderboard.map((entry, i) => (
                <View key={i} style={[styles.leaderboardItem, i === 0 && styles.topEntry]}>
                  <View style={[styles.rankBadge, { backgroundColor: getMedalColor(i + 1) + '20' }]}>
                    <Text style={[styles.rankText, { color: getMedalColor(i + 1) }]}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName}>
                      {entry.display_name || entry.full_name}
                    </Text>
                    <View style={styles.leaderStats}>
                      <Flame color={Colors.streak} size={12} />
                      <Text style={styles.leaderStat}>{entry.current_streak} streak</Text>
                      <Text style={styles.leaderDot}>·</Text>
                      <Text style={styles.leaderStat}>{entry.total_completions} done</Text>
                    </View>
                  </View>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>{entry.total_completions}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.lockCard}
              onPress={() => navigation.navigate('Pricing')}
              activeOpacity={0.8}
            >
              <Lock color={Colors.secondary} size={32} />
              <Text style={styles.lockTitle}>Community Leaderboard</Text>
              <Text style={styles.lockSubtitle}>
                Upgrade to see the leaderboard and compete with other members
              </Text>
              <View style={styles.upgradeButton}>
                <Text style={styles.upgradeText}>Upgrade to Unlock</Text>
                <ChevronRight color={Colors.secondary} size={16} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Features Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Features</Text>
          <View style={styles.featureList}>
            {[
              { icon: '🏆', title: 'Weekly Challenges', desc: 'Compete in habit challenges', premium: true },
              { icon: '👥', title: 'Accountability Partners', desc: 'Partner with someone for motivation', premium: true },
              { icon: '💬', title: 'Community Hubs', desc: 'Join topic-based groups', premium: true },
              { icon: '🤝', title: 'Team Habits', desc: 'Build habits together as a team', premium: true },
            ].map((feature, i) => (
              <TouchableOpacity
                key={i}
                style={styles.featureCard}
                onPress={() => !isPremium && navigation.navigate('Pricing')}
                activeOpacity={0.8}
              >
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
                {feature.premium && !isPremium ? (
                  <Lock color={Colors.textMuted} size={16} />
                ) : (
                  <ChevronRight color={Colors.textMuted} size={16} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  leaderboardList: { gap: Spacing.sm },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  topEntry: {
    borderColor: Colors.gold + '50',
    backgroundColor: Colors.gold + '08',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  leaderStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  leaderStat: { fontSize: FontSize.xs, color: Colors.textMuted },
  leaderDot: { color: Colors.textMuted, fontSize: FontSize.xs },
  completionBadge: {
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  lockCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
    gap: Spacing.sm,
  },
  lockTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  lockSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '20',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    gap: 4,
  },
  upgradeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.secondary },
  featureList: { gap: Spacing.sm },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  featureEmoji: { fontSize: 24 },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  featureDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  bottomPad: { height: Spacing.xl },
});

export default CommunityScreen;
