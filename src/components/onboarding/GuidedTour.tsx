import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Check, Sparkles, 
  Home, Trophy, Users, Brain, Wifi, Globe, 
  Target, Calendar, Settings, Crown, Zap, Heart,
  Swords, Watch, Mic, TreePine, Gamepad2, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
// Current app version - update this when making significant changes
const APP_VERSION = '3.2.0'; // Updated for 30-day trial migration
const TOUR_STORAGE_KEY = 'tea_time_tour_completed';


interface TourStep {
  id: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  icon: React.ReactNode;
  highlight?: string;
  position?: 'center' | 'top' | 'bottom';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to The Tea Time Network! 🍵',
    titleEs: '¡Bienvenido a The Tea Time Network! 🍵',
    description: 'Your journey to building powerful habits starts here. We\'ve built the ultimate discipline ecosystem to help you surpass your goals with AI coaching, gamification, and seamless integrations.',
    descriptionEs: 'Tu viaje para construir hábitos poderosos comienza aquí. Hemos construido el ecosistema de disciplina definitivo para ayudarte a superar tus metas con coaching IA, gamificación e integraciones.',
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Your 30-Day Free Trial',
    titleEs: 'Tu Prueba Gratuita de 30 Días',
    description: 'Welcome! You have 30 days to explore all features free. Create unlimited habits, track completions, and monitor your streaks. No credit card required!',
    descriptionEs: '¡Bienvenido! Tienes 30 días para explorar todas las funciones gratis. Crea hábitos ilimitados, rastrea completados y monitorea tus rachas. ¡Sin tarjeta de crédito!',
    icon: <Home className="w-8 h-8 text-[#7C9885]" />,
    highlight: 'dashboard'
  },

  {
    id: 'momentum-realm',
    title: 'Momentum Realm - Epic Gamification',
    titleEs: 'Reino Momentum - Gamificación Épica',
    description: 'Turn habit building into an adventure! Create your avatar, complete quests, battle chaos monsters (procrastination, distraction), unlock allies/pets, and grow AR habit trees!',
    descriptionEs: '¡Convierte la construcción de hábitos en una aventura! Crea tu avatar, completa misiones, batalla monstruos del caos, desbloquea aliados/mascotas y cultiva árboles AR!',
    icon: <Swords className="w-8 h-8 text-purple-500" />,
    highlight: 'momentum-realm'
  },
  {
    id: 'ai-coach',
    title: 'Advanced AI Coaching',
    titleEs: 'Coaching IA Avanzado',
    description: 'Chat with Sage, your AI coach! Get real-time advice, mood-based adaptations, habit stacking suggestions, "what-if" simulations, and auto-optimization for best times.',
    descriptionEs: '¡Chatea con Sage, tu coach IA! Obtén consejos en tiempo real, adaptaciones basadas en estado de ánimo, sugerencias de apilamiento de hábitos y simulaciones "qué pasaría si".',
    icon: <Brain className="w-8 h-8 text-indigo-500" />,
    highlight: 'ai-coach'
  },
  {
    id: 'predictive-tools',
    title: 'Predictive AI Tools',
    titleEs: 'Herramientas Predictivas IA',
    description: 'Run "what-if" simulations to see consequences of missing habits. Get long-term goal forecasting and personalized discipline blueprints based on your patterns.',
    descriptionEs: 'Ejecuta simulaciones "qué pasaría si" para ver consecuencias. Obtén pronósticos de metas a largo plazo y planos de disciplina personalizados.',
    icon: <Compass className="w-8 h-8 text-violet-500" />,
    highlight: 'predictive'
  },
  {
    id: 'community',
    title: 'Enhanced Community Features',
    titleEs: 'Funciones de Comunidad Mejoradas',
    description: 'Join themed hubs with live events, find mentors, compete in global competitions, challenge friends to "Discipline Duels", and sponsor each other\'s streaks!',
    descriptionEs: '¡Únete a hubs temáticos con eventos en vivo, encuentra mentores, compite en competencias globales, desafía a amigos a "Duelos de Disciplina" y patrocina rachas!',
    icon: <Globe className="w-8 h-8 text-teal-500" />,
    highlight: 'community'
  },
  {
    id: 'integrations',
    title: 'Seamless Integrations',
    titleEs: 'Integraciones Perfectas',
    description: 'Auto-track habits from wearables (Apple Health, Fitbit, Garmin), use voice commands (Alexa, Siri, Google), and trigger smart home automations!',
    descriptionEs: '¡Rastrea hábitos automáticamente desde wearables (Apple Health, Fitbit, Garmin), usa comandos de voz (Alexa, Siri, Google) y activa automatizaciones de hogar inteligente!',
    icon: <Watch className="w-8 h-8 text-blue-500" />,
    highlight: 'integrations'
  },
  {
    id: 'voice-smart-home',
    title: 'Voice & Smart Home',
    titleEs: 'Voz y Hogar Inteligente',
    description: '"Alexa, mark my meditation done" - Control habits hands-free! Set up smart home automations like dimming lights for focus sessions or celebrating completions.',
    descriptionEs: '"Alexa, marca mi meditación como hecha" - ¡Controla hábitos manos libres! Configura automatizaciones como atenuar luces para sesiones de enfoque.',
    icon: <Mic className="w-8 h-8 text-cyan-500" />,
    highlight: 'voice'
  },
  {
    id: 'analytics',
    title: 'Visual Analytics & AI Summaries',
    titleEs: 'Análisis Visual y Resúmenes IA',
    description: 'Interactive charts, progress heatmaps, and AI-narrated summaries. Premium users get lifetime trend forecasts to predict your habit journey!',
    descriptionEs: '¡Gráficos interactivos, mapas de calor y resúmenes narrados por IA. Los usuarios premium obtienen pronósticos de tendencias de por vida!',
    icon: <Calendar className="w-8 h-8 text-blue-500" />,
    highlight: 'analytics'
  },
  {
    id: 'eco-wellness',
    title: 'Eco & Wellness Tie-Ins',
    titleEs: 'Eco y Bienestar',
    description: 'Track sustainable habits with carbon offset donations, access guided mindfulness audio sessions, and earn rewards for eco-friendly choices!',
    descriptionEs: '¡Rastrea hábitos sostenibles con donaciones de compensación de carbono, accede a sesiones de audio de mindfulness y gana recompensas por elecciones ecológicas!',
    icon: <TreePine className="w-8 h-8 text-green-500" />,
    highlight: 'eco-wellness'
  },
  {
    id: 'tokens',
    title: 'Blockchain-Style Token Rewards',
    titleEs: 'Recompensas de Tokens Blockchain',
    description: 'Earn tokens by completing habits and maintaining streaks. Use tokens for community-voted rewards, ensuring fair play and engagement!',
    descriptionEs: '¡Gana tokens completando hábitos y manteniendo rachas. Usa tokens para recompensas votadas por la comunidad, asegurando juego justo!',
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    highlight: 'tokens'
  },
  {
    id: 'premium',
    title: '30-Day Trial Then Premium',
    titleEs: 'Prueba de 30 Días y Luego Premium',
    description: 'Your 30-day free trial includes all features! After that, Premium ($4.99/mo) unlocks advanced analytics, AI summaries, lifetime forecasts, eco tracking, and more.',
    descriptionEs: '¡Tu prueba gratuita de 30 días incluye todas las funciones! Después, Premium ($4.99/mes) desbloquea análisis avanzados, resúmenes IA, pronósticos y más.',
    icon: <Crown className="w-8 h-8 text-amber-500" />,
    highlight: 'premium'
  },

  {
    id: 'complete',
    title: 'You\'re Ready to Surpass Habitica! 🎉',
    titleEs: '¡Estás Listo para Superar Habitica! 🎉',
    description: 'Start by creating your first habit, customizing your avatar in Momentum Realm, or chatting with Sage your AI coach. Your discipline journey begins now!',
    descriptionEs: '¡Comienza creando tu primer hábito, personalizando tu avatar en Reino Momentum, o chateando con Sage tu coach IA. ¡Tu viaje de disciplina comienza ahora!',
    icon: <Gamepad2 className="w-8 h-8 text-yellow-500" />,
    position: 'center'
  }
];




