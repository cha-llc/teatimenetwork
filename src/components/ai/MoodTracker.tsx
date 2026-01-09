import React, { useState } from 'react';
import { 
  Smile, 
  Frown, 
  Meh, 
  Battery, 
  Brain, 
  Target, 
  Zap,
  Check,
  X,
  TrendingUp,
  Clock
} from 'lucide-react';
import { MoodEntry } from '@/hooks/useAdvancedAI';

interface MoodTrackerProps {
  onSaveMood: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => MoodEntry;
  recentEntries: MoodEntry[];
  onGetSuggestions?: () => void;
  suggestionsLoading?: boolean;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({
  onSaveMood,
  recentEntries,
  onGetSuggestions,
  suggestionsLoading
}) => {
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [focus, setFocus] = useState(5);
  const [motivation, setMotivation] = useState(5);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = () => {
    onSaveMood({ energy, stress, focus, motivation, notes: notes || undefined });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setNotes('');
  };

  const getEnergyIcon = (value: number) => {
    if (value <= 3) return <Battery className="w-5 h-5 text-red-500" />;
    if (value <= 6) return <Battery className="w-5 h-5 text-amber-500" />;
    return <Battery className="w-5 h-5 text-green-500" />;
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 3) return <Frown className="w-5 h-5 text-red-500" />;
    if (value <= 6) return <Meh className="w-5 h-5 text-amber-500" />;
    return <Smile className="w-5 h-5 text-green-500" />;
  };

  const getSliderColor = (value: number) => {
    if (value <= 3) return 'from-red-500 to-red-400';
    if (value <= 6) return 'from-amber-500 to-amber-400';
    return 'from-green-500 to-green-400';
  };

  const todayEntry = recentEntries.find(e => {
    const entryDate = new Date(e.timestamp).toDateString();
    return entryDate === new Date().toDateString();
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Mood Check-In</h3>
              <p className="text-white/80 text-sm">Track your state for personalized AI coaching</p>
            </div>
          </div>
          {todayEntry && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Logged today</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Check or Full Form */}
      <div className="p-6">
        {showSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mood Logged!</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your AI coach will use this for personalized advice</p>
            {onGetSuggestions && (
              <button
                onClick={onGetSuggestions}
                disabled={suggestionsLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                {suggestionsLoading ? 'Getting suggestions...' : 'Get Mood-Based Suggestions'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Sliders */}
            <div className="space-y-6">
              {/* Energy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getEnergyIcon(energy)}
                    <span className="font-medium text-gray-900 dark:text-white">Energy Level</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${energy <= 3 ? '#ef4444' : energy <= 6 ? '#f59e0b' : '#22c55e'} 0%, ${energy <= 3 ? '#ef4444' : energy <= 6 ? '#f59e0b' : '#22c55e'} ${energy * 10}%, #e5e7eb ${energy * 10}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getMoodEmoji(11 - stress)}
                    <span className="font-medium text-gray-900 dark:text-white">Stress Level</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{stress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${stress >= 7 ? '#ef4444' : stress >= 4 ? '#f59e0b' : '#22c55e'} 0%, ${stress >= 7 ? '#ef4444' : stress >= 4 ? '#f59e0b' : '#22c55e'} ${stress * 10}%, #e5e7eb ${stress * 10}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Calm</span>
                  <span>Overwhelmed</span>
                </div>
              </div>

              {/* Focus */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className={`w-5 h-5 ${focus <= 3 ? 'text-red-500' : focus <= 6 ? 'text-amber-500' : 'text-green-500'}`} />
                    <span className="font-medium text-gray-900 dark:text-white">Focus</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{focus}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={focus}
                  onChange={(e) => setFocus(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${focus <= 3 ? '#ef4444' : focus <= 6 ? '#f59e0b' : '#22c55e'} 0%, ${focus <= 3 ? '#ef4444' : focus <= 6 ? '#f59e0b' : '#22c55e'} ${focus * 10}%, #e5e7eb ${focus * 10}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Scattered</span>
                  <span>Laser-focused</span>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-5 h-5 ${motivation <= 3 ? 'text-red-500' : motivation <= 6 ? 'text-amber-500' : 'text-green-500'}`} />
                    <span className="font-medium text-gray-900 dark:text-white">Motivation</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{motivation}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={motivation}
                  onChange={(e) => setMotivation(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${motivation <= 3 ? '#ef4444' : motivation <= 6 ? '#f59e0b' : '#22c55e'} 0%, ${motivation <= 3 ? '#ef4444' : motivation <= 6 ? '#f59e0b' : '#22c55e'} ${motivation * 10}%, #e5e7eb ${motivation * 10}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Unmotivated</span>
                  <span>Driven</span>
                </div>
              </div>

              {/* Notes */}
              {expanded && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling? Any context for today?"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Log Mood
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {expanded ? 'Less' : 'More'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Recent History */}
      {recentEntries.length > 0 && !showSuccess && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Check-ins</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentEntries.slice(0, 7).map((entry) => (
              <div
                key={entry.id}
                className="flex-shrink-0 w-16 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      entry.energy >= 7 ? 'bg-green-500' : entry.energy >= 4 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.energy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
