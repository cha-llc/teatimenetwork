import React, { useState } from 'react';
import { Twitter, Github, Linkedin, Mail, Heart, Send, CheckCircle, Shield, Lock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const links = {
    product: [
      { label: t.footer.features, href: '#features', isAnchor: true },
      { label: t.footer.pricing, href: '#pricing', isAnchor: true },
      { label: t.footer.howItWorks, href: '#how-it-works', isAnchor: true }
    ],
    support: [
      { label: t.footer.helpCenter, href: 'mailto:support@teatimenetwork.app', isAnchor: false },
      { label: t.footer.contactUs, href: 'mailto:support@teatimenetwork.app', isAnchor: false }
    ],
    legal: [
      { label: t.footer.privacyPolicy, href: '/privacy', isAnchor: false },
      { label: t.footer.termsOfService, href: '/terms', isAnchor: false }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/teatimenetwork', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/teatimenetwork', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/teatimenetwork', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:support@teatimenetwork.app', label: 'Email' }
  ];

  const renderLink = (link: { label: string; href: string; isAnchor: boolean }) => {
    if (link.isAnchor) {
      return (
        <a 
          href={link.href}
          onClick={(e) => {
            e.preventDefault();
            handleNavClick(link.href);
          }}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {link.label}
        </a>
      );
    }
    
    if (link.href.startsWith('mailto:')) {
      return (
        <a 
          href={link.href}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {link.label}
        </a>
      );
    }
    
    return (
      <Link 
        to={link.href}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#7C9885] to-[#5a7a64] rounded-xl flex items-center justify-center">
                <span className="text-lg">🍵</span>
              </div>
              <span className="text-lg font-bold text-white">Tea Time Network</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">
              {t.footer.tagline}
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={i}
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.label}`}
                    className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#7C9885] hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <nav aria-label="Product links">
            <h4 className="text-white font-semibold mb-3 text-sm">{t.footer.product}</h4>
            <ul className="space-y-2">
              {links.product.map((link, i) => (
                <li key={i}>{renderLink(link)}</li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav aria-label="Support links">
            <h4 className="text-white font-semibold mb-3 text-sm">{t.footer.support}</h4>
            <ul className="space-y-2">
              {links.support.map((link, i) => (
                <li key={i}>{renderLink(link)}</li>
              ))}
            </ul>
          </nav>

          {/* Legal Links */}
          <nav aria-label="Legal links">
            <h4 className="text-white font-semibold mb-3 text-sm">{t.footer.legal}</h4>
            <ul className="space-y-2">
              {links.legal.map((link, i) => (
                <li key={i}>{renderLink(link)}</li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Newsletter - Simplified */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold mb-1 text-sm">{t.footer.getHabitTips}</h4>
              <p className="text-gray-400 text-xs">{t.footer.noSpam}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 px-4 py-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.footer.subscribed}</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.footer.enterEmail}
                    required
                    aria-label="Email address for newsletter"
                    className="flex-1 md:w-56 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#7C9885] text-sm"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="px-4 py-2 bg-[#7C9885] text-white rounded-lg font-medium hover:bg-[#6a8673] transition-colors flex items-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    {t.footer.subscribe}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Trust & Security Badges - Addressing Privacy Concerns */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-green-500" />
              <span>{t.footer.ssl}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>{t.footer.gdpr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{t.footer.noDataSelling}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} Tea Time Network. {t.footer.allRightsReserved}
          </p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            {t.footer.madeWith} <Heart className="w-3 h-3 text-red-500 fill-red-500" aria-hidden="true" /> {t.footer.forHabitBuilders}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
