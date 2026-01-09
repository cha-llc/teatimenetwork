import React from 'react';
import { BrainState } from '@/hooks/useBiofeedback';
import { Brain, Zap, Wind, Waves, Moon, Focus, Heart } from 'lucide-react';

interface BrainStateVisualizerProps {
  brainState: BrainState | null;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function BrainStateVisualizer({ brainState, size = 'md', showLabels = true }: BrainStateVisualizerProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const waveTypes = [
    { key: 'alpha', label: 'Alpha', color: 'from-green-400 to-emerald-500', icon: Wind, description: 'Relaxation' },
    { key: 'beta', label: 'Beta', color: 'from-yellow-400 to-orange-500', icon: Zap, description: 'Alertness' },
    { key: 'gamma', label: 'Gamma', color: 'from-purple-400 to-pink-500', icon: Brain, description: 'Cognition' },
    { key: 'theta', label: 'Theta', color: 'from-blue-400 to-cyan-500', icon: Waves, description: 'Creativity' },
    { key: 'delta', label: 'Delta', color: 'from-indigo-400 to-violet-500', icon: Moon, description: 'Deep Rest' }
  ];

  if (!brainState) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-4 border-gray-700`}>
        <div className="text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data</p>
        </div>
      </div>
    );
  }

  const focusAngle = (brainState.focus / 100) * 360;
  const calmAngle = (brainState.calm / 100) * 360;

  return (
    <div className="space-y-6">
      {/* Main Brain Visualization */}
      <div className="flex justify-center">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Outer ring - Focus */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="8"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="url(#focusGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(focusAngle / 360) * 283} 283`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner ring - Calm */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="35%"
              fill="none"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="6"
            />
            <circle
              cx="50%"
              cy="50%"
              r="35%"
              fill="none"
              stroke="url(#calmGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(calmAngle / 360) * 220} 220`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="calmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <div className="mt-2 text-center">
              <div className="flex items-center gap-2 text-sm">
                <Focus className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-blue-400">{Math.round(brainState.focus)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-green-400" />
                <span className="font-bold text-green-400">{Math.round(brainState.calm)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Breakdown */}
      {showLabels && (
        <div className="grid grid-cols-5 gap-2">
          {waveTypes.map(wave => {
            const value = brainState[wave.key as keyof BrainState] as number;
            const Icon = wave.icon;
            
            return (
              <div key={wave.key} className="text-center">
                <div className="relative mb-2">
                  <div className="w-full h-16 bg-gray-800 rounded-lg overflow-hidden">
                    <div 
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${wave.color} transition-all duration-500`}
                      style={{ height: `${value}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-300">{wave.label}</p>
                <p className="text-xs text-gray-500">{Math.round(value)}%</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Live neurofeedback</span>
      </div>
    </div>
  );
}

