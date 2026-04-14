import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Crown,
  LogOut,
  ChevronRight,
  Shield,
  FileText,
  Mail,
  Edit2,
  X,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const { user, profile, signOut, updateProfile, subscriptionStatus, trialStatus } = useAuth();
  const navigation = useNavigation<any>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || profile?.full_name || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(profile?.reminder_enabled ?? true);

  const isPremium = subscriptionStatus === 'active';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: editName.trim(),
        bio: editBio.trim(),
      });
      setShowEditModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    await updateProfile({ reminder_enabled: value });
  };

  const displayName = profile?.display_name || profile?.full_name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowEditModal(true)}>
            <Edit2 color={Colors.primary} size={18} />
          </TouchableOpacity>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          {/* Subscription Badge */}
          <View style={[styles.subBadge, isPremium ? styles.subBadgePremium : styles.subBadgeFree]}>
            {isPremium ? (
              <>
                <Crown color={Colors.gold} size={14} />
                <Text style={[styles.subBadgeText, styles.subBadgePremiumText]}>Premium Member</Text>
              </>
            ) : (
              <>
                <Text style={styles.subBadgeText}>
                  {trialStatus.isTrialActive
                    ? `Free Trial · ${trialStatus.daysRemaining} days left`
                    : 'Free Plan'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Upgrade Banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => navigation.navigate('Pricing')}
            activeOpacity={0.8}
          >
            <Crown color={Colors.gold} size={22} />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Unlock all features for $19.99/month
              </Text>
            </View>
            <ChevronRight color={Colors.gold} size={18} />
          </TouchableOpacity>
        )}

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Bell color={Colors.primary} size={18} />
                </View>
                <Text style={styles.settingLabel}>Daily Reminders</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                thumbColor={reminderEnabled ? Colors.primary : Colors.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.settingsList}>
            {isPremium && (
              <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.gold + '20' }]}>
                    <Crown color={Colors.gold} size={18} />
                  </View>
                  <Text style={styles.settingLabel}>Manage Subscription</Text>
                </View>
                <ChevronRight color={Colors.textMuted} size={18} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.info + '20' }]}>
                  <Mail color={Colors.info} size={18} />
                </View>
                <Text style={styles.settingLabel}>Email: {user?.email}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Legal</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.textMuted + '20' }]}>
                  <Shield color={Colors.textMuted} size={18} />
                </View>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.textMuted + '20' }]}>
                  <FileText color={Colors.textMuted} size={18} />
                </View>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <LogOut color={Colors.error} size={18} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Tea Time Network v1.0.0</Text>
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X color={Colors.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your display name"
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Check color="#fff" size={18} />
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  editBtn: { padding: Spacing.xs },
  profileCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: '#fff' },
  displayName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  bio: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  subBadgeFree: { backgroundColor: Colors.textMuted + '20' },
  subBadgePremium: { backgroundColor: Colors.gold + '20' },
  subBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  subBadgePremiumText: { color: Colors.gold },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    gap: Spacing.md,
  },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  upgradeSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  settingsList: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  signOutText: { color: Colors.error, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.md },
  // Edit Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
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
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
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
  cancelBtnText: { color: Colors.textSecondary, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  bottomPad: { height: Spacing.xl },
});

export default ProfileScreen;
