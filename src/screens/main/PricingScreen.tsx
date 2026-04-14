import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Check, X, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, FontSize, Spacing, BorderRadius, FontWeight, Shadow } from '@/lib/theme';

const FEATURES = [
  { text: 'Unlimited habit tracking', premium: true },
  { text: 'Advanced analytics & insights', premium: true },
  { text: 'AI habit coaching', premium: true },
  { text: '90-day trend reports', premium: true },
  { text: 'Community leaderboards', premium: true },
  { text: 'Team & accountability features', premium: true },
  { text: 'Challenges & competitions', premium: true },
  { text: 'Export data (CSV, PDF)', premium: true },
  { text: 'Priority support', premium: true },
  { text: 'Basic habit tracking (3 habits)', premium: false },
  { text: 'Daily reminders', premium: false },
];

const PricingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { subscriptionStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const isPremium = subscriptionStatus === 'active';

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Stripe payment integration would go here
      // Using @stripe/stripe-react-native
      Alert.alert(
        'Subscribe',
        'This will connect to Stripe to process your subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue to Payment',
            onPress: () => {
              // TODO: Integrate Stripe payment sheet
              Alert.alert('Coming Soon', 'Payment integration is being set up. Please use the web app at teatimenetwork.com to subscribe.');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Unable to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <X color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.crownContainer}>
            <Crown color={Colors.gold} size={40} />
          </View>
          <Text style={styles.heroTitle}>Tea Time Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock the full power of Tea Time Network and build life-changing habits.
          </Text>
        </View>

        {/* Already Premium */}
        {isPremium && (
          <View style={styles.alreadyPremium}>
            <Crown color={Colors.gold} size={24} />
            <Text style={styles.alreadyPremiumText}>
              You're already a Premium member! Enjoy all features.
            </Text>
          </View>
        )}

        {/* Pricing Card */}
        {!isPremium && (
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.planName}>App Member</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>$19.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.pricingTagline}>Full access · Cancel anytime</Text>
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, loading && styles.subscribeDisabled]}
              onPress={handleSubscribe}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Crown color="#fff" size={18} />
                  <Text style={styles.subscribeText}>Subscribe Now</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.cancelNote}>Cancel anytime from your profile settings.</Text>
          </View>
        )}

        {/* Features Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's included</Text>

          <Text style={styles.planLabel}>Premium Features</Text>
          {FEATURES.filter(f => f.premium).map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Check color={Colors.primary} size={14} strokeWidth={3} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.planLabel}>Free Plan Includes</Text>
          {FEATURES.filter(f => !f.premium).map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.checkIconFree}>
                <Check color={Colors.textMuted} size={14} strokeWidth={3} />
              </View>
              <Text style={styles.featureTextFree}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What members say</Text>
          {[
            {
              quote: '"Tea Time Network completely transformed my morning routine. Worth every penny!"',
              name: 'Sarah M.',
              stars: 5,
            },
            {
              quote: '"The streak tracking keeps me accountable. I\'ve never been this consistent."',
              name: 'James K.',
              stars: 5,
            },
          ].map((testimonial, i) => (
            <View key={i} style={styles.testimonialCard}>
              <Text style={styles.stars}>{'⭐'.repeat(testimonial.stars)}</Text>
              <Text style={styles.quote}>{testimonial.quote}</Text>
              <Text style={styles.reviewer}>{testimonial.name}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        {!isPremium && (
          <TouchableOpacity
            style={[styles.subscribeButtonBottom, loading && styles.subscribeDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Crown color="#fff" size={18} />
            <Text style={styles.subscribeText}>Start Premium — $19.99/mo</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerNote}>
          Secure payment powered by Stripe. Cancel anytime.{'\n'}
          No hidden fees.
        </Text>

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
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  headerRight: { width: 36 },
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  heroTitle: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  heroSubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.md },
  alreadyPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  alreadyPremiumText: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  pricingCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  pricingHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  planName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  price: { fontSize: FontSize['4xl'], fontWeight: FontWeight.extrabold, color: Colors.primary },
  pricePeriod: { fontSize: FontSize.lg, color: Colors.textSecondary, marginBottom: 8 },
  pricingTagline: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  subscribeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subscribeButtonBottom: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subscribeDisabled: { opacity: 0.7 },
  subscribeText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  cancelNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  planLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary, marginBottom: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconFree: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.textMuted + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1 },
  featureTextFree: { fontSize: FontSize.base, color: Colors.textMuted, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  testimonialCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stars: { fontSize: FontSize.sm, marginBottom: Spacing.sm },
  quote: { fontSize: FontSize.base, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 22, marginBottom: Spacing.sm },
  reviewer: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  footerNote: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 20, marginBottom: Spacing.md },
  bottomPad: { height: Spacing.xl },
});

export default PricingScreen;
