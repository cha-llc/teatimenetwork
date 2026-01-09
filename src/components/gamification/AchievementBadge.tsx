import React, { useState } from 'react';
import { Achievement, UserAchievement } from '@/hooks/useGamification';
import { Lock, Check, Share2 } from 'lucide-react';
import SocialShareModal from '@/components/social/SocialShareModal';

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  earned,
  size = 'md',
  showDetails = true,
  onClick
}) => {
  const isEarned = !!earned;
  const [showShareModal, setShowShareModal] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl'
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className={`
          relative group cursor-pointer transition-all duration-300
          ${onClick ? 'hover:scale-105' : ''}
          ${containerSizes[size]}
        `}
      >
        {/* Badge */}
        <div
          className={`
            ${sizeClasses[size]} rounded-2xl flex items-center justify-center
            transition-all duration-300 relative overflow-hidden
            ${isEarned 
              ? `${achievement.gradient} shadow-lg shadow-${achievement.color.split(' ')[0].replace('from-', '')}/30`
              : 'bg-gray-200 dark:bg-gray-700 grayscale'
            }
          `}
        >
          {/* Shine effect for earned badges */}
          {isEarned && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
          
          {/* Icon */}
          <span className={`relative z-10 ${!isEarned ? 'opacity-50' : ''}`}>
            {achievement.icon}
          </span>

          {/* Lock overlay for unearned */}
          {!isEarned && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20">
              <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}

          {/* Earned checkmark */}
          {isEarned && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Share button for earned badges */}
          {isEarned && size !== 'sm' && (
            <button
              onClick={handleShare}
              className="absolute top-1 right-1 w-6 h-6 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-700"
            >
              <Share2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Details */}
        {showDetails && (
          <div className="mt-2 text-center">
            <p className={`font-semibold text-gray-800 dark:text-white ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {achievement.name}
            </p>
            {size !== 'sm' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {achievement.description}
              </p>
            )}
            {isEarned && earned && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                +{achievement.points} pts
              </p>
            )}
          </div>
        )}

        {/* Tooltip on hover */}
        {!showDetails && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
              <p className="font-semibold">{achievement.name}</p>
              <p className="text-gray-300">{achievement.description}</p>
              {isEarned && (
                <p className="text-green-400 mt-1">Earned +{achievement.points} pts</p>
              )}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType="achievement"
        achievementTitle={achievement.name}
        achievementDescription={achievement.description}
      />
    </>
  );
};

export default AchievementBadge;
