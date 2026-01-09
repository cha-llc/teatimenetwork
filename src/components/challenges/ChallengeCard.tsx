import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Lock, 
  Flame,
  Target,
  Clock
} from 'lucide-react';
import { Challenge } from '@/hooks/useChallenges';

interface ChallengeCardProps {
  challenge: Challenge;
  onView: (challenge: Challenge) => void;
  onJoin?: (challenge: Challenge) => void;
  isJoined?: boolean;
}

const habitTypeColors: Record<string, string> = {
  fitness: 'bg-green-500/20 text-green-400 border-green-500/30',
  health: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  productivity: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  mindfulness: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  learning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  social: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  finance: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  creativity: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const habitTypeIcons: Record<string, React.ReactNode> = {
  fitness: <Flame className="w-4 h-4" />,
  health: <Target className="w-4 h-4" />,
  productivity: <Clock className="w-4 h-4" />,
  mindfulness: <Target className="w-4 h-4" />,
  learning: <Target className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
  finance: <Target className="w-4 h-4" />,
  creativity: <Target className="w-4 h-4" />,
  other: <Target className="w-4 h-4" />
};

export function ChallengeCard({ challenge, onView, onJoin, isJoined }: ChallengeCardProps) {
  const participantCount = challenge.challenge_participants?.[0]?.count || 0;
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all duration-300 group cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        {/* Header gradient */}
        <div className={`h-2 ${
          challenge.challenge_type === 'team' 
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500' 
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        }`} />
        
        <div className="p-5">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={habitTypeColors[challenge.habit_type] || habitTypeColors.other}>
                {habitTypeIcons[challenge.habit_type]}
                <span className="ml-1 capitalize">{challenge.habit_type}</span>
              </Badge>
              {challenge.is_private && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            {challenge.challenge_type === 'team' && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Users className="w-3 h-3 mr-1" />
                Team
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {challenge.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {challenge.description || 'Join this challenge and build better habits together!'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center text-indigo-400 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-white font-semibold">{participantCount}</p>
              <p className="text-slate-500 text-xs">Participants</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center text-green-400 mb-1">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-white font-semibold">{challenge.goal_target}</p>
              <p className="text-slate-500 text-xs capitalize">{challenge.goal_unit}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center text-amber-400 mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-white font-semibold">
                {isActive ? daysLeft : isUpcoming ? 'Soon' : 'Ended'}
              </p>
              <p className="text-slate-500 text-xs">
                {isActive ? 'Days Left' : isUpcoming ? 'Starting' : 'Status'}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-green-500 animate-pulse' : 
                isUpcoming ? 'bg-amber-500' : 'bg-slate-500'
              }`} />
              <span className={`text-sm ${
                isActive ? 'text-green-400' : 
                isUpcoming ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {isActive ? 'Active Now' : isUpcoming ? 'Starting Soon' : 'Completed'}
              </span>
            </div>
            {challenge.reward_badge && (
              <div className="flex items-center gap-1 text-amber-400">
                <Trophy className="w-4 h-4" />
                <span className="text-xs">Badge Reward</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10"
              onClick={() => onView(challenge)}
            >
              View Details
            </Button>
            {!isJoined && onJoin && isActive && (
              <Button 
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(challenge);
                }}
              >
                Join Challenge
              </Button>
            )}
            {isJoined && (
              <Badge className="flex-1 justify-center bg-green-500/20 text-green-400 border-green-500/30 py-2">
                Joined
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
