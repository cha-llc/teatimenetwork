import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users, Plus, Trophy, Target, Activity, Crown, 
  Settings, UserPlus, Sparkles, Lock, TrendingUp,
  Calendar, Award, ChevronRight, Copy, Check
} from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/contexts/AuthContext';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { InviteMemberModal } from '@/components/teams/InviteMemberModal';
import { TeamMemberCard } from '@/components/teams/TeamMemberCard';
import { TeamChallengeCard } from '@/components/teams/TeamChallengeCard';
import { CreateTeamChallengeModal } from '@/components/teams/CreateTeamChallengeModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TeamsPage() {
  const { user, profile } = useAuth();
  const {
    teams,
    currentTeam,
    setCurrentTeam,
    members,
    challenges,
    achievements,
    activity,
    teamStats,
    loading,
    isUltimate,
    createTeam,
    inviteMember,
    removeMember,
    joinByInviteCode,
    createChallenge,
    updateChallengeProgress,
    getChallengeLeaderboard
  } = useTeams();

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;
    setJoiningTeam(true);
    await joinByInviteCode(joinCode.trim());
    setJoiningTeam(false);
    setJoinCode('');
  };

  const copyInviteCode = async () => {
    if (!currentTeam) return;
    try {
      await navigator.clipboard.writeText(currentTeam.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isTeamOwner = currentTeam?.owner_id === user?.id;
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  // Ultimate tier gate
  if (!isUltimate) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Team Sharing</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Create teams, invite family members, and complete challenges together. 
            This feature is exclusively available for Ultimate tier subscribers.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl mb-8">
            <h3 className="font-semibold text-lg mb-4">What you get with Teams:</h3>
            <ul className="text-left space-y-3 max-w-md mx-auto">
              <li className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Invite up to 5 family members or friends</span>
              </li>
              <li className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-500" />
                <span>Create shared habit challenges</span>
              </li>
              <li className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Team leaderboards and achievements</span>
              </li>
              <li className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <span>Track collective progress together</span>
              </li>
            </ul>
          </div>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Upgrade to Ultimate
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // No teams yet
  if (teams.length === 0 && !loading) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Create Your First Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Start a team to share habits and challenges with family or friends.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg"
              onClick={() => setShowCreateTeam(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create a Team
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Have an invite code?</h3>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input
                placeholder="Enter invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="font-mono"
              />
              <Button 
                onClick={handleJoinTeam}
                disabled={!joinCode.trim() || joiningTeam}
              >
                {joiningTeam ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </div>
        </div>

        <CreateTeamModal
          isOpen={showCreateTeam}
          onClose={() => setShowCreateTeam(false)}
          onCreateTeam={createTeam}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              Teams
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Collaborate with family and friends
            </p>
          </div>

          <div className="flex items-center gap-3">
            {teams.length > 1 && (
              <Select
                value={currentTeam?.id}
                onValueChange={(id) => {
                  const team = teams.find(t => t.id === id);
                  if (team) setCurrentTeam(team);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setShowCreateTeam(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </div>
        </div>

        {currentTeam && (
          <>
            {/* Team Header Card */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
                      {isTeamOwner && (
                        <Badge className="bg-white/20 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                    </div>
                    {currentTeam.description && (
                      <p className="text-white/80">{currentTeam.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                      <p className="text-xs text-white/70">Invite Code</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{currentTeam.invite_code}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white hover:bg-white/20"
                          onClick={copyInviteCode}
                        >
                          {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setShowInviteMember(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            {teamStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{teamStats.memberCount}</p>
                        <p className="text-xs text-gray-500">Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Target className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{teamStats.activeChallenges}</p>
                        <p className="text-xs text-gray-500">Active Challenges</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{teamStats.totalCompletions}</p>
                        <p className="text-xs text-gray-500">Total Completions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{teamStats.totalAchievements}</p>
                        <p className="text-xs text-gray-500">Achievements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Challenges</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Awards</span>
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Top Performer */}
                  {teamStats?.topPerformer && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Top Performer
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={teamStats.topPerformer.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xl">
                              {teamStats.topPerformer.display_name?.[0] || 'T'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-lg">
                              {teamStats.topPerformer.display_name}
                            </p>
                            <p className="text-gray-500">Leading the team!</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Weekly Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-green-500">
                          {teamStats?.weeklyCompletions || 0}
                        </p>
                        <p className="text-gray-500">completions this week</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activity.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No activity yet. Start a challenge to get going!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activity.slice(0, 10).map((item) => {
                          const member = members.find(m => m.user_id === item.user_id);
                          return (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                  {member?.display_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{member?.display_name || 'Unknown'}</span>
                                  {' '}
                                  {item.action.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(item.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Team Challenges</h3>
                  <Button onClick={() => setShowCreateChallenge(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Challenge
                  </Button>
                </div>

                {activeChallenges.length === 0 && completedChallenges.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Challenges Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create a challenge to motivate your team!
                    </p>
                    <Button onClick={() => setShowCreateChallenge(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Challenge
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {activeChallenges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Active Challenges</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {activeChallenges.map(challenge => (
                            <TeamChallengeCard
                              key={challenge.id}
                              challenge={challenge}
                              members={members}
                              currentUserId={user?.id || ''}
                              onUpdateProgress={updateChallengeProgress}
                              getLeaderboard={getChallengeLeaderboard}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {completedChallenges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Completed Challenges</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {completedChallenges.map(challenge => (
                            <TeamChallengeCard
                              key={challenge.id}
                              challenge={challenge}
                              members={members}
                              currentUserId={user?.id || ''}
                              onUpdateProgress={updateChallengeProgress}
                              getLeaderboard={getChallengeLeaderboard}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Team Members ({members.length + 1})
                  </h3>
                  <Button onClick={() => setShowInviteMember(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>

                <div className="grid gap-4">
                  {/* Owner Card */}
                  <Card className="p-4 border-2 border-yellow-300 dark:border-yellow-600">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                          {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {profile?.full_name || user?.email?.split('@')[0]}
                          </span>
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Owner
                      </Badge>
                    </div>
                  </Card>

                  {/* Other Members */}
                  {members
                    .filter(m => m.user_id !== user?.id)
                    .map(member => (
                      <TeamMemberCard
                        key={member.id}
                        member={member}
                        isOwner={isTeamOwner}
                        canManage={isTeamOwner}
                        onRemove={removeMember}
                      />
                    ))}
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <h3 className="text-lg font-semibold">Team Achievements</h3>

                {achievements.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Achievements Yet</h3>
                    <p className="text-gray-500">
                      Complete challenges together to earn team achievements!
                    </p>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {achievements.map(achievement => (
                      <Card key={achievement.id} className="p-4 text-center">
                        <div className="text-4xl mb-2">{achievement.icon || '🏆'}</div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onCreateTeam={createTeam}
      />

      {currentTeam && (
        <>
          <InviteMemberModal
            isOpen={showInviteMember}
            onClose={() => setShowInviteMember(false)}
            team={currentTeam}
            members={members}
            onInvite={(email, displayName) => inviteMember(currentTeam.id, email, displayName)}
          />

          <CreateTeamChallengeModal
            isOpen={showCreateChallenge}
            onClose={() => setShowCreateChallenge(false)}
            teamId={currentTeam.id}
            onCreateChallenge={createChallenge}
          />
        </>
      )}
    </PageWrapper>
  );
}
