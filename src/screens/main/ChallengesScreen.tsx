import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Flame, Target, ChevronLeft, Lock, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';

const CHALLENGES = [
  {
    id: '1',
    title: '7-Day Streak Challenge',
    description: 'Complete at least one habit every day for 7 consecutive days.',
    icon: '🔥',
    duration: '7 days',
    reward: '250 XP',
    difficulty: 'Easy',
    difficultyColor: Colors.success,
    participants: 1243,
    premium: false,
  },
  {
    id: '2',
    title: '30-Day Morning Routine',
    description: 'Build a consistent morning routine habit for 30 days.',
    icon: '☀️',
    duration: '30 days',
    reward: '1,000 XP',
    difficulty: 'Medium',
    difficultyColor: Colors.warning,
    participants: 832,
    premium: true,
  },
  {
    id: '3',
    title: 'Mindfulness Master',
    description: 'Complete 5 mindfulness habits per week for 4 weeks.',
    icon: '🧘',
    duration: '28 days',
    reward: '800 XP',
    difficulty: 'Medium',
    difficultyColor: Colors.warning,
    participants: 567,
    premium: true,
  },
  {
    id: '4',
    title: 'Fitness Beast',
    description: 'Track exercise habits 6 days a week for an entire month.',
    icon: '💪',
    duration: '30 days',
    reward: '1,500 XP',
    difficulty: 'Hard',
    difficultyColor: Colors.error,
    participants: 329,
    premium: true,
  },
  {
    id: '5',
    title: 'Perfect Week',
    description: 'Complete 100% of your habits every day for 7 days.',
    icon: '⭐',
    duration: '7 days',
    reward: '500 XP',
    difficulty: 'Hard',
    difficultyColor: Colors.error,
    participants: 421,
    premium: true,
  },
];

const ChallengesScreen: React.FC = () => {
  const { subscriptionStatus } = useAuth();
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const isPremium = subscriptionStatus === 'active';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Challenges</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Trophy color={Colors.gold} size={22} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Target color={Colors.primary} size={22} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Star color={Colors.secondary} size={22} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['all', 'active', 'completed'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {CHALLENGES.map(challenge => {
            const isLocked = challenge.premium && !isPremium;
            return (
              <View key={challenge.id} style={[styles.challengeCard, isLocked && styles.lockedCard]}>
                {/* Header */}
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeEmoji}>{challenge.icon}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <View style={styles.challengeMeta}>
                      <View style={[styles.difficultyBadge, { backgroundColor: challenge.difficultyColor + '20' }]}>
                        <Text style={[styles.difficultyText, { color: challenge.difficultyColor }]}>
                          {challenge.difficulty}
                        </Text>
                      </View>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>{challenge.duration}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Flame color={Colors.secondary} size={12} />
                      <Text style={styles.metaText}>{challenge.reward}</Text>
                    </View>
                  </View>
                  {isLocked && <Lock color={Colors.textMuted} size={18} />}
                </View>

                <Text style={styles.challengeDesc}>{challenge.description}</Text>

                <View style={styles.challengeFooter}>
                  <Text style={styles.participantsText}>
                    👥 {challenge.participants.toLocaleString()} participants
                  </Text>
                  <TouchableOpacity
                    style={[styles.joinButton, isLocked && styles.joinButtonLocked]}
                    onPress={() => {
                      if (isLocked) navigation.navigate('Pricing');
                    }}
                    activeOpacity={0.8}
                  >
                    {isLocked ? (
                      <Text style={styles.joinButtonText}>Upgrade to Join</Text>
                    ) : (
                      <Text style={styles.joinButtonText}>Join Challenge</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  title: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  headerRight: { width: 36 },
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
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
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textMuted },
  filterTabTextActive: { color: '#fff' },
  challengesList: { gap: Spacing.md },
  challengeCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  lockedCard: { opacity: 0.8 },
  challengeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  challengeEmoji: { fontSize: 32 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  challengeMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  difficultyBadge: { borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  difficultyText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  metaDot: { color: Colors.textMuted, fontSize: FontSize.xs },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  challengeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  challengeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  participantsText: { fontSize: FontSize.xs, color: Colors.textMuted },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  joinButtonLocked: { backgroundColor: Colors.secondary },
  joinButtonText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  bottomPad: { height: Spacing.xl },
});

export default ChallengesScreen;
