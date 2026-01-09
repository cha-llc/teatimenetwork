import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  structuredData?: object;
  language?: 'en' | 'es';
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Tea Time Network | Build Better Habits & Transform Your Life',
  description = 'Transform your daily routines into lasting habits with AI-powered coaching, streak tracking, gamification, and community challenges. Start your 30-day free trial!',
  keywords = 'habit tracker, discipline app, habit building, daily routines, streak tracking, productivity app, self-improvement, Tea Time Network',
  canonicalUrl,
  ogImage = 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766858009056_ceb713ef.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
  language = 'en'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let element = document.querySelector(selector);
      
      if (element) {
        element.setAttribute('href', href);
      } else {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('href', href);
        if (hreflang) element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
    };

    // Update primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:locale', language === 'es' ? 'es_ES' : 'en_US', true);
    
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true);
      updateLinkTag('canonical', canonicalUrl);
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update language
    document.documentElement.lang = language;

    // Add structured data if provided
    if (structuredData) {
      const existingScript = document.querySelector('script[data-seo-structured]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-structured', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const structuredScript = document.querySelector('script[data-seo-structured]');
      if (structuredScript) {
        structuredScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, twitterCard, noIndex, structuredData, language]);

  return null; // This component doesn't render anything
};

export default SEOHead;


// SEO configuration for different pages
export const SEO_CONFIG = {
  home: {
    title: 'Tea Time Network | Build Better Habits & Transform Your Life',
    description: 'Transform your daily routines into lasting habits with AI-powered coaching, streak tracking, gamification, and community challenges. Start your 30-day free trial!',
    keywords: 'habit tracker, discipline app, habit building, daily routines, streak tracking, productivity app, self-improvement, goal setting, AI coaching, Tea Time Network'
  },
  analytics: {
    title: 'Analytics & Progress Tracking | Tea Time Network',
    description: 'Track your habit progress with detailed analytics, completion trends, and AI-powered insights. Visualize your journey to better habits.',
    keywords: 'habit analytics, progress tracking, habit statistics, completion rates, streak analysis, habit insights, Tea Time Network'
  },
  categories: {
    title: 'Habit Categories | Tea Time Network',
    description: 'Organize your habits into custom categories. Track health, fitness, productivity, mindfulness, and more with personalized categorization.',
    keywords: 'habit categories, habit organization, health habits, fitness habits, productivity habits, mindfulness, Tea Time Network'
  },
  templates: {
    title: 'Habit Templates | Tea Time Network',
    description: 'Start with proven habit templates created by experts. Morning routines, fitness plans, productivity systems, and more.',
    keywords: 'habit templates, morning routine, fitness plan, productivity system, habit presets, routine templates, Tea Time Network'
  },
  achievements: {
    title: 'Achievements & Gamification | Tea Time Network',
    description: 'Earn badges, unlock achievements, and climb the leaderboard. Make habit building fun with gamification features.',
    keywords: 'habit achievements, gamification, badges, leaderboard, habit rewards, streak rewards, Tea Time Network'
  },
  insights: {
    title: 'AI Insights & Coaching | Tea Time Network',
    description: 'Get personalized AI-powered insights and coaching to optimize your habits. Receive smart recommendations based on your patterns.',
    keywords: 'AI coaching, habit insights, personalized recommendations, habit optimization, smart suggestions, Tea Time Network'
  },
  challenges: {
    title: 'Community Challenges | Tea Time Network',
    description: 'Join community challenges and compete with others to build better habits. Weekly challenges, group goals, and friendly competition.',
    keywords: 'habit challenges, community challenges, group habits, habit competition, weekly challenges, Tea Time Network'
  },
  teams: {
    title: 'Team Habits & Accountability | Tea Time Network',
    description: 'Build habits together with your team. Create group challenges, track team progress, and hold each other accountable.',
    keywords: 'team habits, accountability partners, group habits, team challenges, collaborative habits, Tea Time Network'
  },
  community: {
    title: 'Community Hub | Tea Time Network',
    description: 'Connect with fellow habit builders. Share tips, join discussions, find mentors, and participate in community events.',
    keywords: 'habit community, habit forum, habit mentors, community events, habit discussions, Tea Time Network'
  },
  accountability: {
    title: 'Accountability Partners | Tea Time Network',
    description: 'Find accountability partners to stay on track. Share progress, send encouragement, and build habits together.',
    keywords: 'accountability partners, habit partners, mutual accountability, habit support, Tea Time Network'
  },
  neuroFeedback: {
    title: 'Neuro Feedback & Brain Training | Tea Time Network',
    description: 'Optimize your habits with neuro feedback integration. Track brain states, correlate with habits, and enhance focus.',
    keywords: 'neuro feedback, brain training, focus tracking, meditation habits, mindfulness tracking, Tea Time Network'
  },
  momentumRealm: {
    title: 'Momentum Realm | Tea Time Network',
    description: 'Enter the Momentum Realm - a gamified world where your habits power your avatar. Complete quests, battle monsters, and level up.',
    keywords: 'habit game, gamified habits, habit quests, avatar habits, habit RPG, Tea Time Network'
  },
  incubator: {
    title: 'Habit Incubator | Tea Time Network',
    description: 'Experiment with new habits in the incubator. Test, refine, and graduate habits to your main routine.',
    keywords: 'habit incubator, new habits, habit experiments, habit testing, habit development, Tea Time Network'
  },
  smartEcosystem: {
    title: 'Smart Ecosystem & IoT | Tea Time Network',
    description: 'Connect your smart devices to automate habit tracking. IoT integration, geo-fencing, and smart triggers.',
    keywords: 'smart habits, IoT habits, automated tracking, smart home habits, geo-fencing, Tea Time Network'
  },
  userProfile: {
    title: 'User Profile | Tea Time Network',
    description: 'View user achievements, badges, streak statistics, and public habits on Tea Time Network.',
    keywords: 'user profile, habit achievements, streak statistics, public habits, Tea Time Network'
  }
};

