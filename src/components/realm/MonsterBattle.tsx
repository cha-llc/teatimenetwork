import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sword, Heart, Users, Clock, 
  Flame, Target, Trophy, Sparkles, AlertTriangle,
  ChevronRight, Crown, Loader2
} from 'lucide-react';
import { ChaosMonster, MonsterBattle } from '@/hooks/useMomentumRealm';

const CHAOS_MONSTER_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766855149130_047b527c.png';

interface MonsterBattleCardProps {
  battle?: MonsterBattle;
  monster: ChaosMonster;
  monsterImage: string;
  onStartBattle?: (monsterId: string) => void | Promise<void>;
  onAttack?: (battleId: string, damage: number) => void | Promise<void>;
  habitsCompletedToday?: number;
  isTeamBattle?: boolean;
  teamMembers?: { name: string; damage: number; avatar?: string }[];
}

export const MonsterBattleCard: React.FC<MonsterBattleCardProps> = ({
  battle,
  monster,
  monsterImage,
  onStartBattle,
  onAttack,
  habitsCompletedToday = 0,
  isTeamBattle = false,
  teamMembers = []
}) => {
  // Guard: if monster is undefined or missing required properties, don't render
  if (!monster || !monster.name || !monster.type || !monster.difficulty) {
    return null;
  }

  const [isAttacking, setIsAttacking] = useState(false);
  const [isStartingBattle, setIsStartingBattle] = useState(false);
  const [showDamageAnimation, setShowDamageAnimation] = useState(false);
  const [lastDamage, setLastDamage] = useState(0);

  const healthPercentage = battle 
    ? (battle.current_health / battle.max_health) * 100 
    : 100;

  const damageReady = habitsCompletedToday * 5;
  const canAttack = battle && damageReady > 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'boss': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getHealthColor = () => {
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getMonsterTypeIcon = (type: string) => {
    switch (type) {
      case 'procrastination': return '💤';
      case 'distraction': return '📱';
      case 'comfort_zone': return '🛋️';
      case 'doubt': return '😰';
      case 'perfectionism': return '🎯';
      default: return '👾';
    }
  };

  const handleStartBattle = async () => {
    if (!onStartBattle || isStartingBattle || !monster?.id) return;
    
    setIsStartingBattle(true);
    try {
      await onStartBattle(monster.id);
    } catch (error) {
      console.error('Failed to start battle:', error);
    } finally {
      setIsStartingBattle(false);
    }
  };

  const handleAttack = async () => {
    if (!battle || !onAttack || damageReady <= 0 || isAttacking) return;
    
    setIsAttacking(true);
    setLastDamage(damageReady);
    setShowDamageAnimation(true);
    
    try {
      await onAttack(battle.id, damageReady);
    } catch (error) {
      console.error('Failed to attack:', error);
    } finally {
      setTimeout(() => {
        setIsAttacking(false);
        setShowDamageAnimation(false);
      }, 1000);
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${
      battle ? 'border-red-500/50 bg-gradient-to-br from-slate-900 to-red-950' : 'bg-slate-800/50 border-slate-700'
    } ${isAttacking ? 'animate-pulse' : ''}`}>
      {/* Battle active indicator */}
      {battle && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
      )}

      <CardContent className="p-4">
        {/* Monster Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <img 
              src={monsterImage || CHAOS_MONSTER_IMAGE}
              alt={monster?.name || 'Monster'}
              className={`w-20 h-20 rounded-xl object-cover border-2 ${
                battle ? 'border-red-500' : 'border-slate-600'
              } ${isAttacking ? 'animate-pulse' : ''}`}
            />
            <div className="absolute -bottom-1 -right-1 text-2xl">
              {getMonsterTypeIcon(monster?.type || '')}
            </div>
            
            {/* Damage animation */}
            {showDamageAnimation && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-500 animate-bounce">
                  -{lastDamage}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-white truncate">{monster?.name || 'Unknown Monster'}</h4>
              <Badge className={getDifficultyColor(monster?.difficulty || 'easy')}>
                {monster?.difficulty || 'easy'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">{monster?.description || ''}</p>
            
            {/* Weakness */}
            {monster?.weakness_category && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Target className="w-3 h-3" />
                <span>Weak to: {monster.weakness_category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Health Bar */}
        {battle && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                Health
              </span>
              <span className="text-white font-medium">
                {battle.current_health} / {battle.max_health}
              </span>
            </div>
            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getHealthColor()} transition-all duration-500`}
                style={{ width: `${healthPercentage}%` }}
              />
              {/* Health segments */}
              <div className="absolute inset-0 flex">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 border-r border-slate-800/50 last:border-0" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Battle Info */}
        {isTeamBattle && battle && teamMembers.length > 0 && (
          <div className="mb-4 p-2 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
              <Users className="w-3 h-3" />
              <span>Team Damage</span>
            </div>
            <div className="space-y-1">
              {teamMembers.slice(0, 3).map((member, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{member.name}</span>
                  <span className="text-red-400 font-medium">{member.damage} dmg</span>
                </div>
              ))}
              {teamMembers.length > 3 && (
                <span className="text-xs text-slate-500">+{teamMembers.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Rewards Preview */}
        <div className="flex items-center gap-3 mb-4 p-2 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-1 text-xs">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-medium">{monster?.rewards?.tokens || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-purple-400 font-medium">{monster?.rewards?.experience || 0} XP</span>
          </div>
          {battle && battle.expires_at && (
            <div className="flex items-center gap-1 text-xs ml-auto">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">
                {Math.max(0, Math.ceil((new Date(battle.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)))}h left
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {battle ? (
          <div className="space-y-2">
            {/* Damage Ready */}
            <div className="flex items-center justify-between p-2 bg-red-900/30 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">Damage Ready</span>
              </div>
              <span className="text-lg font-bold text-red-400">{damageReady}</span>
            </div>
            
            <Button 
              onClick={handleAttack}
              disabled={!canAttack || isAttacking}
              className={`w-full ${
                canAttack 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                  : 'bg-slate-700'
              }`}
            >
              {isAttacking ? (
                <>
                  <Flame className="w-4 h-4 mr-2 animate-pulse" />
                  Attacking...
                </>
              ) : canAttack ? (
                <>
                  <Sword className="w-4 h-4 mr-2" />
                  Attack! (-{damageReady} HP)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Complete habits to attack
                </>
              )}
            </Button>
            
            {!canAttack && (
              <p className="text-xs text-center text-slate-500">
                Complete habits to deal damage. Each habit = 5 damage!
              </p>
            )}
          </div>
        ) : (
          <Button 
            onClick={handleStartBattle}
            disabled={isStartingBattle}
            className="w-full bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 disabled:opacity-50"
          >
            {isStartingBattle ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Battle...
              </>
            ) : (
              <>
                <Sword className="w-4 h-4 mr-2" />
                Start Battle
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </CardContent>

      {/* Boss indicator */}
      {monster?.difficulty === 'boss' && (
        <div className="absolute top-2 right-2">
          <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      )}
    </Card>
  );
};

// Team Battle Component
interface TeamBattleProps {
  battle: MonsterBattle;
  monster: ChaosMonster;
  monsterImage: string;
  teamName: string;
  participants: { id: string; name: string; damage: number; avatar?: string }[];
  onAttack: (battleId: string, damage: number) => void;
  habitsCompletedToday: number;
}

export const TeamBattleCard: React.FC<TeamBattleProps> = ({
  battle,
  monster,
  monsterImage,
  teamName,
  participants,
  onAttack,
  habitsCompletedToday
}) => {
  // Guard: if monster is undefined or missing required properties, don't render
  if (!monster || !monster.name || !battle) {
    return null;
  }

  const totalTeamDamage = participants.reduce((sum, p) => sum + p.damage, 0);
  const healthPercentage = (battle.current_health / battle.max_health) * 100;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-500/50">
      <CardContent className="p-6">
        {/* Team Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">{teamName}</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Team Battle
          </Badge>
        </div>

        {/* Monster Display */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center">
            <img 
              src={monsterImage || CHAOS_MONSTER_IMAGE}
              alt={monster?.name || 'Monster'}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-red-500/50 shadow-lg shadow-red-500/20"
            />
          </div>
          <div className="text-center mt-3">
            <h3 className="text-xl font-bold text-white">{monster?.name || 'Unknown Monster'}</h3>
            <p className="text-sm text-slate-400">{monster?.description || ''}</p>
          </div>
        </div>

        {/* Team Health Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Monster Health</span>
            <span className="text-white font-bold">{battle.current_health} / {battle.max_health}</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-400 mb-3">Team Damage Leaderboard</h4>
          <div className="space-y-2">
            {participants.sort((a, b) => b.damage - a.damage).slice(0, 5).map((p, idx) => (
              <div 
                key={p.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-800/50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-black' :
                  idx === 1 ? 'bg-slate-400 text-black' :
                  idx === 2 ? 'bg-amber-600 text-white' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-white">{p.name}</span>
                <span className="text-red-400 font-bold">{p.damage} dmg</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Total Team Damage</span>
              <span className="text-xl font-bold text-purple-400">{totalTeamDamage}</span>
            </div>
          </div>
        </div>

        {/* Attack Section */}
        <MonsterBattleCard
          battle={battle}
          monster={monster}
          monsterImage={monsterImage}
          onAttack={onAttack}
          habitsCompletedToday={habitsCompletedToday}
          isTeamBattle={true}
          teamMembers={participants}
        />
      </CardContent>
    </Card>
  );
};

export default MonsterBattleCard;
