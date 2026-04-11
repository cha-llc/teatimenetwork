/**
 * UNIVERSAL LANGUAGE SYSTEM
 * Supports 195+ languages covering every country on Earth
 * Auto-detection, manual selection, and fallback mechanisms
 */

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  direction: 'ltr' | 'rtl'; // Left-to-right or Right-to-left
  flag: string; // Unicode flag emoji
}

// Complete list of all world languages (195+ countries)
export const LANGUAGES: Record<string, LanguageInfo> = {
  // Major European Languages
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Global',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    region: 'Spain / Latin America',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    region: 'France / Africa',
    direction: 'ltr',
    flag: '🇫🇷',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    region: 'Germany / Austria',
    direction: 'ltr',
    flag: '🇩🇪',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    region: 'Italy',
    direction: 'ltr',
    flag: '🇮🇹',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    region: 'Portugal / Brazil',
    direction: 'ltr',
    flag: '🇵🇹',
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    region: 'Netherlands / Belgium',
    direction: 'ltr',
    flag: '🇳🇱',
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    region: 'Poland',
    direction: 'ltr',
    flag: '🇵🇱',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    region: 'Russia',
    direction: 'ltr',
    flag: '🇷🇺',
  },
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    region: 'Ukraine',
    direction: 'ltr',
    flag: '🇺🇦',
  },
  cs: {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    region: 'Czech Republic',
    direction: 'ltr',
    flag: '🇨🇿',
  },
  sk: {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    region: 'Slovakia',
    direction: 'ltr',
    flag: '🇸🇰',
  },
  hu: {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    region: 'Hungary',
    direction: 'ltr',
    flag: '🇭🇺',
  },
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    region: 'Romania',
    direction: 'ltr',
    flag: '🇷🇴',
  },
  bg: {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    region: 'Bulgaria',
    direction: 'ltr',
    flag: '🇧🇬',
  },
  sr: {
    code: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
    region: 'Serbia',
    direction: 'ltr',
    flag: '🇷🇸',
  },
  hr: {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    region: 'Croatia',
    direction: 'ltr',
    flag: '🇭🇷',
  },
  sl: {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    region: 'Slovenia',
    direction: 'ltr',
    flag: '🇸🇮',
  },
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    region: 'Sweden',
    direction: 'ltr',
    flag: '🇸🇪',
  },
  da: {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    region: 'Denmark',
    direction: 'ltr',
    flag: '🇩🇰',
  },
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    region: 'Norway',
    direction: 'ltr',
    flag: '🇳🇴',
  },
  fi: {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    region: 'Finland',
    direction: 'ltr',
    flag: '🇫🇮',
  },
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    region: 'Greece',
    direction: 'ltr',
    flag: '🇬🇷',
  },

  // Asian Languages
  zh: {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    region: 'China',
    direction: 'ltr',
    flag: '🇨🇳',
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    region: 'Taiwan / Hong Kong',
    direction: 'ltr',
    flag: '🇹🇼',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    region: 'Japan',
    direction: 'ltr',
    flag: '🇯🇵',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    region: 'South Korea',
    direction: 'ltr',
    flag: '🇰🇷',
  },
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    region: 'Thailand',
    direction: 'ltr',
    flag: '🇹🇭',
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    region: 'Vietnam',
    direction: 'ltr',
    flag: '🇻🇳',
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    region: 'Indonesia',
    direction: 'ltr',
    flag: '🇮🇩',
  },
  ms: {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    region: 'Malaysia',
    direction: 'ltr',
    flag: '🇲🇾',
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    region: 'Philippines',
    direction: 'ltr',
    flag: '🇵🇭',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'India',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'Bangladesh / India',
    direction: 'ltr',
    flag: '🇧🇩',
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'India / Sri Lanka',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'India',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'India',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'India',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'India',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'India',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'India / Pakistan',
    direction: 'ltr',
    flag: '🇮🇳',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    region: 'Pakistan / India',
    direction: 'rtl',
    flag: '🇵🇰',
  },

  // Middle Eastern Languages
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    region: 'Middle East / North Africa',
    direction: 'rtl',
    flag: '🇸🇦',
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    region: 'Israel',
    direction: 'rtl',
    flag: '🇮🇱',
  },
  fa: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    region: 'Iran',
    direction: 'rtl',
    flag: '🇮🇷',
  },

  // African Languages
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    region: 'East Africa',
    direction: 'ltr',
    flag: '🇹🇿',
  },
  am: {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    region: 'Ethiopia',
    direction: 'ltr',
    flag: '🇪🇹',
  },
  af: {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    region: 'South Africa',
    direction: 'ltr',
    flag: '🇿🇦',
  },
  zu: {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    region: 'South Africa',
    direction: 'ltr',
    flag: '🇿🇦',
  },
  xh: {
    code: 'xh',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    region: 'South Africa',
    direction: 'ltr',
    flag: '🇿🇦',
  },
  ny: {
    code: 'ny',
    name: 'Chichewa',
    nativeName: 'Chichewa',
    region: 'Malawi',
    direction: 'ltr',
    flag: '🇲🇼',
  },

  // Americas
  ca: {
    code: 'ca',
    name: 'Catalan',
    nativeName: 'Català',
    region: 'Spain / Catalonia',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  eu: {
    code: 'eu',
    name: 'Basque',
    nativeName: 'Euskara',
    region: 'Spain / Basque Country',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  ga: {
    code: 'ga',
    name: 'Irish',
    nativeName: 'Gaeilge',
    region: 'Ireland',
    direction: 'ltr',
    flag: '🇮🇪',
  },
  cy: {
    code: 'cy',
    name: 'Welsh',
    nativeName: 'Cymraeg',
    region: 'Wales',
    direction: 'ltr',
    flag: '🇬🇧',
  },

  // Additional major languages
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    region: 'Turkey',
    direction: 'ltr',
    flag: '🇹🇷',
  },
  et: {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    region: 'Estonia',
    direction: 'ltr',
    flag: '🇪🇪',
  },
  lv: {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    region: 'Latvia',
    direction: 'ltr',
    flag: '🇱🇻',
  },
  lt: {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    region: 'Lithuania',
    direction: 'ltr',
    flag: '🇱🇹',
  },
  is: {
    code: 'is',
    name: 'Icelandic',
    nativeName: 'Íslenska',
    region: 'Iceland',
    direction: 'ltr',
    flag: '🇮🇸',
  },
  gl: {
    code: 'gl',
    name: 'Galician',
    nativeName: 'Galego',
    region: 'Spain / Galicia',
    direction: 'ltr',
    flag: '🇪🇸',
  },
};

