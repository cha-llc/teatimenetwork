import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import AppNavigator from '@/navigation/AppNavigator';
import { Colors } from '@/lib/theme';

const linking = {
  prefixes: ['teatimenetwork://', 'https://teatimenetwork.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Signup: 'signup',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Habits: 'habits',
          Analytics: 'analytics',
          Community: 'community',
          Profile: 'profile',
        },
      },
      Pricing: 'pricing',
      Challenges: 'challenges',
    },
  },
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <StatusBar style="light" backgroundColor={Colors.background} />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default App;
