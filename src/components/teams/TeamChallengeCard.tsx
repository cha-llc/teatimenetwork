import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, Users, Trophy, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { TeamChallenge, TeamChallengeProgress, TeamMember } from '@/hooks/useTeams';

interface TeamChallengeCardProps {
  challenge: TeamChallenge;
  members: TeamMember[];
  currentUserId: string;
  onUpdateProgress: (challengeId: string, completions: number) => Promise<boolean>;
  getLeaderboard: (challengeId: string) => Promise<TeamChallengeProgress[]>;
}

export function TeamChallengeCard({ 
  challenge, 
  members, 
  currentUserId, 
  onUpdateProgress,
  getLeaderboard 
}: TeamChallengeCardProps) {
  const [leaderboard, setLeaderboard] = useState<TeamChallengeProgress[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [myProgress, setMyProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [challenge.id]);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(challenge.id);
    setLeaderboard(data);
    
    const myEntry = data.find(p => p.user_id === currentUserId);
    if (myEntry) {
      setMyProgress(myEntry.completions);
    }
  };

  const handleIncrement = async () => {
    if (loading) return;
    setLoading(true);
    const newProgress = myProgress + 1;
    const success = await onUpdateProgress(challenge.id, newProgress);
    if (success) {
      setMyProgress(newProgress);
      await loadLeaderboard();
    }
    setLoading(false);
  };

  const handleDecrement = async () => {
    if (loading || myProgress <= 0) return;
    setLoading(true);
    const newProgress = myProgress - 1;
    const success = await onUpdateProgress(challenge.id, newProgress);
    if (success) {
      setMyProgress(newProgress);
      await loadLeaderboard();
    }
    setLoading(false);
  };

  const totalTeamProgress = leaderboard.reduce((sum, p) => sum + p.completions, 0);
  const teamTarget = challenge.target_completions * (members.length + 1);
  const teamProgressPercent = Math.min((totalTeamProgress / teamTarget) * 100, 100);

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  const isActive = challenge.status === 'active' && daysLeft > 0;

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    return member?.display_name || member?.email?.split('@')[0] || 'Unknown';
  };

  return (
    <Card className="overflow-hidden">
      <div className={`p-4 ${isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-500'}`}>
        <div className="flex items-start justify-between">
          <div className="text-white">
            <h3 className="font-bold text-lg">{challenge.title}</h3>
            <p className="text-white/80 text-sm">{challenge.habit_name}</p>
          </div>
          <Badge className={isActive ? 'bg-white/20 text-white' : 'bg-gray-400'}>
            {isActive ? `${daysLeft} days left` : 'Ended'}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {challenge.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {challenge.description}
          </p>
        )}

        {/* Team Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Team Progress
            </span>
            <span className="font-medium">
              {totalTeamProgress} / {teamTarget}
            </span>
          </div>
          <Progress value={teamProgressPercent} className="h-3" />
        </div>

        {/* My Progress */}
        {isActive && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Progress</p>
                <p className="text-2xl font-bold">
                  {myProgress} <span className="text-sm font-normal text-gray-500">/ {challenge.target_completions}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={loading || myProgress <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleIncrement}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress 
              value={(myProgress / challenge.target_completions) * 100} 
              className="h-2 mt-2" 
            />
          </div>
        )}

        {/* Leaderboard Toggle */}
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Leaderboard
          </span>
          {showLeaderboard ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No progress yet. Be the first!
              </p>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    entry.user_id === currentUserId 
                      ? 'bg-purple-50 dark:bg-purple-900/20' 
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="flex-1 font-medium text-sm">
                    {getMemberName(entry.user_id)}
                    {entry.user_id === currentUserId && (
                      <span className="text-purple-500 ml-1">(You)</span>
                    )}
                  </span>
                  <span className="font-bold text-green-600">
                    {entry.completions}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Challenge Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Target: {challenge.target_completions} each
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