interface GuidedTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ onComplete, forceShow = false }) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if tour should be shown
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const tourData = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourData) {
      // New user - show tour
      setIsVisible(true);
      return;
    }

    try {
      const { version, completed } = JSON.parse(tourData);
      if (!completed || version !== APP_VERSION) {
        // Tour not completed or new version - show tour
        setIsVisible(true);
      }
    } catch {
      // Invalid data - show tour
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
      version: APP_VERSION,
      completed: true,
      completedAt: new Date().toISOString()
    }));
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [currentStep]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isVisible) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') handleSkip();
  }, [isVisible, handleNext, handlePrev, handleSkip]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <div 
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transition-all duration-300 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-[#7C9885] to-[#5a7363] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Close tour"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6 mx-auto">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
            {language === 'es' ? step.titleEs : step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed mb-8">
            {language === 'es' ? step.descriptionEs : step.description}
          </p>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-[#7C9885]' 
                    : index < currentStep 
                      ? 'bg-[#7C9885]/50' 
                      : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`flex items-center gap-2 ${isFirstStep ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
              {language === 'es' ? 'Anterior' : 'Previous'}
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7363] hover:opacity-90 text-white px-6"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'es' ? 'Comenzar' : 'Get Started'}
                </>
              ) : (
                <>
                  {language === 'es' ? 'Siguiente' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-4"
            >
              {language === 'es' ? 'Saltar tour' : 'Skip tour'}
            </button>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
          {language === 'es' 
            ? 'Usa las flechas ← → para navegar, Esc para saltar'
            : 'Use arrow keys ← → to navigate, Esc to skip'}
        </div>
      </div>
    </div>
  );
};

// Hook to manually trigger the tour
export const useTour = () => {
  const [showTour, setShowTour] = useState(false);

  const startTour = useCallback(() => {
    setShowTour(true);
  }, []);

  const endTour = useCallback(() => {
    setShowTour(false);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setShowTour(true);
  }, []);

  return { showTour, startTour, endTour, resetTour };
};

export default GuidedTour;
