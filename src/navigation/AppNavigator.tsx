import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/theme';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import PricingScreen from '@/screens/main/PricingScreen';
import ChallengesScreen from '@/screens/main/ChallengesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingLogo}>
      <Text style={styles.loadingEmoji}>🍵</Text>
    </View>
    <ActivityIndicator color={Colors.primary} size="large" style={styles.spinner} />
    <Text style={styles.loadingText}>Tea Time Network</Text>
  </View>
);

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="Pricing"
            component={PricingScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Challenges"
            component={ChallengesScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingEmoji: {
    fontSize: 40,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AppNavigator;
