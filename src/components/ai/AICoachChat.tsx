import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Trash2, MessageSquare, Smile, Frown, Meh, Zap, Heart, Brain, Target, Clock, TrendingUp, Mic, MicOff, Volume2 } from 'lucide-react';
import { useAICoach, ChatMessage } from '@/hooks/useAICoach';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AI_COACH_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766855102407_8454aece.jpg';

const suggestedPrompts = [
  { text: "How can I stay consistent with my habits?", icon: Target, category: 'consistency' },
  { text: "What's the best time to do my habits?", icon: Clock, category: 'optimization' },
  { text: "I'm struggling to maintain my streak. Help!", icon: Heart, category: 'motivation' },
  { text: "How do I build a morning routine?", icon: Zap, category: 'routine' },
  { text: "What habits should I focus on first?", icon: Brain, category: 'strategy' },
  { text: "How can I overcome procrastination?", icon: TrendingUp, category: 'mindset' }
];

const moodOptions = [
  { value: 'great', label: 'Great', icon: Smile, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'low', label: 'Low', icon: Frown, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  { value: 'struggling', label: 'Struggling', icon: Frown, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' }
];

const AICoachChat: React.FC = () => {
  const { messages, chatLoading, sendMessage, clearChat, error, clearError } = useAICoach();
  const { saveMoodEntry, getRecentMoodEntries, moodSuggestions, getMoodBasedSuggestions, moodSuggestionsLoading } = useAdvancedAI();
  
  const [input, setInput] = useState('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check recent mood
  useEffect(() => {
    const recentMoods = getRecentMoodEntries(1);
    if (recentMoods.length > 0) {
      const lastMood = recentMoods[0];
      const hoursSince = (Date.now() - new Date(lastMood.timestamp).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 4) {
        // Map mood values to our mood options
        const avgMood = (lastMood.energy + lastMood.motivation) / 2;
        if (avgMood >= 80) setCurrentMood('great');
        else if (avgMood >= 60) setCurrentMood('good');
        else if (avgMood >= 40) setCurrentMood('okay');
        else if (avgMood >= 20) setCurrentMood('low');
        else setCurrentMood('struggling');
      }
    }
  }, [getRecentMoodEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    
    const message = input.trim();
    setInput('');
    setShowQuickActions(false);
    await sendMessage(message);
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    if (chatLoading) return;
    setShowQuickActions(false);
    await sendMessage(prompt);
  };

  const handleMoodSelect = (mood: string) => {
    setCurrentMood(mood);
    setShowMoodPicker(false);
    
    // Save mood entry
    const moodValues: Record<string, number> = {
      'great': 90,
      'good': 70,
      'okay': 50,
      'low': 30,
      'struggling': 15
    };
    
    saveMoodEntry({
      energy: moodValues[mood],
      stress: 100 - moodValues[mood],
      focus: moodValues[mood],
      motivation: moodValues[mood]
    });

    // Send mood-aware message to coach
    const moodMessages: Record<string, string> = {
      'great': "I'm feeling great today! What should I focus on to make the most of this energy?",
      'good': "I'm feeling good today. Any tips to maintain this momentum?",
      'okay': "I'm feeling okay today. How can I boost my motivation?",
      'low': "I'm feeling a bit low today. Can you help me stay on track?",
      'struggling': "I'm really struggling today. I need some encouragement and a gentle plan."
    };
    
    handleSuggestedPrompt(moodMessages[mood]);
  };

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(!isListening);
      // Voice recognition would be implemented here
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getMoodColor = () => {
    const mood = moodOptions.find(m => m.value === currentMood);
    return mood?.color || 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={AI_COACH_IMAGE} 
              alt="Sage AI Coach"
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Sage - AI Habit Coach</h3>
            <p className="text-xs text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online & ready to help
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mood indicator */}
          <button
            onClick={() => setShowMoodPicker(!showMoodPicker)}
            className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${getMoodColor()}`}
            title="Set your mood"
          >
            {currentMood ? (
              moodOptions.find(m => m.value === currentMood)?.icon && 
              React.createElement(moodOptions.find(m => m.value === currentMood)!.icon, { className: 'w-5 h-5 text-white' })
            ) : (
              <Smile className="w-5 h-5 text-white" />
            )}
          </button>
          
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mood Picker Dropdown */}
      {showMoodPicker && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">How are you feeling right now?</p>
          <div className="flex gap-2 flex-wrap">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    currentMood === mood.value 
                      ? `${mood.bgColor} ring-2 ring-offset-2 ring-purple-500` 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${mood.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-6">
              <img 
                src={AI_COACH_IMAGE} 
                alt="Sage"
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Hi! I'm Sage, your AI Coach
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              I'm here to help you build better habits, stay motivated, and achieve your goals. 
              How are you feeling today?
            </p>
            
            {/* Mood Quick Select */}
            <div className="w-full max-w-md mb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Start by telling me how you feel:</p>
              <div className="flex justify-center gap-3">
                {moodOptions.slice(0, 3).map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => handleMoodSelect(mood.value)}
                      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all hover:scale-105 ${mood.bgColor}`}
                    >
                      <Icon className={`w-6 h-6 ${mood.color}`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Suggested prompts */}
            {showQuickActions && (
              <div className="w-full max-w-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Or ask me anything:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        disabled={chatLoading}
                        className="flex items-center gap-3 text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-[1.02] disabled:opacity-50 border border-gray-100 dark:border-gray-600"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="line-clamp-2">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onSpeak={speakResponse}
              />
            ))}
            
            {chatLoading && (
              <div className="flex items-start gap-3">
                <img 
                  src={AI_COACH_IMAGE}
                  alt="Sage"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sage is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick action chips when in conversation */}
      {messages.length > 0 && !chatLoading && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleSuggestedPrompt("Give me a quick motivation boost")}
              className="flex-shrink-0 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Motivation boost
            </button>
            <button
              onClick={() => handleSuggestedPrompt("What should I focus on right now?")}
              className="flex-shrink-0 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Target className="w-3 h-3 inline mr-1" />
              Focus advice
            </button>
            <button
              onClick={() => handleSuggestedPrompt("Help me overcome a habit blocker")}
              className="flex-shrink-0 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <Brain className="w-3 h-3 inline mr-1" />
              Overcome blocker
            </button>
            <button
              onClick={() => handleSuggestedPrompt("Suggest a habit stack for me")}
              className="flex-shrink-0 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Habit stacking
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sage anything about habits..."
            disabled={chatLoading}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatLoading}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          Sage adapts advice based on your mood and habit history
        </p>
      </form>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C9885] to-[#5a7a64] flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      ) : (
        <img 
          src={AI_COACH_IMAGE}
          alt="Sage"
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
        />
      )}
      <div className={`max-w-[80%] ${isUser ? '' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-[#7C9885] to-[#5a7a64] text-white rounded-tr-sm' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : ''}`}>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {!isUser && onSpeak && (
            <button
              onClick={() => onSpeak(message.content)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Listen to response"
            >
              <Volume2 className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICoachChat;