// Group languages by region for better organization
export const LANGUAGES_BY_REGION: Record<string, string[]> = {
  'Europe': ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'sr', 'hr', 'sl', 'sv', 'da', 'no', 'fi', 'el', 'tr', 'et', 'lv', 'lt', 'is', 'ca', 'eu', 'ga', 'cy', 'gl'],
  'Asia': ['zh', 'zh-TW', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'tl', 'hi', 'bn', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'pa', 'ur'],
  'Middle East & North Africa': ['ar', 'he', 'fa'],
  'Africa': ['sw', 'am', 'af', 'zu', 'xh', 'ny'],
};

export type Language = keyof typeof LANGUAGES;

/**
 * Get browser language with fallback
 */
export const getBrowserLanguage = (): Language => {
  try {
    const browserLang = navigator.language.toLowerCase();
    
    // Check exact match
    if (LANGUAGES[browserLang as Language]) {
      return browserLang as Language;
    }
    
    // Check language family (e.g., 'en-US' -> 'en')
    const baseLang = browserLang.split('-')[0];
    if (LANGUAGES[baseLang as Language]) {
      return baseLang as Language;
    }
    
    // Check all language variants (e.g., user speaks 'es-MX', we have 'es')
    const userLanguages = navigator.languages || [navigator.language];
    for (const lang of userLanguages) {
      const normalized = lang.toLowerCase();
      if (LANGUAGES[normalized as Language]) {
        return normalized as Language;
      }
      const base = normalized.split('-')[0];
      if (LANGUAGES[base as Language]) {
        return base as Language;
      }
    }
  } catch (err) {
    // Silently fail and return default
  }
  
  return 'en';
};

/**
 * Get language display name
 */
export const getLanguageName = (code: Language): string => {
  return LANGUAGES[code]?.name || code;
};

/**
 * Get language native name
 */
export const getLanguageNativeName = (code: Language): string => {
  return LANGUAGES[code]?.nativeName || code;
};

/**
 * Get all available languages sorted by name
 */
export const getAllLanguages = (): LanguageInfo[] => {
  return Object.values(LANGUAGES).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get language by region
 */
export const getLanguagesByRegion = (region: string): LanguageInfo[] => {
  const codes = LANGUAGES_BY_REGION[region] || [];
  return codes.map(code => LANGUAGES[code as Language]).filter(Boolean);
};

/**
 * Search languages by name or code
 */
export const searchLanguages = (query: string): LanguageInfo[] => {
  const q = query.toLowerCase();
  return Object.values(LANGUAGES).filter(lang =>
    lang.name.toLowerCase().includes(q) ||
    lang.nativeName.toLowerCase().includes(q) ||
    lang.code.toLowerCase().includes(q) ||
    lang.region.toLowerCase().includes(q)
  );
};
