import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Clock, Trophy, User, Zap } from 'lucide-react';
import type { DisciplineDuel } from '@/hooks/useCommunityHubs';

interface DuelCardProps {
  duel: DisciplineDuel;
  onAccept?: (duelId: string) => void;
  onView?: (duel: DisciplineDuel) => void;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Waiting for Opponent' },
  active: { color: 'bg-green-100 text-green-700', label: 'In Progress' },
  completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
  cancelled: { color: 'bg-gray-100 text-gray-700', label: 'Cancelled' }
};

export function DuelCard({ duel, onAccept, onView }: DuelCardProps) {
  const config = statusConfig[duel.status] || statusConfig.pending;
  const endsAt = duel.ends_at ? new Date(duel.ends_at) : null;
  const daysLeft = endsAt ? Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const getScoreColor = (score1: number, score2: number, isFirst: boolean) => {
    if (score1 === score2) return 'text-gray-600';
    if (isFirst) return score1 > score2 ? 'text-green-600' : 'text-red-600';
    return score2 > score1 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onView?.(duel)}>
      <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Swords className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold">{duel.title}</h3>
              <p className="text-xs text-gray-500">{duel.habit_category} challenge</p>
            </div>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>

        {duel.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {duel.description}
          </p>
        )}

        {/* Competitors */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              {duel.challenger?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="font-medium text-sm">{duel.challenger?.name || 'Challenger'}</p>
              <p className={`text-2xl font-bold ${getScoreColor(duel.challenger_score, duel.opponent_score, true)}`}>
                {duel.challenger_score}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-xs text-gray-500 font-medium">VS</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-medium text-sm">{duel.opponent?.name || 'Waiting...'}</p>
              <p className={`text-2xl font-bold ${getScoreColor(duel.challenger_score, duel.opponent_score, false)}`}>
                {duel.opponent_score}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white font-bold">
              {duel.opponent?.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Stakes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800 dark:text-yellow-200">Stakes:</span>
            <span className="text-yellow-700 dark:text-yellow-300">{duel.stake}</span>
          </div>
        </div>

        {/* Duration/Time */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duel.duration_days} day challenge</span>
          </div>
          {daysLeft !== null && daysLeft > 0 && (
            <span className="font-medium text-orange-600">{daysLeft} days left</span>
          )}
        </div>

        {/* Actions */}
        {duel.status === 'pending' && !duel.opponent_id && onAccept && (
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onAccept(duel.id);
            }}
          >
            <Swords className="w-4 h-4 mr-2" />
            Accept Challenge
          </Button>
        )}

        {duel.status === 'active' && (
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
              style={{ 
                width: `${((duel.duration_days - (daysLeft || 0)) / duel.duration_days) * 100}%` 
              }}
            />
          </div>
        )}

        {duel.status === 'completed' && duel.winner_id && (
          <div className="text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Winner: {duel.winner_id === duel.challenger_id ? duel.challenger?.name : duel.opponent?.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
