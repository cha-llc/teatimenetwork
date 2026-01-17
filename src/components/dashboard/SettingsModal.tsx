import React, { useState, useEffect } from 'react';
import { X, Loader2, Bell, Clock, Globe, Sun, Moon, Monitor, BellRing, Send, CreditCard, AlarmClock, Trash2, User, HardDrive, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useNotifications } from '@/hooks/useNotifications';
import { useHabits } from '@/hooks/useHabits';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionManager from '@/components/payment/SubscriptionManager';
import DataBackupModal from '@/components/backup/DataBackupModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { habits } = useHabits();
  const { t, language, setLanguage } = useLanguage();
  const { 
    isSupported: notificationsSupported, 
    isEnabled: notificationsEnabled, 
    requestPermission,
    sendTestNotification,
    isLoading: notificationsLoading,
    habitReminders,
    removeHabitReminder,
    getMotivationalMessage
  } = useNotifications();
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'tour' | 'data' | 'billing'>('general');
  const [showBackupModal, setShowBackupModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setReminderEnabled(profile.reminder_enabled);
      setReminderTime(profile.reminder_time?.slice(0, 5) || '08:00');
      setTimezone(profile.timezone || 'UTC');
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        reminder_enabled: reminderEnabled,
        reminder_time: reminderTime + ':00',
        timezone
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const activeReminders = habitReminders.filter(r => r.enabled);

  const tabs = [
    { id: 'general', label: t.settings.general, icon: Globe },
    { id: 'notifications', label: t.settings.notifications, icon: Bell },
    { id: 'appearance', label: t.settings.appearance, icon: Sun },
    { id: 'tour', label: t.settings.tour, icon: Share2 },
    { id: 'data', label: t.settings.data, icon: HardDrive },
    { id: 'billing', label: t.settings.billing, icon: CreditCard },
  ] as const;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.settings.title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 overflow-x-auto flex-shrink-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#7C9885] text-[#7C9885] dark:text-[#9AB4A3]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {/* General Tab */}
            {activeTab === 'general' && (
              <>
                {/* Language Selection */}
                <div>
                  <label className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{t.settings.language}</div>
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        language === 'en'
                          ? 'border-[#7C9885] bg-[#7C9885]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="text-xl">🇺🇸</span>
                      <span className={`font-medium ${language === 'en' ? 'text-[#7C9885]' : 'text-gray-600 dark:text-gray-400'}`}>
                        English
                      </span>
                    </button>
                    <button
                      onClick={() => setLanguage('es')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        language === 'es'
                          ? 'border-[#7C9885] bg-[#7C9885]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="text-xl">🇪🇸</span>
                      <span className={`font-medium ${language === 'es' ? 'text-[#7C9885]' : 'text-gray-600 dark:text-gray-400'}`}>
                        Español
                      </span>
                    </button>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{t.settings.timezone}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t.settings.timezoneDesc}</div>
                    </div>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <>
                {/* Push Notifications */}
                {notificationsSupported && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                          <BellRing className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">{t.notifications.pushNotifications}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {notificationsEnabled ? t.notifications.enabled : t.notifications.getBrowserNotifications}
                          </div>
                        </div>
                      </div>
                      {!notificationsEnabled ? (
                        <button
                          onClick={handleEnableNotifications}
                          disabled={notificationsLoading}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {notificationsLoading ? t.common.loading : t.notifications.enable}
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                          {t.notifications.active}
                        </span>
                      )}
                    </div>
                    
                    {notificationsEnabled && (
                      <button
                        onClick={sendTestNotification}
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        {t.notifications.sendTest}
                      </button>
                    )}
                  </div>
                )}

                {/* Active Habit Reminders */}
                {notificationsEnabled && activeReminders.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlarmClock className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-800 dark:text-white">{t.notifications.activeHabitReminders}</h4>
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                        {activeReminders.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {activeReminders.map(reminder => {
                        const habit = habits.find(h => h.id === reminder.habitId);
                        const frequencyText = reminder.frequency === 'daily' 
                          ? (language === 'es' ? 'Diario' : 'Daily')
                          : (language === 'es' ? 'Días específicos' : 'Specific days');
                        return (
                          <div
                            key={reminder.habitId}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: habit?.color ? `${habit.color}20` : '#7C988520' }}
                              >
                                <Bell className="w-4 h-4" style={{ color: habit?.color || '#7C9885' }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                  {reminder.habitName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {frequencyText} {language === 'es' ? 'a las' : 'at'} {formatTime(reminder.reminderTime)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeHabitReminder(reminder.habitId)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {t.notifications.tipReminders}
                    </p>
                  </div>
                )}

                {/* Motivational Messages Info */}
                {notificationsEnabled && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                          {t.notifications.motivationalMessages}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {t.notifications.motivationalDesc}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 italic">
                          "{getMotivationalMessage(7)}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Reminder toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{t.notifications.emailReminders}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t.notifications.dailyEmailNotifications}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      reminderEnabled ? 'bg-[#7C9885]' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Reminder time */}
                {reminderEnabled && (
                  <div>
                    <label className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{t.notifications.reminderTime}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t.notifications.whenToSend}</div>
                      </div>
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    />
                  </div>
                )}
              </>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">{t.settings.theme}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === 'light'
                          ? 'border-[#7C9885] bg-[#7C9885]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                        <Sun className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'light' ? 'text-[#7C9885]' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {t.settings.light}
                      </span>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-[#7C9885] bg-[#7C9885]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl flex items-center justify-center">
                        <Moon className="w-6 h-6 text-indigo-300" />
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-[#7C9885] dark:text-[#9AB4A3]' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {t.settings.dark}
                      </span>
                    </button>

                    <button
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === 'system'
                          ? 'border-[#7C9885] bg-[#7C9885]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'system' ? 'text-[#7C9885] dark:text-[#9AB4A3]' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {t.settings.system}
                      </span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    {theme === 'system' 
                      ? (language === 'es' ? 'El tema coincidirá con las preferencias de tu sistema' : 'Theme will match your system preferences')
                      : (language === 'es' ? `Usando modo ${theme === 'light' ? 'claro' : 'oscuro'}` : `Currently using ${theme} mode`)}
                  </p>
                </div>
              </>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <>
                {/* Backup & Export */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                        {language === 'es' ? 'Respaldo y Exportación' : 'Backup & Export'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {language === 'es' 
                          ? 'Descarga tus datos de hábitos, completados, rachas y configuraciones.' 
                          : 'Download your habit data, completions, streaks, and settings.'}
                      </p>
                      <button
                        onClick={() => setShowBackupModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        {language === 'es' ? 'Abrir Respaldo de Datos' : 'Open Data Backup'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                    {language === 'es' ? 'Qué incluye el respaldo' : 'What\'s included in backup'}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {language === 'es' ? 'Todos tus hábitos y configuraciones' : 'All your habits and settings'}
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {language === 'es' ? 'Historial completo de completados' : 'Complete completion history'}
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {language === 'es' ? 'Datos de rachas' : 'Streak data'}
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {language === 'es' ? 'Categorías personalizadas' : 'Custom categories'}
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {language === 'es' ? 'Configuración de recordatorios' : 'Reminder settings'}
                    </li>
                  </ul>
                </div>

                {/* Export Formats */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    {language === 'es' ? 'Formatos de Exportación' : 'Export Formats'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-medium text-gray-800 dark:text-white">JSON</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'es' ? 'Respaldo completo, ideal para restaurar' : 'Full backup, ideal for restore'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-medium text-gray-800 dark:text-white">CSV</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'es' ? 'Para Excel o Google Sheets' : 'For Excel or Google Sheets'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <SubscriptionManager />
            )}

            {/* Save button - only show for non-billing and non-data tabs */}
            {activeTab !== 'billing' && activeTab !== 'data' && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {saved ? t.settings.saved : t.settings.saveSettings}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Backup Modal */}
      <DataBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
    </>
  );
};

export default SettingsModal;
