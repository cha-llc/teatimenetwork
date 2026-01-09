import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignIn, onSignUp }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simplified navigation - only 3 essential links
  const navLinks = [
    { label: language === 'es' ? 'Cómo Funciona' : 'How It Works', href: '#how-it-works' },
    { label: language === 'es' ? 'Características' : 'Features', href: '#features' },
    { label: language === 'es' ? 'Precios' : 'Pricing', href: '#pricing' }
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center gap-2"
            aria-label="Tea Time Network - Home"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#7C9885] to-[#5a7a64] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg" role="img" aria-label="Tea cup">🍵</span>
            </div>
            <span className="text-lg font-bold text-gray-800 hidden sm:block">Tea Time Network</span>
          </a>

          {/* Desktop Navigation - Simplified */}
          <nav 
            className="hidden lg:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-gray-600 hover:text-[#7C9885] font-medium transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Switcher - Compact */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
            >
              {language === 'en' ? 'ES' : 'EN'}
            </button>

            {/* Sign In Button */}
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-600 font-medium hover:text-[#7C9885] transition-colors text-sm"
              aria-label="Sign in to your account"
            >
              <LogIn className="w-4 h-4" />
              {language === 'es' ? 'Entrar' : 'Sign In'}
            </button>

            {/* Start Free Trial Button - MOST PROMINENT */}
            <button
              onClick={onSignUp}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#7C9885]/20 transition-all"
              aria-label="Start your 30-day free trial"
            >
              <Gift className="w-4 h-4" />
              {language === 'es' ? '30 Días Gratis' : '30 Days Free'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Mobile navigation">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="block py-3 text-gray-600 hover:text-[#7C9885] font-medium border-b border-gray-100"
              >
                {link.label}
              </a>
            ))}
            
            <div className="flex flex-col gap-3 pt-4">
              {/* Mobile Sign In Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSignIn();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
              </button>
              
              {/* Mobile Start Free Trial Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSignUp();
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white px-6 py-3 rounded-xl font-semibold"
              >
                <Gift className="w-4 h-4" />
                {language === 'es' ? '30 Días Gratis' : '30 Days Free'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
