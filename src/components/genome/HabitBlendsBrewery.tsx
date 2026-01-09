import React, { useState } from 'react';
import { 
  Coffee, 
  Sparkles, 
  Clock, 
  Zap, 
  Heart,
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { HabitBlends, HabitBlend } from '@/hooks/useHabitGenome';

interface HabitBlendsBreweryProps {
  blends: HabitBlends;
  onAddHabit?: (habitName: string) => void;
}

const HabitBlendsBrewery: React.FC<HabitBlendsBreweryProps> = ({ blends, onAddHabit }) => {
  const [expandedBlend, setExpandedBlend] = useState<string | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'energizing': return 'from-orange-400 to-red-500';
      case 'calming': return 'from-blue-400 to-indigo-500';
      case 'focusing': return 'from-purple-400 to-pink-500';
      case 'balancing': return 'from-green-400 to-teal-500';
      case 'strengthening': return 'from-amber-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'energizing': return <Zap className="w-4 h-4" />;
      case 'calming': return <Heart className="w-4 h-4" />;
      case 'focusing': return <Target className="w-4 h-4" />;
      case 'balancing': return <Coffee className="w-4 h-4" />;
      case 'strengthening': return <Star className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-900/50 dark:to-orange-900/50 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200';
      case 'rare': return 'bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-900/50 dark:to-indigo-900/50 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-200';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300';
    }
  };

  const FlavorBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-12">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-4">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Tea steam animation */}
        <div className="absolute right-8 top-4 opacity-20">
          <svg width="60" height="80" viewBox="0 0 60 80">
            <path
              d="M30,80 Q20,60 30,40 Q40,20 30,0"
              fill="none"
              stroke="white"
              strokeWidth="3"
              className="animate-pulse"
            />
            <path
              d="M20,80 Q10,60 20,40 Q30,20 20,0"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: '0.3s' }}
            />
            <path
              d="M40,80 Q30,60 40,40 Q50,20 40,0"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: '0.6s' }}
            />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Habit Blend Brewery</h2>
              <p className="text-white/80">Custom habit combinations for optimal results</p>
            </div>
          </div>
          
          <p className="text-white/90 italic">"{blends.brewmasterNote}"</p>
        </div>
      </div>

      {/* Brewing Wisdom */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-200 italic text-center">
          "{blends.brewingWisdom}"
        </p>
      </div>

      {/* Habit Blends */}
      <div className="space-y-4">
        {blends.blends.map((blend, index) => (
          <div 
            key={index}
            className={`rounded-2xl border-2 overflow-hidden transition-all ${getRarityStyle(blend.rarity)}`}
          >
            {/* Blend Header */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedBlend(expandedBlend === blend.name ? null : blend.name)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getTypeColor(blend.type)} flex items-center gap-1`}>
                      {getTypeIcon(blend.type)}
                      {blend.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${
                      blend.rarity === 'legendary' ? 'bg-amber-500 text-white' :
                      blend.rarity === 'rare' ? 'bg-purple-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {blend.rarity}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{blend.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{blend.tagline}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Synergy</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{blend.synergyScore}%</p>
                  </div>
                  {expandedBlend === blend.name ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {blend.steepTime}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Coffee className="w-4 h-4" />
                  {blend.ingredients.length} ingredients
                </div>
              </div>
            </div>
            
            {/* Expanded Details */}
            {expandedBlend === blend.name && (
              <div className="px-4 pb-4 border-t border-current/10 pt-4 space-y-4">
                {/* Brewing Instructions */}
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    Brewing Instructions
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 italic">{blend.brewingInstructions}</p>
                </div>
                
                {/* Ingredients */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Ingredients</h4>
                  <div className="space-y-2">
                    {blend.ingredients.map((ingredient, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{ingredient.habit}</span>
                            {ingredient.isNew && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {ingredient.amount} • {ingredient.timing}
                          </p>
                        </div>
                        {ingredient.isNew && onAddHabit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddHabit(ingredient.habit);
                            }}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Flavor Profile */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Flavor Profile</h4>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl space-y-2">
                    <FlavorBar label="Energy" value={blend.flavorProfile.energy} color="bg-orange-500" />
                    <FlavorBar label="Calm" value={blend.flavorProfile.calm} color="bg-blue-500" />
                    <FlavorBar label="Focus" value={blend.flavorProfile.focus} color="bg-purple-500" />
                    <FlavorBar label="Joy" value={blend.flavorProfile.joy} color="bg-pink-500" />
                  </div>
                </div>
                
                {/* Benefits */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {blend.benefits.map((benefit, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Best For & Pairing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Best For</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{blend.bestFor}</p>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pairs Well With</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{blend.pairingNote}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Blend Suggestion */}
      <div className="bg-gradient-to-r from-[#7C9885] to-[#9AB4A3] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Your Signature Blend</h3>
        </div>
        
        <h4 className="text-xl font-bold mb-2">{blends.customBlendSuggestion.name}</h4>
        <p className="text-white/90 mb-4">{blends.customBlendSuggestion.description}</p>
        
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-4">
          <p className="font-medium mb-2">Recommended Ingredients:</p>
          <div className="flex flex-wrap gap-2">
            {blends.customBlendSuggestion.ingredients.map((ingredient, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-white/20 rounded-full text-sm"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-white/80 text-sm">
          <span className="font-medium">Expected Outcome:</span> {blends.customBlendSuggestion.expectedOutcome}
        </p>
      </div>
    </div>
  );
};

export default HabitBlendsBrewery;
