import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccessDenial from './AccessDenial';
import SubscriptionLocked from './SubscriptionLocked';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSubscription?: 'active' | 'free';
  fallbackTo?: string;
}

/**
 * ProtectedRoute - Guards routes based on authentication and authorization
 * 
 * Usage:
 * <ProtectedRoute requireAdmin={true}>
 *   <AdminPage />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requireSubscription="active">
 *   <ChallengesPage />
 * </ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSubscription,
  fallbackTo = '/'
}) => {
  const { user, loading, isAdmin, subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7C9885]/10 via-white to-[#F4A460]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C9885] to-[#F4A460] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🍵</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <AccessDenial
        title="Sign in to continue"
        message="This area requires authentication. Please sign in to access this content."
        showAuthLink={true}
      />
    );
  }

  // Admin route
  if (requireAdmin && !isAdmin) {
    return (
      <AccessDenial
        title="Admin access required"
        message="You don't have permission to access this area. Only administrators can view this content."
        showAuthLink={false}
      />
    );
  }

  // Subscription check
  if (requireSubscription === 'active' && subscriptionStatus !== 'active') {
    return (
      <SubscriptionLocked
        currentStatus={subscriptionStatus}
        requiredStatus="active"
      />
    );
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;
