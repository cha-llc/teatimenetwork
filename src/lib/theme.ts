/**
 * Tea Time Network - Design Tokens
 * Dark theme mobile app
 */

export const Colors = {
  // Brand
  primary: '#7C9885',
  primaryDark: '#5a7a64',
  primaryLight: '#9DB8A7',
  secondary: '#F4A460',
  secondaryDark: '#D4834A',

  // Backgrounds
  background: '#001A33',
  backgroundSecondary: '#002244',
  backgroundCard: '#0A2744',
  backgroundElevated: '#0D2F52',
  backgroundInput: '#0A2744',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#001A33',

  // Status
  success: '#22C55E',
  successLight: '#16A34A20',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  error: '#EF4444',
  errorLight: '#EF444420',
  info: '#3B82F6',

  // Borders
  border: '#1E3A5F',
  borderLight: '#2A4A70',

  // Streak / Gamification
  streak: '#F97316',
  streakLight: '#F9731620',
  gold: '#EAB308',
  silver: '#94A3B8',
  bronze: '#B45309',

  // Habit category colors
  habits: {
    health: '#22C55E',
    fitness: '#F59E0B',
    mindfulness: '#8B5CF6',
    learning: '#3B82F6',
    productivity: '#EC4899',
    social: '#06B6D4',
    finance: '#10B981',
    creativity: '#F97316',
    general: '#7C9885',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
