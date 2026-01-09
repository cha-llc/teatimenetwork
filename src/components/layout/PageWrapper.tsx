import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/navigation/Navbar';
import TrialBanner from '@/components/dashboard/TrialBanner';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import SettingsModal from '@/components/dashboard/SettingsModal';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '',
  title,
  description,
  icon,
  action 
}) => {
  const { profile, trialStatus } = useAuth();
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-x-hidden ${className}`}>
      {/* Trial Banner */}
      {!profile?.is_premium && (
        <TrialBanner
          daysRemaining={trialStatus.daysRemaining}
          isExpired={trialStatus.isTrialExpired}
          onUpgrade={() => setShowUpgrade(true)}
        />
      )}

      {/* Navigation */}
      <Navbar 
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        {(title || action) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}

        {children}
      </main>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <ProfileSettingsModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export const PageContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <main className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      {children}
    </main>
  );
};

export { PageWrapper };
export default PageWrapper;
