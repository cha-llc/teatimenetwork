import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import SEOHead, { SEO_CONFIG, generatePageStructuredData } from '@/components/seo/SEOHead';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <SEOHead 
        {...SEO_CONFIG.home}
        canonicalUrl="https://teatimenetwork.com/"
        structuredData={generatePageStructuredData('home', 'https://teatimenetwork.com/')}
      />
      <AppLayout />
    </AppProvider>
  );
};

export default Index;