// Helper function to generate page-specific structured data
export const generatePageStructuredData = (page: keyof typeof SEO_CONFIG, url: string) => {
  const config = SEO_CONFIG[page];
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.title,
    description: config.description,
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Tea Time Network',
      url: 'https://teatimenetwork.com'
    },
    provider: {
      '@type': 'Organization',
      name: 'Tea Time Network',
      url: 'https://teatimenetwork.com'
    }
  };
};

// Helper function to generate Person schema for user profiles
export const generatePersonSchema = (user: {
  name: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  twitterHandle?: string | null;
  website?: string | null;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    alternateName: user.username,
    description: user.bio || `${user.name}'s habit tracking profile on Tea Time Network`,
    url: `https://teatimenetwork.com/user/${user.username}`,
    image: user.avatarUrl || undefined,
    sameAs: [
      user.twitterHandle ? `https://twitter.com/${user.twitterHandle}` : null,
      user.website || null
    ].filter(Boolean),
    memberOf: {
      '@type': 'Organization',
      name: 'Tea Time Network',
      url: 'https://teatimenetwork.com'
    }
  };
};

// Helper function to generate ProfilePage schema
export const generateProfilePageSchema = (user: {
  name: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  achievements?: number;
  streaks?: number;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: user.name,
      alternateName: user.username,
      description: user.bio || `${user.name}'s habit tracking profile`,
      image: user.avatarUrl || undefined
    },
    name: `${user.name}'s Profile`,
    description: `View ${user.name}'s habit tracking achievements, ${user.achievements || 0} badges earned, and ${user.streaks || 0} active streaks on Tea Time Network.`,
    url: `https://teatimenetwork.com/user/${user.username}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Tea Time Network',
      url: 'https://teatimenetwork.com'
    }
  };
};
