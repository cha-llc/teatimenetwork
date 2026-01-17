import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, Sparkles, Coins, Zap, Shield, Star, 
  RotateCw, Lock, Clock, Trophy, Flame
} from 'lucide-react';
import { RouletteReward } from '@/hooks/useMomentumRealm';

interface RitualRouletteProps {
  canSpin: boolean;
  onSpin: () => Promise<RouletteReward | null>;
  isSpinning: boolean;
  rewards: RouletteReward[];
  lastReward?: RouletteReward | null;
}

export const RitualRoulette: React.FC<RitualRouletteProps> = ({
  canSpin,
  onSpin,
  isSpinning,
  rewards,
  lastReward: initialLastReward
}) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastReward, setLastReward] = useState<RouletteReward | null>(initialLastReward || null);
  const [showReward, setShowReward] = useState(false);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'tokens': return <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'experience': return <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'streak_shield': return <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'xp_boost': return <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'token_boost': return <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'mystery_ally': return <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      default: return <Gift className="w-5 h-5 text-gray-500 dark:text-slate-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 dark:bg-slate-500/20 text-gray-600 dark:text-slate-400 border-gray-300 dark:border-slate-500/30 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white hover:border-gray-700 dark:hover:border-slate-700';
      case 'uncommon': return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30 hover:bg-green-700 dark:hover:bg-green-700 hover:text-white hover:border-green-700 dark:hover:border-green-700';
      case 'rare': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30 hover:bg-blue-700 dark:hover:bg-blue-700 hover:text-white hover:border-blue-700 dark:hover:border-blue-700';
      case 'epic': return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30 hover:bg-purple-700 dark:hover:bg-purple-700 hover:text-white hover:border-purple-700 dark:hover:border-purple-700';
      case 'legendary': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30 hover:bg-yellow-700 dark:hover:bg-yellow-700 hover:text-white hover:border-yellow-700 dark:hover:border-yellow-700';
      default: return 'bg-gray-200 dark:bg-slate-500/20 text-gray-600 dark:text-slate-400 border-gray-300 dark:border-slate-500/30 hover:bg-gray-700 dark:hover:bg-slate-700 hover:text-white hover:border-gray-700 dark:hover:border-slate-700';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-lg shadow-yellow-500/50 animate-pulse';
      case 'epic': return 'shadow-lg shadow-purple-500/50';
      case 'rare': return 'shadow-md shadow-blue-500/30';
      default: return '';
    }
  };

  const handleSpin = async () => {
    if (!canSpin || spinning) return;
    
    setSpinning(true);
    setShowReward(false);
    
    // Animate through rewards
    let spinCount = 0;
    const maxSpins = 20 + Math.floor(Math.random() * 10);
    
    const spinInterval = setInterval(() => {
      setSelectedIndex(prev => (prev + 1) % rewards.length);
      spinCount++;
      
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
      }
    }, 100 + spinCount * 5); // Slow down gradually

    // Get actual reward
    const reward = await onSpin();
    
    // Wait for animation to finish
    setTimeout(() => {
      setSpinning(false);
      if (reward) {
        setLastReward(reward);
        setShowReward(true);
      }
    }, maxSpins * 100 + 500);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-slate-900 border-purple-200 dark:border-purple-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-800 dark:text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Daily Ritual Roulette
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Roulette Display */}
        <div className="relative mb-4">
          {/* Wheel visualization */}
          <div className="relative h-32 overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-purple-200 dark:border-purple-500/30">
            {/* Rewards strip */}
            <div 
              className={`flex flex-col items-center justify-center h-full transition-transform duration-100 ${
                spinning ? 'blur-sm' : ''
              }`}
            >
              {spinning ? (
                <div className="flex flex-col items-center gap-2">
                  <RotateCw className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin" />
                  <span className="text-purple-700 dark:text-purple-300 animate-pulse">Spinning...</span>
                </div>
              ) : showReward && lastReward ? (
                <div className={`flex flex-col items-center gap-2 p-4 rounded-xl ${getRarityGlow(lastReward.rarity)}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRarityColor(lastReward.rarity)}`}>
                    {getRewardIcon(lastReward.type)}
                  </div>
                  <span className="text-gray-800 dark:text-white font-bold text-lg">{lastReward.label}</span>
                  <Badge className={getRarityColor(lastReward.rarity)}>
                    {lastReward.rarity.toUpperCase()}
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Gift className="w-12 h-12" />
                  <span>Spin to win rewards!</span>
                </div>
              )}
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-500 dark:border-t-purple-500" />
          </div>
        </div>

        {/* Possible Rewards Preview */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">Possible Rewards:</p>
          <div className="flex flex-wrap gap-1">
            {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => {
              const rewardsOfRarity = rewards.filter(r => r.rarity === rarity);
              if (rewardsOfRarity.length === 0) return null;
              return (
                <Badge key={rarity} className={`text-xs ${getRarityColor(rarity)}`}>
                  {rarity}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Spin Button */}
        <Button
          onClick={handleSpin}
          disabled={!canSpin || spinning}
          className={`w-full text-white ${
            canSpin && !spinning
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600'
              : 'bg-purple-500 dark:bg-purple-500 opacity-75 hover:opacity-60 dark:hover:opacity-60'
          }`}
        >
          {spinning ? (
            <>
              <RotateCw className="w-4 h-4 mr-2 animate-spin" />
              Spinning...
            </>
          ) : canSpin ? (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Spin the Wheel!
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Come back tomorrow
            </>
          )}
        </Button>

        {!canSpin && !spinning && (
          <p className="text-xs text-center text-gray-500 dark:text-slate-500 mt-2">
            Daily spin resets at midnight
          </p>
        )}

        {/* Recent Rewards */}
        {lastReward && !spinning && !showReward && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">Last Reward:</p>
            <div className="flex items-center gap-2">
              {getRewardIcon(lastReward.type)}
              <span className="text-gray-800 dark:text-white font-medium">{lastReward.label}</span>
              <Badge className={`text-xs ml-auto ${getRarityColor(lastReward.rarity)}`}>
                {lastReward.rarity}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RitualRoulette;
