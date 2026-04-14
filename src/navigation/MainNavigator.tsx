import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Colors, FontSize } from '@/lib/theme';
import HomeScreen from '@/screens/main/HomeScreen';
import HabitsScreen from '@/screens/main/HabitsScreen';
import AnalyticsScreen from '@/screens/main/AnalyticsScreen';
import CommunityScreen from '@/screens/main/CommunityScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import {
  Home,
  CheckSquare,
  BarChart2,
  Users,
  User,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size - 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <CheckSquare color={color} size={size - 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 color={color} size={size - 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size - 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size - 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
