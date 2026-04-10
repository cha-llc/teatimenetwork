/**
 * AUTH CONFIGURATION & HELPERS
 * Tea Time Network - Authentication System
 */

export const AUTH_CONFIG = {
  // Authentication methods (per spec: Email + Password, Magic Link only)
  methods: {
    emailPassword: true,
    magicLink: true,
    socialLogins: false,
    anonymous: false,
  },

  // Session management
  session: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    tokenRefreshInterval: 5 * 60 * 1000, // 5 minutes
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },

  // Email verification
  email: {
    requireVerification: true,
    resendTimeout: 60 * 1000, // 1 minute
  },

  // Rate limiting
  rateLimit: {
    signUpAttempts: 5,
    signInAttempts: 5,
    passwordResetAttempts: 3,
    timeWindow: 15 * 60 * 1000, // 15 minutes
  },

  // Trial settings
  trial: {
    durationDays: 30,
    autoConvertToFree: true,
  },

  // Subscription tiers
  tiers: {
    free: {
      name: 'Free',
      price: 0,
      description: 'App overview and structure preview',
      features: [
        'Limited replays (flagged episodes)',
        'CTA education',
        'App structure preview',
      ],
    },
    active: {
      name: 'Active',
      price: 9.99,
      description: 'Full access to all features',
      features: [
        'All replays',
        'Tea Time Notes',
        'Challenges',
        'Workbook links',
        'Full execution tools',
        'Priority support',
      ],
    },
  },
};

/**
 * Error messages - Human, direct, no jargon
 */
export const AUTH_MESSAGES = {
  errors: {
    invalidEmail: 'Please enter a valid email address.',
    passwordTooShort: 'Password must be at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
    emailInUse: 'This email is already registered.',
    invalidCredentials: 'Email or password is incorrect.',
    userNotFound: 'No account found with this email.',
    sessionExpired: 'Your session has ended. Please sign in again.',
    networkError: 'Network error. Please check your connection.',
    tooManyAttempts: 'Too many attempts. Please try again later.',
    unknown: 'Something went wrong. Please try again.',
  },
  success: {
    signUpComplete: 'Account created! Please check your email to verify.',
    signInComplete: 'Welcome back!',
    signOut: 'You have been signed out.',
    passwordReset: 'Password reset email sent. Check your inbox.',
    passwordUpdated: 'Password updated successfully.',
    profileUpdated: 'Profile updated successfully.',
  },
  info: {
    checkEmail: 'Check your email for a verification link.',
    checkEmailForReset: 'Check your email for password reset instructions.',
  },
};

/**
 * Get error message helper
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const messages: Record<string, string> = {
    'invalid_credentials': AUTH_MESSAGES.errors.invalidCredentials,
    'user_not_found': AUTH_MESSAGES.errors.userNotFound,
    'user_already_exists': AUTH_MESSAGES.errors.emailInUse,
    'weak_password': AUTH_MESSAGES.errors.passwordTooShort,
    'email_exists': AUTH_MESSAGES.errors.emailInUse,
    'session_not_found': AUTH_MESSAGES.errors.sessionExpired,
    'network_error': AUTH_MESSAGES.errors.networkError,
    'too_many_requests': AUTH_MESSAGES.errors.tooManyAttempts,
  };

  return messages[errorCode] || AUTH_MESSAGES.errors.unknown;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  feedback: string[];
} => {
  const feedback: string[] = [];

  if (password.length < AUTH_CONFIG.password.minLength) {
    feedback.push(`Password must be at least ${AUTH_CONFIG.password.minLength} characters.`);
  }

  if (AUTH_CONFIG.password.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter.');
  }

  if (AUTH_CONFIG.password.requireNumbers && !/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number.');
  }

  if (AUTH_CONFIG.password.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    feedback.push('Password must contain at least one special character.');
  }

  return {
    isValid: feedback.length === 0,
    feedback,
  };
};

/**
 * Subscription status helpers
 */
export const getSubscriptionLabel = (status: 'free' | 'active' | 'expired'): string => {
  const labels = {
    free: 'Free Account',
    active: 'Active Subscriber',
    expired: 'Expired Subscription',
  };
  return labels[status];
};

export const getSubscriptionColor = (status: 'free' | 'active' | 'expired'): string => {
  const colors = {
    free: 'text-gray-600',
    active: 'text-green-600',
    expired: 'text-orange-600',
  };
  return colors[status];
};

export const getSubscriptionBg = (status: 'free' | 'active' | 'expired'): string => {
  const colors = {
    free: 'bg-gray-100',
    active: 'bg-green-50',
    expired: 'bg-orange-50',
  };
  return colors[status];
};

/**
 * Session management helpers
 */
export const shouldRefreshSession = (lastRefresh: Date): boolean => {
  const now = new Date();
  const timeSinceRefresh = now.getTime() - lastRefresh.getTime();
  return timeSinceRefresh > AUTH_CONFIG.session.tokenRefreshInterval;
};

/**
 * Admin check - CJ only
 * This is a client-side check only - server-side validation in RLS policies is authoritative
 */
export const isCJAdminUID = (uid: string): boolean => {
  // This should come from environment variable or Supabase
  const cjUID = process.env.REACT_APP_CJ_UID || '';
  return uid === cjUID;
};
