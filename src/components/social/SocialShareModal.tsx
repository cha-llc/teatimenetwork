import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Twitter, Facebook, Linkedin, Copy, CheckCircle, Flame, Trophy, Target, Calendar, Sparkles, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Habit, Streak } from '@/hooks/useHabits';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit;
  streak?: Streak;
  completionRate?: number;
  shareType: 'streak' | 'achievement' | 'milestone';
  achievementTitle?: string;
  achievementDescription?: string;
}

const motivationalQuotes = [
  "Small steps lead to big changes!",
  "Consistency is the key to success!",
  "Building habits, building a better me!",
  "Every day is a chance to improve!",
  "Progress, not perfection!",
  "One habit at a time, one day at a time!",
  "Discipline is choosing what you want most over what you want now!",
  "Success is the sum of small efforts repeated daily!",
];

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  habit,
  streak,
  completionRate = 0,
  shareType,
  achievementTitle,
  achievementDescription,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [cardStyle, setCardStyle] = useState<'gradient' | 'dark' | 'light'>('gradient');
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  useEffect(() => {
    if (isOpen) {
      setSelectedQuote(Math.floor(Math.random() * motivationalQuotes.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getShareText = () => {
    let text = '';
    
    if (shareType === 'streak' && habit) {
      text = customMessage || (language === 'es'
        ? `¡${currentStreak} días de racha en "${habit.name}"! 🔥 ${motivationalQuotes[selectedQuote]}`
        : `${currentStreak} day streak on "${habit.name}"! 🔥 ${motivationalQuotes[selectedQuote]}`);
    } else if (shareType === 'achievement') {
      text = customMessage || (language === 'es'
        ? `¡Logro desbloqueado: ${achievementTitle}! 🏆 ${motivationalQuotes[selectedQuote]}`
        : `Achievement unlocked: ${achievementTitle}! 🏆 ${motivationalQuotes[selectedQuote]}`);
    } else if (shareType === 'milestone') {
      text = customMessage || (language === 'es'
        ? `¡Hito alcanzado! ${achievementDescription} 🎯 ${motivationalQuotes[selectedQuote]}`
        : `Milestone reached! ${achievementDescription} 🎯 ${motivationalQuotes[selectedQuote]}`);
    }
    
    return text + '\n\n#HabitTracker #PersonalGrowth #Discipline';
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=&summary=${text}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getCardBackground = () => {
    switch (cardStyle) {
      case 'gradient':
        return 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600';
      case 'dark':
        return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900';
      case 'light':
        return 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
      default:
        return 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600';
    }
  };

  const getTextColor = () => {
    return cardStyle === 'light' ? 'text-gray-800' : 'text-white';
  };

  const getSubTextColor = () => {
    return cardStyle === 'light' ? 'text-gray-600' : 'text-white/80';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {language === 'es' ? 'Compartir Logro' : 'Share Achievement'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' ? 'Celebra tu progreso' : 'Celebrate your progress'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Card Preview */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              {language === 'es' ? 'Vista Previa' : 'Preview'}
            </h3>
            <div 
              ref={cardRef}
              className={`${getCardBackground()} rounded-2xl p-6 shadow-xl`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className={`w-4 h-4 ${getTextColor()}`} />
                  </div>
                  <span className={`font-semibold ${getTextColor()}`}>Habit Tracker</span>
                </div>
                <div className={`px-3 py-1 bg-white/20 rounded-full text-sm ${getTextColor()}`}>
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Main Content */}
              {shareType === 'streak' && habit && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4">
                    <Flame className={`w-10 h-10 ${cardStyle === 'light' ? 'text-orange-500' : 'text-orange-400'}`} />
                  </div>
                  <h3 className={`text-4xl font-bold ${getTextColor()} mb-2`}>
                    {currentStreak} {language === 'es' ? 'Días' : 'Days'}
                  </h3>
                  <p className={`text-lg ${getSubTextColor()} mb-4`}>{habit.name}</p>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getTextColor()}`}>{longestStreak}</p>
                      <p className={`text-xs ${getSubTextColor()}`}>
                        {language === 'es' ? 'Mejor Racha' : 'Best Streak'}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-white/30" />
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getTextColor()}`}>{completionRate}%</p>
                      <p className={`text-xs ${getSubTextColor()}`}>
                        {language === 'es' ? 'Completado' : 'Completion'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {shareType === 'achievement' && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4">
                    <Trophy className={`w-10 h-10 ${cardStyle === 'light' ? 'text-amber-500' : 'text-amber-400'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${getTextColor()} mb-2`}>
                    {achievementTitle}
                  </h3>
                  <p className={`${getSubTextColor()}`}>{achievementDescription}</p>
                </div>
              )}

              {shareType === 'milestone' && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4">
                    <Target className={`w-10 h-10 ${cardStyle === 'light' ? 'text-green-500' : 'text-green-400'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${getTextColor()} mb-2`}>
                    {language === 'es' ? '¡Hito Alcanzado!' : 'Milestone Reached!'}
                  </h3>
                  <p className={`${getSubTextColor()}`}>{achievementDescription}</p>
                </div>
              )}

              {/* Quote */}
              <div className={`mt-6 pt-4 border-t border-white/20 text-center`}>
                <p className={`text-sm italic ${getSubTextColor()}`}>
                  "{motivationalQuotes[selectedQuote]}"
                </p>
              </div>
            </div>
          </div>

          {/* Card Style Selector */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              {language === 'es' ? 'Estilo de Tarjeta' : 'Card Style'}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setCardStyle('gradient')}
                className={`flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 ${
                  cardStyle === 'gradient' ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                }`}
              />
              <button
                onClick={() => setCardStyle('dark')}
                className={`flex-1 h-12 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 ${
                  cardStyle === 'dark' ? 'ring-2 ring-gray-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                }`}
              />
              <button
                onClick={() => setCardStyle('light')}
                className={`flex-1 h-12 rounded-xl bg-gradient-to-r from-white to-gray-100 border border-gray-200 ${
                  cardStyle === 'light' ? 'ring-2 ring-gray-400 ring-offset-2 dark:ring-offset-gray-900' : ''
                }`}
              />
            </div>
          </div>

          {/* Quote Selector */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              {language === 'es' ? 'Mensaje Motivacional' : 'Motivational Quote'}
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {motivationalQuotes.map((quote, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedQuote(index)}
                  className={`text-left p-2 text-xs rounded-lg transition-colors ${
                    selectedQuote === index
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  "{quote}"
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              {language === 'es' ? 'Mensaje Personalizado (opcional)' : 'Custom Message (optional)'}
            </h3>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={language === 'es' ? 'Escribe tu propio mensaje...' : 'Write your own message...'}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
              rows={3}
            />
          </div>

          {/* Share Buttons */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              {language === 'es' ? 'Compartir en' : 'Share on'}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center gap-2 p-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 rounded-xl transition-colors group"
              >
                <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-[#1DA1F2]">Twitter</span>
              </button>
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-2 p-4 bg-[#4267B2]/10 hover:bg-[#4267B2]/20 rounded-xl transition-colors group"
              >
                <Facebook className="w-6 h-6 text-[#4267B2]" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-[#4267B2]">Facebook</span>
              </button>
              <button
                onClick={shareToLinkedIn}
                className="flex flex-col items-center gap-2 p-4 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 rounded-xl transition-colors group"
              >
                <Linkedin className="w-6 h-6 text-[#0077B5]" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-[#0077B5]">LinkedIn</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              >
                {copied ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Copy className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {copied ? (language === 'es' ? 'Copiado' : 'Copied') : (language === 'es' ? 'Copiar' : 'Copy')}
                </span>
              </button>
            </div>
          </div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full text-sm">
              #HabitTracker
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-sm">
              #PersonalGrowth
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full text-sm">
              #Discipline
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full text-sm">
              #Goals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
