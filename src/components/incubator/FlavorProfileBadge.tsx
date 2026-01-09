import React from 'react';
import { FlavorProfile } from '@/hooks/useIncubator';
import { useLanguage } from '@/contexts/LanguageContext';

interface FlavorProfileBadgeProps {
  flavor: FlavorProfile;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const flavorConfig: Record<FlavorProfile, {
  icon: string;
  gradient: string;
  bgColor: string;
  textColor: string;
  labelEn: string;
  labelEs: string;
  descriptionEn: string;
  descriptionEs: string;
}> = {
  mild: {
    icon: '🍃',
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    labelEn: 'Mild',
    labelEs: 'Suave',
    descriptionEn: 'Easy to start, gentle habits',
    descriptionEs: 'Fácil de empezar, hábitos suaves'
  },
  medium: {
    icon: '🌿',
    gradient: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-700 dark:text-teal-300',
    labelEn: 'Medium',
    labelEs: 'Medio',
    descriptionEn: 'Balanced challenge level',
    descriptionEs: 'Nivel de desafío equilibrado'
  },
  spicy: {
    icon: '🌶️',
    gradient: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    labelEn: 'Spicy',
    labelEs: 'Picante',
    descriptionEn: 'Challenging, requires commitment',
    descriptionEs: 'Desafiante, requiere compromiso'
  },
  bold: {
    icon: '⚡',
    gradient: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    labelEn: 'Bold',
    labelEs: 'Audaz',
    descriptionEn: 'Intense, transformative habits',
    descriptionEs: 'Hábitos intensos y transformadores'
  },
  exotic: {
    icon: '✨',
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-700 dark:text-pink-300',
    labelEn: 'Exotic',
    labelEs: 'Exótico',
    descriptionEn: 'Unique, unconventional approaches',
    descriptionEs: 'Enfoques únicos y poco convencionales'
  }
};

export function FlavorProfileBadge({ flavor, size = 'md', showLabel = true }: FlavorProfileBadgeProps) {
  const { language } = useLanguage();
  const config = flavorConfig[flavor];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const label = language === 'es' ? config.labelEs : config.labelEn;

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
      title={language === 'es' ? config.descriptionEs : config.descriptionEn}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}

export function FlavorProfileSelector({ 
  value, 
  onChange 
}: { 
  value: FlavorProfile; 
  onChange: (flavor: FlavorProfile) => void;
}) {
  const { language } = useLanguage();
  const flavors: FlavorProfile[] = ['mild', 'medium', 'spicy', 'bold', 'exotic'];

  return (
    <div className="grid grid-cols-5 gap-2">
      {flavors.map(flavor => {
        const config = flavorConfig[flavor];
        const isSelected = value === flavor;
        const label = language === 'es' ? config.labelEs : config.labelEn;

        return (
          <button
            key={flavor}
            type="button"
            onClick={() => onChange(flavor)}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
              isSelected 
                ? `border-transparent bg-gradient-to-br ${config.gradient} text-white shadow-lg scale-105` 
                : `border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ${config.bgColor}`
            }`}
          >
            <span className="text-2xl mb-1">{config.icon}</span>
            <span className={`text-xs font-medium ${isSelected ? 'text-white' : config.textColor}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TeaPotVisual({ 
  status, 
  steepProgress 
}: { 
  status: 'steeping' | 'testing' | 'evolved' | 'immortal';
  steepProgress: number; // 0-100
}) {
  const getTeaColor = () => {
    switch (status) {
      case 'steeping': return 'from-amber-200 to-amber-400';
      case 'testing': return 'from-teal-300 to-cyan-400';
      case 'evolved': return 'from-purple-300 to-indigo-400';
      case 'immortal': return 'from-yellow-300 via-amber-400 to-orange-400';
      default: return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <div className="relative w-24 h-24">
      {/* Teapot body */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Pot body */}
          <div className="w-16 h-14 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-b-full rounded-t-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
            {/* Tea liquid */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getTeaColor()} transition-all duration-1000`}
              style={{ height: `${steepProgress}%` }}
            />
            {/* Steam bubbles for steeping */}
            {status === 'steeping' && (
              <>
                <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="absolute top-2 right-3 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-1 left-1/2 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
              </>
            )}
          </div>
          {/* Handle */}
          <div className="absolute -right-3 top-2 w-3 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-r-full" />
          {/* Spout */}
          <div className="absolute -left-2 top-3 w-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-l-full border-2 border-gray-300 dark:border-gray-600 border-r-0" />
          {/* Lid */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
        </div>
      </div>
      
      {/* Steam for evolved/immortal */}
      {(status === 'evolved' || status === 'immortal') && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-gradient-to-t from-gray-300 to-transparent rounded-full animate-pulse opacity-60" />
            <div className="w-1 h-6 bg-gradient-to-t from-gray-300 to-transparent rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-4 bg-gradient-to-t from-gray-300 to-transparent rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      {/* Immortal glow */}
      {status === 'immortal' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 rounded-full animate-pulse" />
      )}
    </div>
  );
}
