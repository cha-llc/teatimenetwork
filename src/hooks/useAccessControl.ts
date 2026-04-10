import { useAuth } from '@/contexts/AuthContext';
import {
  canAccessFeature,
  validateAccess,
  getAccessDenialMessage,
  AccessValidation
} from '@/lib/accessRules';

/**
 * useAccessControl - Access control helpers for components
 * 
 * Usage:
 * const { canAccess, isLocked } = useAccessControl('challenges');
 * 
 * {isLocked && <LockedBadge />}
 */
export const useAccessControl = (featureName?: string) => {
  const { subscriptionStatus, userRole } = useAuth();

  const canAccess = (requiredSubscription?: 'free' | 'active' | 'expired') => {
    return validateAccess(subscriptionStatus, userRole, requiredSubscription);
  };

  const isFeatureAvailable = (): boolean => {
    if (!featureName) return true;
    return canAccessFeature(featureName, subscriptionStatus, userRole);
  };

  const isLocked = (): boolean => {
    return !isFeatureAvailable();
  };

  const getLockedMessage = (): string => {
    return getAccessDenialMessage(subscriptionStatus, 'active');
  };

  return {
    subscriptionStatus,
    userRole,
    canAccess,
    isFeatureAvailable,
    isLocked,
    getLockedMessage
  };
};
