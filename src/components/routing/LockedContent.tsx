import React from 'react';
import { Lock } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';

interface LockedContentProps {
  children?: React.ReactNode;
  featureName?: string;
  locked?: boolean;
  showBadge?: boolean;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  tooltip?: string;
}

/**
 * LockedContent - Wrapper component that shows lock badge on gated content
 * 
 * Usage:
 * <LockedContent featureName="challenges">
 *   <ChallengeCard />
 * </LockedContent>
 * 
 * Or use locked prop explicitly:
 * <LockedContent locked={!isSubscriber}>
 *   <PremiumFeature />
 * </LockedContent>
 */
const LockedContent: React.FC<LockedContentProps> = ({
  children,
  featureName,
  locked,
  showBadge = true,
  badgePosition = 'top-right',
  className = '',
  tooltip = 'Active subscription required'
}) => {
  const { isLocked: isFeatureLocked } = useAccessControl(featureName);
  
  // Determine if content is locked
  const isContentLocked = locked !== undefined ? locked : isFeatureLocked();

  if (!showBadge || !isContentLocked) {
    return <>{children}</>;
  }

  // Position classes for badge
  const positionClasses = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'bottom-left': 'bottom-3 left-3',
  };

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className={`absolute ${positionClasses[badgePosition]} bg-[#7C9885] text-white rounded-full p-2 shadow-lg group cursor-help`}
        title={tooltip}
      >
        <Lock className="w-4 h-4" />
        {/* Tooltip */}
        <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap bottom-full right-0 mb-2 z-50">
          {tooltip}
          <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  );
};

/**
 * LockedBadge - Standalone lock badge component
 * Use for inline locked indicators
 */
export const LockedBadge: React.FC<{ tooltip?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  tooltip = 'Active subscription required',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="inline-flex items-center gap-1 group relative">
      <Lock className={`${sizeClasses[size]} text-[#7C9885]`} />
      {/* Tooltip on hover */}
      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap bottom-full left-0 mb-2 z-50">
        {tooltip}
      </div>
    </div>
  );
};

/**
 * LockedOverlay - Full content overlay for locked features
 * Shows semi-transparent overlay with lock icon
 */
export const LockedOverlay: React.FC<{
  isLocked: boolean;
  children: React.ReactNode;
  message?: string;
}> = ({
  isLocked,
  children,
  message = 'Upgrade to unlock'
}) => {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center backdrop-blur-sm cursor-not-allowed">
        <Lock className="w-12 h-12 text-white mb-2 opacity-90" />
        <p className="text-white font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LockedContent;
