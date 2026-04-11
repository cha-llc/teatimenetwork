import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Language, getBrowserLanguage, LANGUAGES } from '@/lib/languages';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageName: string;
  languageNativeName: string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile, user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('language');
    if (stored && LANGUAGES[stored as Language]) {
      return stored as Language;
    }
    
    // Try to detect from browser
    const browserLang = getBrowserLanguage();
    return browserLang;
  });

  // Sync with profile when it loads
  useEffect(() => {
    if (profile?.language && LANGUAGES[profile.language as Language]) {
      const profileLang = profile.language as Language;
      setLanguageState(profileLang);
      localStorage.setItem('language', profileLang);
      // Update document language attribute for accessibility
      document.documentElement.lang = profileLang;
      document.documentElement.dir = LANGUAGES[profileLang]?.direction || 'ltr';
    }
  }, [profile?.language]);

  const setLanguage = useCallback(async (lang: Language) => {
    // Validate language exists
    if (!LANGUAGES[lang]) {
      console.error(`Language ${lang} not supported`);
      return;
    }

    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update document for accessibility and RTL support
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang]?.direction || 'ltr';
    
    // Update profile if user is logged in
    if (user) {
      try {
        await updateProfile({ language: lang } as any);
      } catch (err) {
        // Language change succeeded locally, even if profile update fails
        console.debug('Language changed locally (profile sync failed)');
      }
    }
  }, [user, updateProfile]);

  const langInfo = LANGUAGES[language];

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        languageName: langInfo?.name || language,
        languageNativeName: langInfo?.nativeName || language,
        direction: langInfo?.direction || 'ltr',
      }}
    >
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
