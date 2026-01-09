import React from 'react';
import { Clock, Crown, AlertTriangle, Gift, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrialBannerProps {
  daysRemaining: number;
  isExpired: boolean;
  onUpgrade: () => void;
  trialStartDate?: Date | null;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ daysRemaining, isExpired, onUpgrade, trialStartDate }) => {
  const { language } = useLanguage();

  // Show expired banner
  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <p className="text-sm text-center sm:text-left font-medium">
                {language === 'es' 
                  ? '¡Tu prueba gratuita de 30 días ha terminado! Actualiza para seguir rastreando tus hábitos.'
                  : 'Your 30-day free trial has ended! Upgrade to continue tracking your habits.'}
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100 px-4 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm"
            >
              <Crown className="w-4 h-4" />
              {language === 'es' ? 'Actualizar a $4.99/mes' : 'Upgrade for $4.99/mo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show trial countdown banner
  const isUrgent = daysRemaining <= 7;
  const isVeryUrgent = daysRemaining <= 3;
  const isNewTrial = daysRemaining >= 28; // Just started (within first 2 days)

  // Welcome message for new/migrated users
  if (isNewTrial) {
    return (
      <div className="bg-gradient-to-r from-[#7C9885] to-emerald-600 text-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </div>
              <div className="text-sm text-center sm:text-left">
                <span className="font-medium">
                  {language === 'es' 
                    ? '¡Bienvenido a tu prueba gratuita de 30 días!'
                    : 'Welcome to your 30-day free trial!'}
                </span>
                <span className="hidden sm:inline ml-2 text-white/90">
                  {language === 'es' 
                    ? 'Disfruta de todas las funciones premium sin límites.'
                    : 'Enjoy all premium features with no limits.'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4 text-xs text-white/90">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> 
                  {language === 'es' ? 'Hábitos ilimitados' : 'Unlimited habits'}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> 
                  {language === 'es' ? 'Coach de IA' : 'AI Coach'}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> 
                  {language === 'es' ? 'Todas las funciones' : 'All features'}
                </span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                {daysRemaining} {language === 'es' ? 'días restantes' : 'days left'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      isVeryUrgent 
        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
        : isUrgent 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
          : 'bg-gradient-to-r from-[#7C9885] to-emerald-600'
    } text-white`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-pulse" />
            ) : (
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            )}
            <p className="text-sm text-center sm:text-left">
              {isVeryUrgent ? (
                language === 'es' 
                  ? `¡Solo quedan ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}! Actualiza ahora para no perder tu progreso.`
                  : `Only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left! Upgrade now to keep your progress.`
              ) : isUrgent ? (
                language === 'es' 
                  ? `Tu prueba termina en ${daysRemaining} días. ¡Actualiza para funciones avanzadas!`
                  : `Your trial ends in ${daysRemaining} days. Upgrade for advanced features!`
              ) : (
                language === 'es' 
                  ? `Prueba gratuita: ${daysRemaining} días restantes. ¡Disfruta todas las funciones!`
                  : `Free trial: ${daysRemaining} days remaining. Enjoy all features!`
              )}
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className={`flex items-center gap-2 ${
              isUrgent 
                ? 'bg-white text-orange-600 hover:bg-gray-100' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            } px-4 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm`}
          >
            <Crown className="w-4 h-4" />
            {isUrgent 
              ? (language === 'es' ? 'Actualizar Ahora' : 'Upgrade Now')
              : (language === 'es' ? 'Ver Planes' : 'View Plans')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;
