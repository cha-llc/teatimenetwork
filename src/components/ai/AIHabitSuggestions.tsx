import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  RefreshCw, 
  Plus, 
  Clock, 
  Zap, 
  Heart, 
  Brain, 
  Users, 
  Dumbbell,
  Palette,
  BookOpen,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';
import { useAICoach, HabitSuggestion } from '@/hooks/useAICoach';
import { useHabits } from '@/hooks/useHabits';
import { toast } from '@/components/ui/use-toast';

const categoryIcons: Record<string, React.ElementType> = {
  health: Heart,
  productivity: Zap,
  mindfulness: Brain,
  learning: BookOpen,
  social: Users,
  fitness: Dumbbell,
  creativity: Palette
};

const suggestionTypes = [
  { id: 'general', label: 'For You', icon: Sparkles },
  { id: 'complementary', label: 'Complementary', icon: Zap },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'productivity', label: 'Productivity', icon: Brain },
  { id: 'mindfulness', label: 'Mindfulness', icon: Lightbulb },
  { id: 'learning', label: 'Learning', icon: BookOpen }
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const AIHabitSuggestions: React.FC = () => {
  const { suggestions, suggestionsReasoning, suggestionsLoading, getHabitSuggestions, error } = useAICoach();
  const { createHabit } = useHabits();
  const [selectedType, setSelectedType] = useState('general');
  const [addedHabits, setAddedHabits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (suggestions.length === 0 && !suggestionsLoading) {
      getHabitSuggestions('general');
    }
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    getHabitSuggestions(type);
  };

  const handleAddHabit = async (suggestion: HabitSuggestion) => {
    try {
      await createHabit({
        name: suggestion.name,
        category: suggestion.category,
        frequency: suggestion.frequency,
        target_days: suggestion.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [1, 3, 5],
        color: getCategoryColor(suggestion.category)
      });
      
      setAddedHabits(prev => new Set([...prev, suggestion.name]));
      
      toast({
        title: 'Habit Added!',
        description: `"${suggestion.name}" has been added to your habits.`
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add habit',
        variant: 'destructive'
      });
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      health: '#EF4444',
      productivity: '#F59E0B',
      mindfulness: '#8B5CF6',
      learning: '#3B82F6',
      social: '#EC4899',
      fitness: '#10B981',
      creativity: '#F97316'
    };
    return colors[category] || '#7C9885';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            AI Habit Suggestions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Personalized recommendations based on your habits and goals
          </p>
        </div>
        <button
          onClick={() => getHabitSuggestions(selectedType)}
          disabled={suggestionsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${suggestionsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {suggestionTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              disabled={suggestionsLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {suggestionsLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Generating personalized suggestions...</p>
        </div>
      )}

      {/* Error state */}
      {error && !suggestionsLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Suggestions grid */}
      {!suggestionsLoading && suggestions.length > 0 && (
        <>
          {suggestionsReasoning && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-800 dark:text-purple-300">{suggestionsReasoning}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => {
              const CategoryIcon = categoryIcons[suggestion.category] || Lightbulb;
              const isAdded = addedHabits.has(suggestion.name);
              
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor(suggestion.category)}20` }}>
                      <CategoryIcon className="w-5 h-5" style={{ color: getCategoryColor(suggestion.category) }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[suggestion.difficulty]}`}>
                        {suggestion.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{suggestion.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.description}</p>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {suggestion.estimatedTime}
                    </span>
                    <span className="capitalize">{suggestion.frequency}</span>
                  </div>

                  {/* Tip */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-purple-600 dark:text-purple-400">Tip:</span> {suggestion.tip}
                    </p>
                  </div>

                  {/* Synergy */}
                  {suggestion.synergy && (
                    <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{suggestion.synergy}</span>
                    </div>
                  )}

                  {/* Add button */}
                  <button
                    onClick={() => handleAddHabit(suggestion)}
                    disabled={isAdded}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      isAdded
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-[#7C9885] text-white hover:bg-[#6B8574]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Habit
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {!suggestionsLoading && suggestions.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No suggestions yet</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Click refresh to get AI-powered habit recommendations</p>
          <button
            onClick={() => getHabitSuggestions(selectedType)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Get Suggestions
          </button>
        </div>
      )}
    </div>
  );
};

export default AIHabitSuggestions;
