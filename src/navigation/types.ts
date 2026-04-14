import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Main Bottom Tabs
export type MainTabParamList = {
  Home: undefined;
  Habits: undefined;
  Analytics: undefined;
  Community: undefined;
  Profile: undefined;
};

// Root Stack (wraps auth + main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Pricing: undefined;
  Challenges: undefined;
  Teams: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
