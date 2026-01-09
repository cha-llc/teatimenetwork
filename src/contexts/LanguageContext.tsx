import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile, user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'es') {
      return stored;
    }
    // Try to detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      return 'es';
    }
    return 'en';
  });

  // Sync with profile when it loads
  useEffect(() => {
    if (profile?.language && (profile.language === 'en' || profile.language === 'es')) {
      setLanguageState(profile.language as Language);
      localStorage.setItem('language', profile.language);
    }
  }, [profile?.language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update profile if user is logged in
    if (user) {
      try {
        await updateProfile({ language: lang } as any);
      } catch (err) {
        console.error('Failed to update language preference:', err);
      }
    }
  }, [user, updateProfile]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
