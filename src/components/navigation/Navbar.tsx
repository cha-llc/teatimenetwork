import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  Trophy, 
  BarChart3, 
  FolderOpen, 
  Crown, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Brain,
  MessageSquare,
  Users,
  Globe,
  User,
  Radio,
  Coffee,
  History,
  Swords,
  Wifi,
  Shield
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useNotifications } from '@/hooks/useNotifications';
import { useHabits } from '@/hooks/useHabits';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface NavbarProps {
  onOpenSettings?: () => void;
  onOpenUpgrade?: () => void;
  onOpenProfile?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenUpgrade, onOpenProfile }) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isSupported, isEnabled, requestPermission, isLoading, habitReminders } = useNotifications();
  const { habits, streaks } = useHabits();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const isPremium = profile?.is_premium;
  const isAdmin = profile?.is_admin;
  const avatarUrl = (profile as any)?.avatar_url;
  const displayName = (profile as any)?.display_name || profile?.full_name || profile?.email;

  const navLinks = [
    { path: '/', label: t.nav.dashboard, icon: Home },
    { path: '/momentum-realm', label: language === 'es' ? 'Reino Momentum' : 'Momentum Realm', icon: Swords },
    { path: '/community', label: language === 'es' ? 'Comunidad' : 'Community', icon: Globe },
    { path: '/challenges', label: t.nav.challenges, icon: Users },
    { path: '/accountability', label: language === 'es' ? 'Socios' : 'Partners', icon: Users },
    { path: '/integrations', label: language === 'es' ? 'Integraciones' : 'Integrations', icon: Wifi },
    { path: '/templates', label: t.nav.templates, icon: Sparkles },
    { path: '/pricing', label: language === 'es' ? 'Precios' : 'Pricing', icon: Crown },
    { path: '/teams', label: language === 'es' ? 'Equipos' : 'Teams', icon: Users, premium: true, ultimate: true },
    { path: '/incubator', label: language === 'es' ? 'Incubadora' : 'Incubator', icon: Coffee, premium: true },
    { path: '/insights', label: language === 'es' ? 'Coach IA' : 'AI Coach', icon: Brain, premium: true },
    { path: '/smart-ecosystem', label: t.nav.smartEcosystem, icon: Radio, premium: true },
    { path: '/neuro-feedback', label: language === 'es' ? 'Neuro-Feedback' : 'Neuro-Feedback', icon: Brain, premium: true },
    { path: '/neuro-history', label: language === 'es' ? 'Historial Neuro' : 'Neuro History', icon: History, premium: true },
    { path: '/achievements', label: t.nav.rewards, icon: Trophy },
    { path: '/analytics', label: t.nav.analytics, icon: BarChart3 },
    { path: '/categories', label: t.nav.categories, icon: FolderOpen },
    ...(isAdmin ? [{ path: '/admin', label: language === 'es' ? 'Admin' : 'Admin', icon: Shield, admin: true }] : []),
  ];





  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleNotificationToggle = async () => {
    if (!isEnabled) {
      await requestPermission();
    }
  };

  const getInitials = () => {
    const name = displayName || '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#7C9885] to-[#F4A460] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-lg sm:text-xl">🍵</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white hidden sm:block truncate">
              The Tea Time Network
            </span>
            {isPremium && (
              <span className="hidden md:inline-flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                <Crown className="w-3 h-3" />
                {t.nav.premium}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex flex-1 min-w-0 max-w-[380px] mx-2">
            <nav className="flex items-center gap-2.5 overflow-x-auto w-full [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive(link.path)
                      ? link.premium 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-[#7C9885]/10 text-[#7C9885] dark:bg-[#7C9885]/20 dark:text-[#9AB4A3]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden 2xl:inline">{link.label}</span>
                  {link.premium && !isPremium && (
                    <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Notification Center */}
            {isSupported && (
              <NotificationCenter habits={habits} streaks={streaks} />
            )}

            {/* Language Toggle */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                title={t.settings.language}
              >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  {language}
                </span>
              </button>
              
              {languageDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20">
                    <button
                      onClick={() => { setLanguage('en'); setLanguageDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        language === 'en' ? 'text-[#7C9885] font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-lg">🇺🇸</span>
                      English
                    </button>
                    <button
                      onClick={() => { setLanguage('es'); setLanguageDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        language === 'es' ? 'text-[#7C9885] font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-lg">🇪🇸</span>
                      Español
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Upgrade Button (non-premium) */}
            {!isPremium && onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">{t.nav.unlockAI}</span>
              </button>
            )}


            {/* Profile Button with link to public profile */}
            {onOpenProfile && (
              <div className="relative group">
                <button
                  onClick={onOpenProfile}
                  className="p-1 rounded-full hover:ring-2 hover:ring-[#7C9885]/50 transition-all"
                  title={t.settings.profile}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C9885] to-[#5a7a64] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{getInitials()}</span>
                    </div>
                  )}
                </button>
                
                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-gray-800 dark:text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
                  </div>
                  <button
                    onClick={onOpenProfile}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                  {(profile as any)?.username && (
                    <Link
                      to={`/user/${(profile as any).username}`}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" />
                      View Public Profile
                    </Link>
                  )}
                </div>
              </div>
            )}


            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block"
              title={t.nav.signOut}
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="xl:hidden mt-4 pb-2 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.path)
                        ? link.premium
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-[#7C9885]/10 text-[#7C9885] dark:bg-[#7C9885]/20 dark:text-[#9AB4A3]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                    {link.premium && !isPremium && (
                      <Crown className="w-4 h-4 text-amber-500 ml-auto" />
                    )}
                  </Link>
                );
              })}
              
              {/* Mobile Profile Button */}
              {onOpenProfile && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User className="w-5 h-5" />
                  {t.settings.profile}
                </button>
              )}

              {/* Mobile Settings */}
              {onOpenSettings && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings className="w-5 h-5" />
                  {language === 'es' ? 'Configuración' : 'Settings'}
                </button>
              )}

              {/* Mobile Language Toggle */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-1">
                  {t.settings.language}
                </span>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      language === 'en' 
                        ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('es')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      language === 'es' 
                        ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    ES
                  </button>
                </div>
              </div>

              {/* Mobile Sign Out */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5" />
                {t.nav.signOut}
              </button>
              
              {!isPremium && onOpenUpgrade && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUpgrade();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white mt-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {t.nav.unlockAI}
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
