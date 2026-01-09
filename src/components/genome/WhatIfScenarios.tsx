import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, ArrowRight, Sparkles, Clock, Target,
  Zap, Shield, Heart, Brain, ChevronRight, ChevronDown
} from 'lucide-react';

interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  probability: number;
  timeframe: string;
  impacts: {
    area: string;
    change: 'increase' | 'decrease' | 'stable';
    magnitude: number;
    description: string;
  }[];
  cascadeEffects: string[];
  recommendation: string;
  alternativePath?: {
    action: string;
    benefit: string;
  };
}

interface WhatIfScenariosProps {
  scenarios: {
    scenarios: WhatIfScenario[];
    currentPath: {
      trajectory: string;
      confidence: number;
      keyFactors: string[];
    };
    branchingPoints: {
      decision: string;
      options: { choice: string; outcome: string }[];
    }[];
    overallOutlook: string;
  };
}

const WhatIfScenarios: React.FC<WhatIfScenariosProps> = ({ scenarios }) => {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <GitBranch className="w-5 h-5 text-gray-500" />;
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'increase': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Path Overview */}
      <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Your Current Trajectory</h2>
              <p className="text-white/90 mb-4">{scenarios.currentPath.trajectory}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-white/70" />
                  <span className="text-sm">Confidence: {scenarios.currentPath.confidence}%</span>
                </div>
                <Progress 
                  value={scenarios.currentPath.confidence} 
                  className="flex-1 h-2 bg-white/20"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {scenarios.currentPath.keyFactors.map((factor, idx) => (
                  <Badge key={idx} className="bg-white/20 text-white border-0">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branching Points */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-purple-500" />
            Key Decision Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.branchingPoints.map((branch, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedBranch === idx 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
                onClick={() => setSelectedBranch(idx)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{branch.decision}</h4>
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    Decision #{idx + 1}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {branch.options.map((option, optIdx) => (
                    <div 
                      key={optIdx}
                      className={`p-3 rounded-lg ${
                        optIdx === 0 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {optIdx === 0 ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-medium text-sm">{option.choice}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{option.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenarios.scenarios.map((scenario) => (
          <Card 
            key={scenario.id}
            className={`border transition-all ${
              expandedScenario === scenario.id 
                ? 'ring-2 ring-purple-500' 
                : 'hover:shadow-lg'
            }`}
          >
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(scenario.type)}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{scenario.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scenario.description}</p>
                    </div>
                  </div>
                  {expandedScenario === scenario.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <Badge className={getTypeColor(scenario.type)}>
                    {scenario.type.charAt(0).toUpperCase() + scenario.type.slice(1)}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {scenario.timeframe}
                  </span>
                  <span className="text-xs text-gray-500">
                    {scenario.probability}% likely
                  </span>
                </div>
              </button>

              {expandedScenario === scenario.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {/* Impacts */}
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Impact Areas</h5>
                  <div className="space-y-2 mb-4">
                    {scenario.impacts.map((impact, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getChangeIcon(impact.change)}
                          <span className="text-sm font-medium">{impact.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={impact.magnitude * 10} 
                            className={`w-20 h-1.5 ${
                              impact.change === 'increase' ? 'bg-green-200' : 
                              impact.change === 'decrease' ? 'bg-red-200' : 'bg-gray-200'
                            }`}
                          />
                          <span className={`text-xs font-medium ${
                            impact.change === 'increase' ? 'text-green-600' : 
                            impact.change === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {impact.change === 'increase' ? '+' : impact.change === 'decrease' ? '-' : ''}{impact.magnitude * 10}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cascade Effects */}
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cascade Effects</h5>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scenario.cascadeEffects.map((effect, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Recommendation</span>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-200">{scenario.recommendation}</p>
                  </div>

                  {/* Alternative Path */}
                  {scenario.alternativePath && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">Better Path</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>Action:</strong> {scenario.alternativePath.action}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <strong>Benefit:</strong> {scenario.alternativePath.benefit}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Outlook */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-6 h-6" />
            <h3 className="text-lg font-bold">Overall Outlook</h3>
          </div>
          <p className="text-white/90 leading-relaxed">{scenarios.overallOutlook}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatIfScenarios;
