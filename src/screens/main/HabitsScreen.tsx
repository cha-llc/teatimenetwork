import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Check,
  Flame,
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';

interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

interface Streak {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  health: Colors.habits.health,
  fitness: Colors.habits.fitness,
  mindfulness: Colors.habits.mindfulness,
  learning: Colors.habits.learning,
  productivity: Colors.habits.productivity,
  social: Colors.habits.social,
  finance: Colors.habits.finance,
  creativity: Colors.habits.creativity,
  general: Colors.habits.general,
};

const CATEGORIES = [
  { value: 'health', label: 'Health' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'learning', label: 'Learning' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'social', label: 'Social' },
  { value: 'finance', label: 'Finance' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'general', label: 'General' },
];

interface HabitMenuProps {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const HabitMenu: React.FC<HabitMenuProps> = ({ habit, onEdit, onDelete, onClose }) => (
  <Modal transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.menuOverlay} onPress={onClose} activeOpacity={1}>
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>{habit.name}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
          <Edit2 color={Colors.textPrimary} size={18} />
          <Text style={styles.menuItemText}>Edit Habit</Text>
        </TouchableOpacity>
        <View style={styles.menuDivider} />
        <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
          <Trash2 color={Colors.error} size={18} />
          <Text style={[styles.menuItemText, styles.menuItemDanger]}>Delete Habit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; category: string }) => void;
  editHabit?: Habit | null;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose, onSave, editHabit }) => {
  const [name, setName] = useState(editHabit?.name || '');
  const [description, setDescription] = useState(editHabit?.description || '');
  const [category, setCategory] = useState(editHabit?.category || 'general');

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setDescription(editHabit.description || '');
      setCategory(editHabit.category);
    } else {
      setName('');
      setDescription('');
      setCategory('general');
    }
  }, [editHabit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a habit name.');
      return;
    }
    onSave({ name: name.trim(), description: description.trim(), category });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editHabit ? 'Edit Habit' : 'Add New Habit'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X color={Colors.textSecondary} size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Habit Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Morning Meditation"
                placeholderTextColor={Colors.textMuted}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="What does this habit involve?"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>

            {/* Category */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      category === cat.value && {
                        backgroundColor: CATEGORY_COLORS[cat.value] + '30',
                        borderColor: CATEGORY_COLORS[cat.value],
                      },
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat.value && { color: CATEGORY_COLORS[cat.value] },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{editHabit ? 'Update' : 'Add Habit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const HabitsScreen: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [menuHabit, setMenuHabit] = useState<Habit | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [habitsRes, completionsRes, streaksRes] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true }),
        supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', user.id)
          .eq('completed_date', today),
        supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (habitsRes.data) setHabits(habitsRes.data);

      if (completionsRes.data) {
        setCompletedToday(new Set(completionsRes.data.map(c => c.habit_id)));
      }

      if (streaksRes.data) {
        const streakMap: Record<string, Streak> = {};
        streaksRes.data.forEach(s => {
          streakMap[s.habit_id] = s;
        });
        setStreaks(streakMap);
      }
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (habit: Habit) => {
    if (completingId) return;
    setCompletingId(habit.id);
    const isCompleted = completedToday.has(habit.id);

    try {
      if (isCompleted) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habit.id)
          .eq('user_id', user!.id)
          .eq('completed_date', today);

        setCompletedToday(prev => {
          const next = new Set(prev);
          next.delete(habit.id);
          return next;
        });
      } else {
        await supabase.from('habit_completions').insert({
          habit_id: habit.id,
          user_id: user!.id,
          completed_date: today,
        });

        setCompletedToday(prev => new Set([...prev, habit.id]));

        // Update streak
        const currentStreak = (streaks[habit.id]?.current_streak || 0) + 1;
        const longestStreak = Math.max(streaks[habit.id]?.longest_streak || 0, currentStreak);

        await supabase.from('streaks').upsert({
          habit_id: habit.id,
          user_id: user!.id,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_completed_date: today,
          updated_at: new Date().toISOString(),
        });

        setStreaks(prev => ({
          ...prev,
          [habit.id]: { habit_id: habit.id, current_streak: currentStreak, longest_streak: longestStreak },
        }));
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    } finally {
      setCompletingId(null);
    }
  };

  const handleAddHabit = async (data: { name: string; description: string; category: string }) => {
    if (!user) return;
    try {
      const color = CATEGORY_COLORS[data.category] || Colors.primary;
      const { data: newHabit, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          category: data.category,
          color,
          icon: 'star',
          frequency: 'daily',
          target_days: [0, 1, 2, 3, 4, 5, 6],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      if (newHabit) {
        setHabits(prev => [...prev, newHabit]);
        await supabase.from('streaks').insert({
          habit_id: newHabit.id,
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
        });
      }
      setShowAddModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add habit.');
    }
  };

  const handleEditHabit = async (data: { name: string; description: string; category: string }) => {
    if (!editingHabit || !user) return;
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          name: data.name,
          description: data.description || null,
          category: data.category,
          color: CATEGORY_COLORS[data.category] || Colors.primary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingHabit.id);

      if (error) throw error;
      setHabits(prev =>
        prev.map(h =>
          h.id === editingHabit.id
            ? { ...h, name: data.name, description: data.description, category: data.category }
            : h
        )
      );
      setEditingHabit(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update habit.');
    }
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? All progress will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('habits')
                .update({ is_active: false })
                .eq('id', habit.id);
              setHabits(prev => prev.filter(h => h.id !== habit.id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete habit.');
            }
          },
        },
      ]
    );
  };

  const completedCount = completedToday.size;
  const totalCount = habits.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Habits</Text>
            <Text style={styles.subtitle}>Track your daily habits</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Plus color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {habits.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${completionRate}%` as any }]}
              />
            </View>
          </View>
        )}

        {/* Habits List */}
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building better habits by adding your first one.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus color="#fff" size={18} />
              <Text style={styles.emptyAddText}>Add Your First Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habits.map(habit => {
              const isCompleted = completedToday.has(habit.id);
              const isLoading = completingId === habit.id;
              const streak = streaks[habit.id];
              const categoryColor = CATEGORY_COLORS[habit.category] || Colors.primary;

              return (
                <View
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    isCompleted && styles.habitCardCompleted,
                  ]}
                >
                  {/* Category stripe */}
                  <View style={[styles.categoryStripe, { backgroundColor: categoryColor }]} />

                  {/* Toggle Button */}
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isCompleted && styles.toggleButtonDone,
                      { borderColor: isCompleted ? categoryColor : Colors.border },
                      isCompleted && { backgroundColor: categoryColor },
                    ]}
                    onPress={() => handleToggle(habit)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={isCompleted ? '#fff' : categoryColor} size="small" />
                    ) : (
                      <Check
                        color={isCompleted ? '#fff' : Colors.textMuted}
                        size={20}
                        strokeWidth={isCompleted ? 3 : 2}
                      />
                    )}
                  </TouchableOpacity>

                  {/* Habit Info */}
                  <View style={styles.habitInfo}>
                    <Text
                      style={[
                        styles.habitName,
                        isCompleted && styles.habitNameDone,
                      ]}
                      numberOfLines={1}
                    >
                      {habit.name}
                    </Text>
                    {habit.description ? (
                      <Text style={styles.habitDesc} numberOfLines={1}>
                        {habit.description}
                      </Text>
                    ) : null}
                    <View style={styles.categoryRow}>
                      <Text style={[styles.categoryLabel, { color: categoryColor }]}>
                        {habit.category}
                      </Text>
                    </View>
                  </View>

                  {/* Streak + Menu */}
                  <View style={styles.habitRight}>
                    {(streak?.current_streak || 0) > 0 && (
                      <View style={styles.streakBadge}>
                        <Flame color={Colors.streak} size={14} />
                        <Text style={styles.streakText}>{streak.current_streak}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => setMenuHabit(habit)}
                    >
                      <MoreVertical color={Colors.textMuted} size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Habit Context Menu */}
      {menuHabit && (
        <HabitMenu
          habit={menuHabit}
          onClose={() => setMenuHabit(null)}
          onEdit={() => {
            setEditingHabit(menuHabit);
            setMenuHabit(null);
          }}
          onDelete={() => {
            handleDeleteHabit(menuHabit);
            setMenuHabit(null);
          }}
        />
      )}

      {/* Add Habit Modal */}
      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddHabit}
      />

      {/* Edit Habit Modal */}
      <AddHabitModal
        visible={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        onSave={handleEditHabit}
        editHabit={editingHabit}
      />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  progressCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  progressCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyAddText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  habitsList: {
    gap: Spacing.sm,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  habitCardCompleted: {
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primary + '10',
  },
  categoryStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.md,
  },
  toggleButtonDone: {
    borderWidth: 0,
  },
  habitInfo: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.sm,
  },
  habitName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  habitNameDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  habitDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  habitRight: {
    alignItems: 'center',
    paddingRight: Spacing.sm,
    gap: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.streak + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.streak,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  // Habit Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  menuTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuItemText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  menuItemDanger: {
    color: Colors.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  // Add/Edit Habit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundInput,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundInput,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  bottomPad: {
    height: Spacing.xl,
  },
});

export default HabitsScreen;
