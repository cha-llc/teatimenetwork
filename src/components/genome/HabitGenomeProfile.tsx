import React from 'react';
import { 
  Dna, 
  Sparkles, 
  Star, 
  Zap, 
  TrendingUp,
  Award,
  Shield,
  Target
} from 'lucide-react';
import { HabitGenome, DominantTrait, UniqueMarker } from '@/hooks/useHabitGenome';

interface HabitGenomeProfileProps {
  genome: HabitGenome;
}

const HabitGenomeProfile: React.FC<HabitGenomeProfileProps> = ({ genome }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-amber-400 to-orange-500 text-amber-900';
      case 'rare': return 'from-purple-400 to-indigo-500 text-purple-900';
      case 'uncommon': return 'from-blue-400 to-cyan-500 text-blue-900';
      default: return 'from-gray-400 to-gray-500 text-gray-900';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700';
      case 'rare': return 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-300 dark:border-purple-700';
      case 'uncommon': return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
    }
  };

  const getStrandIcon = (strand: string) => {
    switch (strand) {
      case 'physical': return '💪';
      case 'mental': return '🧠';
      case 'productivity': return '⚡';
      case 'social': return '🤝';
      case 'growth': return '🌱';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-6">
      {/* Genome Header */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* DNA Helix Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <path
              d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
            />
            <path
              d="M0,100 Q50,150 100,100 T200,100 T300,100 T400,100"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Dna className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Genome ID: {genome.genomeId}</p>
                  <h2 className="text-2xl font-bold">{genome.genomeName}</h2>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{genome.overallGenomeScore}</div>
              <p className="text-white/70 text-sm">Genome Score</p>
            </div>
          </div>
          
          <p className="mt-4 text-white/90 italic">"{genome.genomeInsight}"</p>
        </div>
      </div>

      {/* Evolution Stage */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Evolution Stage</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your growth journey</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {genome.evolutionStage.current}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Next: {genome.evolutionStage.nextStage}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${genome.evolutionStage.progress}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {genome.evolutionStage.progress}%
          </div>
        </div>
        
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            <span className="font-medium">To evolve:</span> {genome.evolutionStage.requirement}
          </p>
        </div>
      </div>

      {/* Dominant Traits */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Dominant Traits</h3>
        </div>
        
        <div className="space-y-4">
          {genome.dominantTraits.map((trait, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: trait.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{trait.trait}</span>
                </div>
                <span className="text-lg font-bold" style={{ color: trait.color }}>
                  {trait.strength}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${trait.strength}%`,
                    backgroundColor: trait.color
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{trait.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Genome Strands */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Genome Strands</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(genome.genomeStrands).map(([key, strand]) => (
            <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStrandIcon(key)}</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{key}</span>
                </div>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {strand.score}
                </span>
              </div>
              
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                  style={{ width: `${strand.score}%` }}
                />
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {strand.markers.map((marker, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                  >
                    {marker}
                  </span>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">{strand.potential}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unique Markers */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Unique Markers</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {genome.uniqueMarkers.map((marker, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-xl border ${getRarityBg(marker.rarity)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{marker.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(marker.rarity)}`}>
                  {marker.rarity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{marker.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                <span className="font-medium">Impact:</span> {marker.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitGenomeProfile;
