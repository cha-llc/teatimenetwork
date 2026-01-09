import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChallenges, Challenge } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeModal } from '@/components/challenges/CreateChallengeModal';
import { ChallengeDetailModal } from '@/components/challenges/ChallengeDetailModal';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import SEOHead, { SEO_CONFIG, generatePageStructuredData } from '@/components/seo/SEOHead';
import {
  Users,
  Plus,
  Search,
  Trophy,
  Flame,
  Target,
  Crown,
  Sparkles,
  Medal,
  Lock
} from 'lucide-react';

export default function ChallengesPage() {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    challenges,
    currentChallenge,
    leaderboard,
    teamLeaderboard,
    userBadges,
    isParticipant,
    loading,
    error,
    listChallenges,
    getChallenge,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    checkIn,
    inviteFriends,
    joinByCode,
    getUserBadges
  } = useChallenges();

  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'joined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinCodeError, setJoinCodeError] = useState('');

  // Check for invite code in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code && user) {
      handleJoinByCode(code);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (user) {
      listChallenges(activeTab);
      getUserBadges();
    }
  }, [user, activeTab, listChallenges, getUserBadges]);

  const handleViewChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    await getChallenge(challenge.id);
    setShowDetailModal(true);
  };

  const handleJoinChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    await getChallenge(challenge.id);
    setShowDetailModal(true);
  };

  const handleJoinFromModal = async (teamId?: string) => {
    if (!selectedChallenge) return false;
    const success = await joinChallenge(
      selectedChallenge.id,
      teamId,
      selectedChallenge.invite_code
    );
    if (success) {
      await getChallenge(selectedChallenge.id);
    }
    return success;
  };

  const handleLeaveFromModal = async () => {
    if (!selectedChallenge) return false;
    const success = await leaveChallenge(selectedChallenge.id);
    if (success) {
      setShowDetailModal(false);
      listChallenges(activeTab);
    }
    return success;
  };

  const handleCheckInFromModal = async () => {
    if (!selectedChallenge) return null;
    const result = await checkIn(selectedChallenge.id);
    if (result) {
      await getChallenge(selectedChallenge.id);
    }
    return result;
  };

  const handleInviteFromModal = async (emails: string[]) => {
    if (!selectedChallenge) return null;
    return await inviteFriends(selectedChallenge.id, emails);
  };

  const handleJoinByCode = async (code?: string) => {
    const codeToUse = code || joinCodeInput.trim();
    if (!codeToUse) return;

    setJoinCodeError('');
    const result = await joinByCode(codeToUse);
    if (result) {
      setJoinCodeInput('');
      listChallenges('joined');
      setActiveTab('joined');
    } else {
      setJoinCodeError('Invalid invite code');
    }
  };

  const filteredChallenges = challenges.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get joined challenge IDs for marking
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (activeTab === 'joined') {
      setJoinedChallengeIds(new Set(challenges.map(c => c.id)));
    }
  }, [challenges, activeTab]);

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Community Challenges</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to join challenges, compete with friends, and earn badges!
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Community Challenges"
      description="Compete with friends and build habits together"
      icon={<Users className="w-5 h-5" />}
      action={
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      }
    >
      <SEOHead 
        {...SEO_CONFIG.challenges}
        canonicalUrl="https://teatimenetwork.com/challenges"
        structuredData={generatePageStructuredData('challenges', 'https://teatimenetwork.com/challenges')}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userBadges.length}</p>
            <p className="text-muted-foreground text-sm">Badges Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {challenges.filter(c => activeTab === 'joined').length || 0}
            </p>
            <p className="text-muted-foreground text-sm">Active Challenges</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-muted-foreground text-sm">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-muted-foreground text-sm">Wins</p>
          </CardContent>
        </Card>
      </div>

      {/* Join by Code */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <span>Have an invite code?</span>
            </div>
            <div className="flex-1 flex gap-2 w-full sm:w-auto">
              <Input
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., ABC12345)"
                className="uppercase"
                maxLength={8}
              />
              <Button
                onClick={() => handleJoinByCode()}
                disabled={!joinCodeInput.trim()}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                Join
              </Button>
            </div>
            {joinCodeError && (
              <span className="text-red-500 text-sm">{joinCodeError}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges Display */}
      {userBadges.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Your Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {userBadges.slice(0, 10).map((badge) => (
                <Badge
                  key={badge.id}
                  className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300 px-3 py-1"
                >
                  <span className="mr-1">{badge.badge_icon}</span>
                  {badge.badge_name}
                </Badge>
              ))}
              {userBadges.length > 10 && (
                <Badge variant="outline">
                  +{userBadges.length - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges..."
            className="pl-10"
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">Discover</TabsTrigger>
            <TabsTrigger value="joined" className="flex-1 sm:flex-none">Joined</TabsTrigger>
            <TabsTrigger value="my" className="flex-1 sm:flex-none">Created</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Premium Banner for Private Challenges */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 mb-6">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-500" />
              <div>
                <p className="font-semibold">Unlock Private Challenges</p>
                <p className="text-muted-foreground text-sm">
                  Create private challenges and invite friends via email
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/insights')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 w-full sm:w-auto"
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Challenges Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'all' ? 'No Public Challenges Yet' :
               activeTab === 'joined' ? 'No Joined Challenges' :
               'No Created Challenges'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'all' ? 'Be the first to create a challenge!' :
               activeTab === 'joined' ? 'Join a challenge to get started!' :
               'Create your first challenge and invite friends!'}
            </p>
            <Button
              onClick={() => activeTab === 'joined' ? setActiveTab('all') : setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              {activeTab === 'joined' ? 'Browse Challenges' : 'Create Challenge'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onView={handleViewChallenge}
              onJoin={handleJoinChallenge}
              isJoined={joinedChallengeIds.has(challenge.id) || activeTab === 'joined'}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Modals */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createChallenge}
        isPremium={isPremium}
      />

      <ChallengeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        challenge={currentChallenge}
        leaderboard={leaderboard}
        teamLeaderboard={teamLeaderboard}
        isParticipant={isParticipant}
        isPremium={isPremium}
        onJoin={handleJoinFromModal}
        onLeave={handleLeaveFromModal}
        onCheckIn={handleCheckInFromModal}
        onInvite={handleInviteFromModal}
        loading={loading}
      />
    </PageWrapper>
  );
}
