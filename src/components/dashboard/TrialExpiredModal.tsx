import React, { useState } from 'react';
import { X, Crown, Check, Lock, Eye, Gift, Clock, Sparkles, Brain, Zap, MessageSquare, AlertCircle, TrendingUp, Users } from 'lucide-react';
import SubscriptionModal from '@/components/payment/SubscriptionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueViewOnly: () => void;
}

const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ isOpen, onClose, onContinueViewOnly }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { language } = useLanguage();
  const { profile } = useAuth();

  if (!isOpen) return null;

  // Calculate trial dates for display
  const trialStartDate = profile?.trial_started_at 
    ? new Date(profile.trial_started_at)
    : null;
  const trialEndDate = trialStartDate 
    ? new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const premiumFeatures = [
    { 
      text: language === 'es' ? 'Rastreo ilimitado de hábitos' : 'Unlimited habit tracking',
      icon: Check
    },
    { 
      text: language === 'es' ? 'Historial completo de 1 año' : 'Full 1-year history',
      icon: Clock
    },
    { 
      text: language === 'es' ? 'Análisis avanzados e insights' : 'Advanced analytics & insights',
      icon: TrendingUp
    },
    { 
      text: language === 'es' ? 'Resúmenes narrados por IA' : 'AI-narrated summaries',
      icon: Brain
    },
    { 
      text: language === 'es' ? 'Coach personal de IA (Sage)' : 'Personal AI coach (Sage)',
      icon: MessageSquare
    },
    { 
      text: language === 'es' ? 'Desafíos comunitarios' : 'Community challenges',
      icon: Users
    },
    { 
      text: language === 'es' ? 'Exportar tus datos' : 'Export your data',
      icon: Zap
    }
  ];

  const viewOnlyLimitations = [
    language === 'es' ? 'No puedes crear nuevos hábitos' : "Can't create new habits",
    language === 'es' ? 'No puedes marcar hábitos como completados' : "Can't mark habits as complete",
    language === 'es' ? 'No puedes editar hábitos existentes' : "Can't edit existing habits",
    language === 'es' ? 'Sin acceso a funciones de IA' : 'No access to AI features',
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 px-8 py-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'es' ? 'Tu Prueba de 30 Días Ha Terminado' : 'Your 30-Day Trial Has Ended'}
            </h2>
            <p className="text-white/90">
              {language === 'es' 
                ? 'Actualiza a Premium para continuar tu viaje de disciplina'
                : 'Upgrade to Premium to continue your discipline journey'}
            </p>
            
            {/* Trial period info */}
            {trialStartDate && trialEndDate && (
              <div className="mt-4 bg-white/10 rounded-xl px-4 py-2 inline-block">
                <p className="text-sm text-white/80">
                  {language === 'es' ? 'Período de prueba:' : 'Trial period:'}{' '}
                  <span className="font-medium text-white">
                    {formatDate(trialStartDate)} - {formatDate(trialEndDate)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Special offer badge */}
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
                <Gift className="w-4 h-4" />
                {language === 'es' ? 'Oferta Especial de Lanzamiento' : 'Special Launch Offer'}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$4.99</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                {language === 'es' 
                  ? 'Cancela en cualquier momento, sin preguntas'
                  : 'Cancel anytime, no questions asked'}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {premiumFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-gradient-to-r from-[#7C9885] to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              {language === 'es' ? 'Actualizar a Premium' : 'Upgrade to Premium'}
            </button>

            {/* View-only mode section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-2">
                      {language === 'es' ? 'Modo Solo Lectura' : 'View-Only Mode Limitations'}
                    </p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                      {viewOnlyLimitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <X className="w-3 h-3" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={onContinueViewOnly}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {language === 'es' ? 'Continuar en modo solo lectura' : 'Continue in view-only mode'}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <SubscriptionModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        selectedTier="starter"
      />
    </>
  );
};

export default TrialExpiredModal;
