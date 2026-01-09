import React from 'react';
import { 
  Heart, 
  Briefcase, 
  Brain, 
  Users, 
  Lightbulb,
  TrendingUp,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LifeOutcomes } from '@/hooks/useHabitGenome';

interface LifeOutcomeSimulatorProps {
  outcomes: LifeOutcomes;
}

const LifeOutcomeSimulator: React.FC<LifeOutcomeSimulatorProps> = ({ outcomes }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-blue-500';
    if (confidence >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getResilienceColor = (resilience: string) => {
    switch (resilience.toLowerCase()) {
      case 'exceptional': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'high': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Life Outcome Simulator</h2>
                <p className="text-white/80">Predictive analysis based on your habits</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{outcomes.simulationConfidence}%</div>
            <p className="text-white/70 text-sm">Confidence</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <p className="text-white/90 font-medium">Time Horizon: {outcomes.timeHorizon}</p>
          <p className="text-white/80 text-sm mt-1">{outcomes.criticalInsight}</p>
        </div>
      </div>

      {/* Lifespan Projection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lifespan Impact</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on health-related habits</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Trajectory</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {outcomes.outcomes.lifespan.currentTrajectory}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">With Optimization</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {outcomes.outcomes.lifespan.potentialWithOptimization}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {outcomes.outcomes.lifespan.keyFactors.map((factor, idx) => (
            <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">
              {factor}
            </span>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          {outcomes.outcomes.lifespan.scientificBasis}
        </p>
      </div>

      {/* Career Success */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Career Success</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Professional growth projection</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Growth Potential</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {outcomes.outcomes.careerSuccess.currentTrajectory}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Optimized Potential</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {outcomes.outcomes.careerSuccess.potentialWithOptimization}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Income Projection</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {outcomes.outcomes.careerSuccess.incomeProjection}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {outcomes.outcomes.careerSuccess.keyFactors.map((factor, idx) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
              {factor}
            </span>
          ))}
        </div>
      </div>

      {/* Mental Wellness */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mental Wellness</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Psychological health forecast</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Score</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {outcomes.outcomes.mentalWellness.currentScore}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Projected (1yr)</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {outcomes.outcomes.mentalWellness.projectedScore}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stress Resilience</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getResilienceColor(outcomes.outcomes.mentalWellness.stressResilience)}`}>
              {outcomes.outcomes.mentalWellness.stressResilience}
            </span>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Burnout Risk</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {outcomes.outcomes.mentalWellness.burnoutRisk}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-300 text-sm">Risk Factors</span>
            </div>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {outcomes.outcomes.mentalWellness.riskFactors.map((risk, idx) => (
                <li key={idx}>• {risk}</li>
              ))}
            </ul>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300 text-sm">Protective Factors</span>
            </div>
            <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
              {outcomes.outcomes.mentalWellness.protectiveFactors.map((factor, idx) => (
                <li key={idx}>• {factor}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cognitive Health & Relationships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cognitive Health */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Cognitive Health</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Sharpness</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${outcomes.outcomes.cognitiveHealth.currentSharpness}%` }}
                  />
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {outcomes.outcomes.cognitiveHealth.currentSharpness}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">Decline Rate:</span> {outcomes.outcomes.cognitiveHealth.projectedDeclineRate}
              </p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                {outcomes.outcomes.cognitiveHealth.brainAgePrediction}
              </p>
            </div>
          </div>
        </div>

        {/* Relationships */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Relationships</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Social Capital Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                    style={{ width: `${outcomes.outcomes.relationships.socialCapitalScore}%` }}
                  />
                </div>
                <span className="font-bold text-pink-600 dark:text-pink-400">
                  {outcomes.outcomes.relationships.socialCapitalScore}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <p className="text-sm text-pink-700 dark:text-pink-300">
                <span className="font-medium">Connection Quality:</span> {outcomes.outcomes.relationships.connectionQuality}
              </p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-pink-800 dark:text-pink-200">
                {outcomes.outcomes.relationships.projectedImpact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compound Effects */}
      <div className="bg-gradient-to-r from-[#7C9885] to-[#9AB4A3] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Compound Effects</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {outcomes.compoundEffects.map((effect, idx) => (
            <div key={idx} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{effect.effect}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  {effect.magnitude}
                </span>
              </div>
              <p className="text-sm text-white/80">{effect.description}</p>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <p className="font-medium">Optimization Potential</p>
          <p className="text-white/90">{outcomes.optimizationPotential}</p>
        </div>
      </div>
    </div>
  );
};

export default LifeOutcomeSimulator;
