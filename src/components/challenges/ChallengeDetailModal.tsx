import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Lock, 
  Flame,
  Target,
  Medal,
  Crown,
  Share2,
  CheckCircle,
  LogOut,
  Zap
} from 'lucide-react';
import { Challenge, Participant, Team } from '@/hooks/useChallenges';
import { InviteFriendsModal } from './InviteFriendsModal';

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  leaderboard: Participant[];
  teamLeaderboard: Team[];
  isParticipant: boolean;
  isPremium: boolean;
  onJoin: (teamId?: string) => Promise<boolean>;
  onLeave: () => Promise<boolean>;
  onCheckIn: () => Promise<any>;
  onInvite: (emails: string[]) => Promise<any>;
  loading: boolean;
}

export function ChallengeDetailModal({
  isOpen,
  onClose,
  challenge,
  leaderboard,
  teamLeaderboard,
  isParticipant,
  isPremium,
  onJoin,
  onLeave,
  onCheckIn,
  onInvite,
  loading
}: ChallengeDetailModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);

  if (!challenge) return null;

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, (daysElapsed / totalDays) * 100);

  const currentUserParticipant = leaderboard.find(p => isParticipant);
  const userRank = leaderboard.findIndex(p => isParticipant) + 1;

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const result = await onCheckIn();
      if (result?.newBadges?.length > 0) {
        setNewBadges(result.newBadges);
        setTimeout(() => setNewBadges([]), 5000);
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const handleJoin = async () => {
    await onJoin(selectedTeam);
  };

  const copyInviteLink = () => {
    if (challenge.invite_code) {
      navigator.clipboard.writeText(`${window.location.origin}/challenges?code=${challenge.invite_code}`);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {challenge.is_private && (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {challenge.challenge_type === 'team' && (
                    <Badge className="bg-orange-500/20 text-orange-400">
                      <Users className="w-3 h-3 mr-1" />
                      Team
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {challenge.title}
                </DialogTitle>
              </div>
              {isParticipant && isActive && (
                <Button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* New Badge Animation */}
          {newBadges.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-amber-400 font-semibold">New Badge Earned!</p>
                  {newBadges.map((badge, i) => (
                    <p key={i} className="text-white">{badge.badge_icon} {badge.badge_name}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Challenge Info */}
          <div className="space-y-4">
            <p className="text-slate-400">{challenge.description}</p>

            {/* Progress */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Challenge Progress</span>
                <span className="text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>{startDate.toLocaleDateString()}</span>
                <span>{endDate.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <Users className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-white font-bold">{leaderboard.length}</p>
                <p className="text-slate-500 text-xs">Participants</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-white font-bold">{challenge.goal_target}</p>
                <p className="text-slate-500 text-xs capitalize">{challenge.goal_unit}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-bold">{totalDays - daysElapsed}</p>
                <p className="text-slate-500 text-xs">Days Left</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-white font-bold">
                  {leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.current_streak)) : 0}
                </p>
                <p className="text-slate-500 text-xs">Top Streak</p>
              </div>
            </div>

            {/* Your Stats (if participant) */}
            {isParticipant && currentUserParticipant && (
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  Your Progress
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">#{userRank}</p>
                    <p className="text-slate-400 text-xs">Rank</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{currentUserParticipant.current_streak}</p>
                    <p className="text-slate-400 text-xs">Current Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{currentUserParticipant.total_completions}</p>
                    <p className="text-slate-400 text-xs">Completions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-400">{currentUserParticipant.points}</p>
                    <p className="text-slate-400 text-xs">Points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboards */}
            <Tabs defaultValue="points" className="w-full">
              <TabsList className="bg-slate-800 w-full">
                <TabsTrigger value="points" className="flex-1">Points</TabsTrigger>
                <TabsTrigger value="streaks" className="flex-1">Streaks</TabsTrigger>
                {challenge.challenge_type === 'team' && (
                  <TabsTrigger value="teams" className="flex-1">Teams</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="points" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {leaderboard.slice(0, 10).map((participant, index) => (
                    <div 
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0 ? 'bg-amber-500/20 border border-amber-500/30' :
                        index === 1 ? 'bg-slate-400/20 border border-slate-400/30' :
                        index === 2 ? 'bg-orange-700/20 border border-orange-700/30' :
                        'bg-slate-800/50'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {index === 0 ? <Crown className="w-6 h-6 text-amber-400" /> :
                         index === 1 ? <Medal className="w-6 h-6 text-slate-300" /> :
                         index === 2 ? <Medal className="w-6 h-6 text-orange-600" /> :
                         <span className="text-slate-400 font-bold">{index + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{participant.user_name}</p>
                        <p className="text-slate-500 text-xs">
                          {participant.total_completions} completions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-400 font-bold">{participant.points}</p>
                        <p className="text-slate-500 text-xs">points</p>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No participants yet</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="streaks" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...leaderboard].sort((a, b) => b.current_streak - a.current_streak).slice(0, 10).map((participant, index) => (
                    <div 
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0 ? 'bg-orange-500/20 border border-orange-500/30' :
                        'bg-slate-800/50'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {index === 0 ? <Flame className="w-6 h-6 text-orange-400" /> :
                         <span className="text-slate-400 font-bold">{index + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{participant.user_name}</p>
                        <p className="text-slate-500 text-xs">
                          Best: {participant.best_streak} days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {participant.current_streak}
                        </p>
                        <p className="text-slate-500 text-xs">day streak</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {challenge.challenge_type === 'team' && (
                <TabsContent value="teams" className="mt-4">
                  <div className="space-y-2">
                    {teamLeaderboard.map((team, index) => (
                      <div 
                        key={team.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50"
                        style={{ borderLeft: `4px solid ${team.color}` }}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {index === 0 ? <Trophy className="w-6 h-6 text-amber-400" /> :
                           <span className="text-slate-400 font-bold">{index + 1}</span>}
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{team.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-400 font-bold">{team.total_points}</p>
                          <p className="text-slate-500 text-xs">team points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Team Selection for Joining */}
            {!isParticipant && challenge.challenge_type === 'team' && challenge.challenge_teams && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Select Your Team</h4>
                <div className="grid grid-cols-2 gap-2">
                  {challenge.challenge_teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTeam === team.id 
                          ? 'border-indigo-500 bg-indigo-500/10' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-white">{team.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              {!isParticipant ? (
                <Button
                  onClick={handleJoin}
                  disabled={loading || (challenge.challenge_type === 'team' && !selectedTeam)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {loading ? 'Joining...' : 'Join Challenge'}
                </Button>
              ) : (
                <>
                  {isPremium && challenge.is_private && (
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteModal(true)}
                      className="border-slate-600 hover:border-indigo-500"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Invite Friends
                    </Button>
                  )}
                  {challenge.invite_code && (
                    <Button
                      variant="outline"
                      onClick={copyInviteLink}
                      className="border-slate-600 hover:border-indigo-500"
                    >
                      Copy Invite Link
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={onLeave}
                    disabled={loading}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={onInvite}
        inviteCode={challenge.invite_code}
      />
    </>
  );
}
