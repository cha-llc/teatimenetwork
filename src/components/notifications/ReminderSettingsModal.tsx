import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Clock, Zap, AlertTriangle, CheckCircle, Calendar, MessageSquare, AlarmClock } from 'lucide-react';
import { Habit, Streak } from '@/hooks/useHabits';
import { useNotifications, HabitReminder } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
  streak?: Streak;
}

const quickTimeOptions = [
  { label: 'Morning', labelEs: 'Mañana', time: '07:00', icon: '🌅' },
  { label: 'Mid-morning', labelEs: 'Media mañana', time: '09:00', icon: '☀️' },
  { label: 'Noon', labelEs: 'Mediodía', time: '12:00', icon: '🌞' },
  { label: 'Afternoon', labelEs: 'Tarde', time: '15:00', icon: '🌤️' },
  { label: 'Evening', labelEs: 'Noche', time: '18:00', icon: '🌆' },
  { label: 'Night', labelEs: 'Noche tarde', time: '21:00', icon: '🌙' },
];

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

const snoozePresets = [
  { minutes: 5, label: '5 min' },
  { minutes: 10, label: '10 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
];

const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  habit,
  streak
}) => {
  const { language } = useLanguage();
  const { 
    isEnabled: notificationsEnabled,
    requestPermission,
    setHabitReminder,
    getHabitReminder,
    removeHabitReminder,
    getMotivationalMessage,
    sendNotification,
    snoozeReminder,
  } = useNotifications();

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedSnoozeOptions, setSelectedSnoozeOptions] = useState<number[]>([5, 10, 15, 30, 60]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'time' | 'days' | 'message' | 'snooze'>('time');

  const currentStreak = streak?.current_streak || 0;

  useEffect(() => {
    if (habit) {
      const existingReminder = getHabitReminder(habit.id);
      if (existingReminder) {
        setReminderEnabled(existingReminder.enabled);
        setReminderTime(existingReminder.reminderTime);
        setFrequency(existingReminder.frequency);
        setSpecificDays(existingReminder.specificDays);
        setCustomMessage(existingReminder.customMessage || '');
        setSelectedSnoozeOptions(existingReminder.snoozeOptions);
      } else if (habit.reminder_time) {
        setReminderTime(habit.reminder_time.slice(0, 5));
        setReminderEnabled(true);
      } else {
        setReminderEnabled(false);
        setReminderTime('09:00');
        setFrequency('daily');
        setSpecificDays([0, 1, 2, 3, 4, 5, 6]);
        setCustomMessage('');
        setSelectedSnoozeOptions([5, 10, 15, 30, 60]);
      }
    }
  }, [habit, getHabitReminder]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (reminderEnabled) {
      setHabitReminder(habit.id, habit.name, reminderTime, true, {
        frequency,
        specificDays,
        customMessage: customMessage || undefined,
        snoozeOptions: selectedSnoozeOptions,
      });
    } else {
      removeHabitReminder(habit.id);
    }
    onClose();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setReminderEnabled(true);
    }
  };

  const handlePreview = () => {
    const message = customMessage || habit.description || `Time to work on "${habit.name}"!`;
    sendNotification(
      `Preview: ${habit.name}`,
      message,
      { tag: 'preview', streak: currentStreak }
    );
    setShowPreview(true);
    setTimeout(() => setShowPreview(false), 3000);
  };

  const toggleDay = (day: number) => {
    if (specificDays.includes(day)) {
      if (specificDays.length > 1) {
        setSpecificDays(specificDays.filter(d => d !== day));
      }
    } else {
      setSpecificDays([...specificDays, day].sort());
    }
  };

  const toggleSnoozeOption = (minutes: number) => {
    if (selectedSnoozeOptions.includes(minutes)) {
      if (selectedSnoozeOptions.length > 1) {
        setSelectedSnoozeOptions(selectedSnoozeOptions.filter(m => m !== minutes));
      }
    } else {
      setSelectedSnoozeOptions([...selectedSnoozeOptions, minutes].sort((a, b) => a - b));
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getFrequencyDescription = () => {
    if (frequency === 'daily') {
      return language === 'es' ? 'Todos los días' : 'Every day';
    }
    const days = specificDays.map(d => dayNames[language === 'es' ? 'es' : 'en'][d]).join(', ');
    return days;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              <Bell className="w-5 h-5" style={{ color: habit.color }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {language === 'es' ? 'Configurar Recordatorio' : 'Reminder Settings'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{habit.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification Permission Warning */}
          {!notificationsEnabled && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    {language === 'es' ? 'Habilitar Notificaciones' : 'Enable Notifications'}
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {language === 'es' 
                      ? 'Permite las notificaciones del navegador para recibir recordatorios.' 
                      : 'Allow browser notifications to receive habit reminders.'}
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    {language === 'es' ? 'Habilitar Notificaciones' : 'Enable Notifications'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              {reminderEnabled ? (
                <Bell className="w-5 h-5 text-[#7C9885]" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-gray-800 dark:text-white">
                  {language === 'es' ? 'Recordatorio' : 'Reminder'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {reminderEnabled 
                    ? `${formatTime(reminderTime)} - ${getFrequencyDescription()}`
                    : (language === 'es' ? 'Sin recordatorio' : 'No reminder set')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              disabled={!notificationsEnabled}
              className={`w-12 h-7 rounded-full transition-colors ${
                reminderEnabled ? 'bg-[#7C9885]' : 'bg-gray-300 dark:bg-gray-600'
              } ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Settings Tabs */}
          {reminderEnabled && (
            <>
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'time', icon: Clock, label: language === 'es' ? 'Hora' : 'Time' },
                  { id: 'days', icon: Calendar, label: language === 'es' ? 'Días' : 'Days' },
                  { id: 'message', icon: MessageSquare, label: language === 'es' ? 'Mensaje' : 'Message' },
                  { id: 'snooze', icon: AlarmClock, label: 'Snooze' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#7C9885] text-[#7C9885]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Time Tab */}
              {activeTab === 'time' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'es' ? 'Hora del Recordatorio' : 'Reminder Time'}
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Zap className="w-4 h-4 inline mr-2" />
                      {language === 'es' ? 'Selección Rápida' : 'Quick Select'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {quickTimeOptions.map((option) => (
                        <button
                          key={option.time}
                          type="button"
                          onClick={() => setReminderTime(option.time)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl text-sm transition-all ${
                            reminderTime === option.time
                              ? 'bg-[#7C9885] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="text-lg">{option.icon}</span>
                          <span className="font-medium">{language === 'es' ? option.labelEs : option.label}</span>
                          <span className="text-xs opacity-75">{formatTime(option.time)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Days Tab */}
              {activeTab === 'days' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'es' ? 'Frecuencia' : 'Frequency'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setFrequency('daily');
                          setSpecificDays([0, 1, 2, 3, 4, 5, 6]);
                        }}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          frequency === 'daily'
                            ? 'bg-[#7C9885] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {language === 'es' ? 'Todos los días' : 'Every day'}
                      </button>
                      <button
                        onClick={() => setFrequency('specific_days')}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          frequency === 'specific_days'
                            ? 'bg-[#7C9885] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {language === 'es' ? 'Días específicos' : 'Specific days'}
                      </button>
                    </div>
                  </div>

                  {frequency === 'specific_days' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {language === 'es' ? 'Seleccionar Días' : 'Select Days'}
                      </label>
                      <div className="flex gap-2">
                        {dayNames[language === 'es' ? 'es' : 'en'].map((day, index) => (
                          <button
                            key={index}
                            onClick={() => toggleDay(index)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              specificDays.includes(index)
                                ? 'bg-[#7C9885] text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Tab */}
              {activeTab === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'es' ? 'Mensaje Personalizado' : 'Custom Message'}
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder={language === 'es' 
                        ? `Ej: ¡Es hora de ${habit.name.toLowerCase()}!` 
                        : `E.g., Time to ${habit.name.toLowerCase()}!`}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#7C9885] focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {language === 'es' 
                        ? 'Deja vacío para usar el mensaje predeterminado' 
                        : 'Leave empty to use the default message'}
                    </p>
                  </div>

                  {/* Motivational Preview */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      {language === 'es' ? 'Mensaje Motivacional de Ejemplo' : 'Sample Motivational Message'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      "{getMotivationalMessage(currentStreak)}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {language === 'es' 
                        ? `Basado en tu racha actual de ${currentStreak} días` 
                        : `Based on your current ${currentStreak}-day streak`}
                    </p>
                  </div>
                </div>
              )}

              {/* Snooze Tab */}
              {activeTab === 'snooze' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'es' ? 'Opciones de Posponer' : 'Snooze Options'}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {language === 'es' 
                        ? 'Selecciona las duraciones de posponer disponibles' 
                        : 'Select available snooze durations'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {snoozePresets.map((preset) => (
                        <button
                          key={preset.minutes}
                          onClick={() => toggleSnoozeOption(preset.minutes)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSnoozeOptions.includes(preset.minutes)
                              ? 'bg-[#7C9885] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlarmClock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          {language === 'es' ? 'Cómo Funciona' : 'How It Works'}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {language === 'es' 
                            ? 'Cuando recibas una notificación, podrás posponerla por cualquiera de estas duraciones. La notificación volverá a aparecer después del tiempo seleccionado.' 
                            : 'When you receive a notification, you can snooze it for any of these durations. The notification will reappear after the selected time.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Button */}
              {notificationsEnabled && (
                <button
                  onClick={handlePreview}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-[#7C9885] hover:text-[#7C9885] transition-colors"
                >
                  {showPreview ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        {language === 'es' ? '¡Notificación Enviada!' : 'Notification Sent!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      <span>{language === 'es' ? 'Vista Previa de Notificación' : 'Preview Notification'}</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {/* Streak Info */}
          {currentStreak > 0 && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <div className="font-medium text-orange-800 dark:text-orange-200">
                  {currentStreak} {language === 'es' ? 'Días de Racha' : 'Day Streak'}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">
                  {language === 'es' 
                    ? '¡Los recordatorios ayudan a proteger tu racha!' 
                    : 'Reminders help protect your streak!'}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            {language === 'es' ? 'Guardar Configuración' : 'Save Reminder Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderSettingsModal;
