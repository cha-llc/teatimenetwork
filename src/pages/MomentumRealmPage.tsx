import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, User, Scroll, Sword, ShoppingBag, TreePine, 
  Crown, Coins, Zap, Heart, Shield, Star, Gift, 
  ChevronRight, Lock, CheckCircle2, Play, Users,
  Flame, BookOpen, Trophy, Map, AlertCircle
} from 'lucide-react';
import { useMomentumRealm } from '@/hooks/useMomentumRealm';
import { useHabits } from '@/hooks/useHabits';
import { AvatarCreator, AvatarData } from '@/components/realm/AvatarCreator';
import { QuestCard } from '@/components/realm/QuestCard';
import { MonsterBattleCard } from '@/components/realm/MonsterBattle';
import { RitualRoulette } from '@/components/realm/RitualRoulette';
import { toast } from 'sonner';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849317342_b4c56826.png';

export default function MomentumRealmPage() {
  const {
    profile,
    chapters,
    allies,
    quests,
    userQuests,
    monsters,
    activeBattles,
    shopItems,
    arTrees,
    loading,
    isSpinning,
    isDemoMode,
    getAllyImage,
    getMonsterImage,
    getTreeImage,
    getXPProgress,
    canSpinRoulette,
    getCurrentAlly,
    updateAvatar,
    startQuest,
    updateQuestProgress,
    startBattle,
    dealDamage,
    purchaseItem,
    plantTree,
    waterTree,
    spinRoulette,
    setActiveAlly,
    ROULETTE_REWARDS,
  } = useMomentumRealm();

  const { habits, completions } = useHabits();
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  // Track level changes for level-up effect
  useEffect(() => {
    if (profile && previousLevel !== null && profile.level > previousLevel) {
      setJustLeveledUp(true);
      // Remove the effect after animation
      const timer = setTimeout(() => setJustLeveledUp(false), 3000);
      return () => clearTimeout(timer);
    }
    if (profile) {
      setPreviousLevel(profile.level);
    }
  }, [profile?.level, previousLevel]);

  // Calculate today's completed habits
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = completions.filter(c => c.completed_date === today);
  const habitsCompletedToday = todayCompletions.length;

  const handleSaveAvatar = async (data: AvatarData) => {
    await updateAvatar(data);
    toast.success('Avatar updated!');
  };

  const handleStartQuest = async (questId: string) => {
    await startQuest(questId);
  };

  const handleCompleteQuest = async (userQuestId: string) => {
    const userQuest = userQuests.find(uq => uq.id === userQuestId);
    if (userQuest && userQuest.quest) {
      await updateQuestProgress(userQuestId, userQuest.quest.requirements.count || 1);
    }
  };

  const handleQuestProgress = async (userQuestId: string, newProgress: number) => {
    await updateQuestProgress(userQuestId, newProgress);
    toast.success('Quest progress updated!');
  };

  const handleStartBattle = async (monsterId: string) => {
    await startBattle(monsterId);
  };

  const handleAttack = async (battleId: string, damage: number) => {
    await dealDamage(battleId, damage);
  };

  const handlePurchase = async (itemId: string) => {
    const result = await purchaseItem(itemId);
    if (!result.success) {
      toast.error(result.error || 'Purchase failed');
    }
  };

  const handlePlantTree = async () => {
    const treeTypes = ['oak', 'cherry_blossom', 'crystal'];
    const randomType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
    await plantTree('demo-habit', randomType);
  };

  const handleWaterTree = async (treeId: string) => {
    await waterTree(treeId);
  };

  const xpProgress = profile ? getXPProgress(profile.experience, profile.level) : { current: 0, required: 100, percentage: 0 };
  const currentAlly = getCurrentAlly();
  const currentChapter = chapters.find(c => c.chapter_number === profile?.current_chapter);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
            <p className="mt-4 text-slate-400">Loading Momentum Realm...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <p className="text-sm text-purple-200">
              <strong>Demo Mode:</strong> Your progress is saved locally. Sign in to sync across devices and unlock multiplayer features.
            </p>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <img 
            src={HERO_IMAGE} 
            alt="Momentum Realm" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-transparent" />
          <div className="absolute inset-0 p-6 flex items-center">
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold text-white mb-2">
                Momentum Realm
              </h1>
              <p className="text-purple-200 mb-4">
                Transform your habits into an epic adventure. Complete quests, defeat monsters, and unlock legendary rewards!
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowAvatarCreator(true)}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Customize Avatar
                </Button>
                <Button 
                  onClick={() => setActiveTab('story')}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {profile?.current_chapter === 1 ? 'Start Story' : 'Continue Story'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats Bar */}
        {profile && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div 
                    data-testid="avatar"
                    className={`w-14 h-14 rounded-full border-2 border-purple-500 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors ${justLeveledUp ? 'level-up-effect animate-pulse ring-4 ring-yellow-400 ring-opacity-75' : ''}`}
                    style={{ backgroundColor: profile.avatar_appearance?.skin || '#FFDFC4' }}
                    onClick={() => setShowAvatarCreator(true)}
                  >
                    <User className="w-7 h-7 text-white/80" />
                  </div>

                  <div>
                    <div className="font-bold text-white">{profile.avatar_name}</div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Level {profile.level} {profile.avatar_class}
                    </Badge>
                  </div>
                </div>

                {/* XP Bar */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Experience</span>
                    <span className="text-purple-400">{xpProgress.current} / {xpProgress.required} XP</span>
                  </div>
                  <Progress value={xpProgress.percentage} className="h-2 bg-slate-700" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-5 h-5" />
                    <span className="font-bold">{profile.momentum_tokens}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-400">
                    <Sword className="w-5 h-5" />
                    <span className="font-bold">{profile.total_monsters_defeated}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">{profile.total_quests_completed}</span>
                  </div>
                </div>

                {/* Current Ally */}
                {currentAlly && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                    <img 
                      src={getAllyImage(currentAlly.name)} 
                      alt={currentAlly.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs text-slate-400">Ally</div>
                      <div className="text-sm font-medium text-white">{currentAlly.name}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-wrap h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              <Map className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="story" className="data-[state=active]:bg-purple-500">
              <BookOpen className="w-4 h-4 mr-2" />
              Story
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-purple-500">
              <Scroll className="w-4 h-4 mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="battles" className="data-[state=active]:bg-purple-500">
              <Sword className="w-4 h-4 mr-2" />
              Battles
            </TabsTrigger>
            <TabsTrigger value="allies" className="data-[state=active]:bg-purple-500">
              <Heart className="w-4 h-4 mr-2" />
              Allies
            </TabsTrigger>
            <TabsTrigger value="garden" className="data-[state=active]:bg-purple-500">
              <TreePine className="w-4 h-4 mr-2" />
              AR Garden
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-purple-500">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Chapter */}
                {currentChapter && (
                  <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                          <CardTitle className="text-lg text-white">
                            Chapter {currentChapter.chapter_number}: {currentChapter.title}
                          </CardTitle>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400">
                          In Progress
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 italic mb-4">"{currentChapter.narrative_intro}"</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                        <span>Required Level: {currentChapter.required_level}</span>
                        <span>Quests Needed: {currentChapter.required_quests}</span>
                      </div>
                      <Button 
                        onClick={() => setActiveTab('story')}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Full Story
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Active Quests */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Scroll className="w-5 h-5 text-blue-400" />
                        Active Quests
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setActiveTab('quests')}
                        className="text-purple-400"
                      >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userQuests.filter(uq => uq.status === 'active').slice(0, 3).map(uq => (
                        <QuestCard 
                          key={uq.id} 
                          quest={uq.quest!} 
                          userQuest={uq}
                          onComplete={handleCompleteQuest}
                          onProgress={handleQuestProgress}
                          compact
                        />
                      ))}
                      {userQuests.filter(uq => uq.status === 'active').length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <Scroll className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="mb-4">No active quests. Start one to begin your adventure!</p>
                          <Button 
                            onClick={() => setActiveTab('quests')}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Browse Quests
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Battles */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Sword className="w-5 h-5 text-red-400" />
                        Monster Battles
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setActiveTab('battles')}
                        className="text-purple-400"
                      >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeBattles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeBattles.slice(0, 2).map(battle => (
                          <MonsterBattleCard
                            key={battle.id}
                            battle={battle}
                            monster={battle.monster!}
                            monsterImage={getMonsterImage(battle.monster?.name || '')}
                            onAttack={handleAttack}
                            habitsCompletedToday={habitsCompletedToday}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Sword className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="mb-4">No active battles. Challenge a monster!</p>
                        <Button 
                          onClick={() => setActiveTab('battles')}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Sword className="w-4 h-4 mr-2" />
                          Find Monsters
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Ritual Roulette */}
                <RitualRoulette
                  canSpin={canSpinRoulette()}
                  onSpin={spinRoulette}
                  isSpinning={isSpinning}
                  rewards={ROULETTE_REWARDS}
                />

                {/* Daily Stats */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Today's Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Habits Completed</span>
                      <span className="text-xl font-bold text-green-400">{habitsCompletedToday}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Damage Ready</span>
                      <span className="text-xl font-bold text-red-400">{habitsCompletedToday * 5}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">AR Trees</span>
                      <span className="text-xl font-bold text-green-400">{arTrees.length}</span>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Complete habits to deal damage to monsters!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Story Tab */}
          <TabsContent value="story" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Your Epic Journey</h2>
              <p className="text-slate-400">
                Progress through chapters by completing quests and leveling up. Each chapter unlocks new content and rewards.
              </p>
            </div>
            <div className="space-y-4">
              {chapters.map((chapter) => {
                const isUnlocked = profile && profile.level >= chapter.required_level;
                const isCurrent = chapter.chapter_number === profile?.current_chapter;
                const isCompleted = profile && profile.current_chapter > chapter.chapter_number;

                return (
                  <Card 
                    key={chapter.id}
                    className={`border transition-all ${
                      isCurrent 
                        ? 'bg-gradient-to-r from-purple-900/50 to-slate-900 border-purple-500/50' 
                        : isCompleted
                        ? 'bg-slate-800/30 border-green-500/30'
                        : isUnlocked
                        ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-900/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-500/20' 
                            : isCurrent 
                            ? 'bg-purple-500/20' 
                            : isUnlocked
                            ? 'bg-slate-700'
                            : 'bg-slate-800'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : isUnlocked ? (
                            <span className="text-xl font-bold text-white">{chapter.chapter_number}</span>
                          ) : (
                            <Lock className="w-6 h-6 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-bold text-white">
                              Chapter {chapter.chapter_number}: {chapter.title}
                            </h3>
                            {isCurrent && (
                              <Badge className="bg-purple-500/20 text-purple-400">Current</Badge>
                            )}
                            {isCompleted && (
                              <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
                            )}
                          </div>
                          <p className="text-slate-400 mb-3">{chapter.description}</p>
                          {isUnlocked && (
                            <p className="text-slate-300 italic text-sm mb-3 border-l-2 border-purple-500 pl-3">
                              "{isCurrent || isCompleted ? chapter.narrative_intro : '???'}"
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className={`${isUnlocked ? 'text-green-400' : 'text-slate-500'}`}>
                              {isUnlocked ? '✓' : '🔒'} Required: Level {chapter.required_level}
                            </span>
                            <span className="text-yellow-400 flex items-center gap-1">
                              <Coins className="w-4 h-4" />
                              {chapter.rewards.tokens} tokens
                            </span>
                            <span className="text-purple-400 flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              {chapter.rewards.experience} XP
                            </span>
                          </div>
                          {isCurrent && (
                            <div className="mt-4">
                              <Button 
                                onClick={() => setActiveTab('quests')}
                                className="bg-purple-500 hover:bg-purple-600"
                              >
                                <Scroll className="w-4 h-4 mr-2" />
                                Complete Quests to Progress
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests" className="mt-6">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Available Quests</h2>
                <p className="text-slate-400">
                  Start quests to earn tokens, XP, and progress through the story. Click "Add Progress" to simulate completing habits!
                </p>
              </div>
              <Button 
                onClick={() => {
                  // Find a quest that hasn't been started yet
                  const availableQuest = quests.find(q => !userQuests.find(uq => uq.quest_id === q.id));
                  if (availableQuest) {
                    handleStartQuest(availableQuest.id);
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Start New Quest
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quests.map(quest => {
                const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
                return (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    userQuest={userQuest}
                    onStart={handleStartQuest}
                    onComplete={handleCompleteQuest}
                    onProgress={handleQuestProgress}
                  />
                );
              })}
            </div>
          </TabsContent>


          {/* Battles Tab */}
          <TabsContent value="battles" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Monster Battles</h2>
              <p className="text-slate-400">
                Challenge chaos monsters and defeat them by completing habits. Each habit completed = 5 damage!
              </p>
              <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  <strong>Your Damage Ready:</strong> {habitsCompletedToday * 5} (from {habitsCompletedToday} habits completed today)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monsters.map(monster => {
                const battle = activeBattles.find(b => b.monster_id === monster.id);
                return (
                  <MonsterBattleCard
                    key={monster.id}
                    battle={battle}
                    monster={monster}
                    monsterImage={getMonsterImage(monster.name)}
                    onStartBattle={handleStartBattle}
                    onAttack={handleAttack}
                    habitsCompletedToday={habitsCompletedToday}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* Allies Tab */}
          <TabsContent value="allies" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Your Allies</h2>
              <p className="text-slate-400">
                Unlock allies by completing achievements. Each ally provides unique passive bonuses!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allies.map(ally => {
                const isUnlocked = profile?.unlocked_allies.includes(ally.id);
                const isActive = profile?.current_ally_id === ally.id;

                return (
                  <Card 
                    key={ally.id}
                    className={`border transition-all ${
                      isActive 
                        ? 'border-purple-500 bg-purple-900/30' 
                        : isUnlocked
                        ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                        : 'border-slate-700 bg-slate-900/50 opacity-60'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="relative mb-3">
                        <img 
                          src={getAllyImage(ally.name)}
                          alt={ally.name}
                          className={`w-24 h-24 mx-auto rounded-full object-cover ${!isUnlocked ? 'grayscale' : ''}`}
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <Badge className="bg-purple-500 text-white">Active</Badge>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-white">{ally.name}</h3>
                      <Badge variant="outline" className={`text-xs mt-1 ${
                        ally.rarity === 'legendary' ? 'border-yellow-500 text-yellow-400' :
                        ally.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                        ally.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                        'border-slate-500 text-slate-400'
                      }`}>
                        {ally.rarity}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{ally.description}</p>
                      <div className="mt-3 text-xs text-slate-500">
                        <span className="text-green-400">+{ally.passive_bonus.value}%</span> {ally.passive_bonus.type.replace('_', ' ')}
                      </div>
                      {isUnlocked && !isActive && (
                        <Button 
                          size="sm" 
                          className="mt-3 w-full bg-purple-500 hover:bg-purple-600"
                          onClick={() => setActiveAlly(ally.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      {!isUnlocked && (
                        <p className="mt-3 text-xs text-slate-500">
                          {ally.unlock_requirement.type === 'default' ? 'Unlocked by default' :
                           ally.unlock_requirement.type === 'monsters_defeated' ? `Defeat ${ally.unlock_requirement.count} monsters` :
                           ally.unlock_requirement.type === 'quests_completed' ? `Complete ${ally.unlock_requirement.count} quests` :
                           ally.unlock_requirement.type === 'level' ? `Reach level ${ally.unlock_requirement.level}` :
                           'Complete requirements to unlock'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* AR Garden Tab */}
          <TabsContent value="garden" className="mt-6">
            <Card className="bg-gradient-to-br from-green-900/30 to-slate-900 border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <TreePine className="w-6 h-6 text-green-400" />
                      Your AR Habit Garden
                    </CardTitle>
                    <p className="text-slate-400 mt-1">
                      Plant trees and watch them grow as you complete habits!
                    </p>
                  </div>
                  <Button onClick={handlePlantTree} className="bg-green-500 hover:bg-green-600">
                    <TreePine className="w-4 h-4 mr-2" />
                    Plant New Tree
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {arTrees.length === 0 ? (
                  <div className="text-center py-12">
                    <TreePine className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Your garden is empty. Plant your first tree!</p>
                    <Button onClick={handlePlantTree} className="bg-green-500 hover:bg-green-600">
                      <TreePine className="w-4 h-4 mr-2" />
                      Plant First Tree
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {arTrees.map(tree => (
                      <Card key={tree.id} className="bg-slate-800/50 border-green-500/20">
                        <CardContent className="p-4 text-center">
                          <img 
                            src={getTreeImage(tree.tree_type)}
                            alt={tree.tree_type}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <div className="text-sm font-medium text-white capitalize">
                            {tree.tree_type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-slate-400">
                            Stage {tree.growth_stage}/5
                          </div>
                          <Progress 
                            value={(tree.growth_stage / 5) * 100} 
                            className="h-1 mt-2 bg-slate-700"
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="mt-2 text-green-400 hover:text-green-300 hover:bg-green-900/30"
                            onClick={() => handleWaterTree(tree.id)}
                          >
                            Water Tree
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="mt-6">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Token Shop</h2>
                <p className="text-slate-400">Spend your hard-earned tokens on rewards!</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">{profile?.momentum_tokens || 0}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {shopItems.map(item => {
                const canAfford = (profile?.momentum_tokens || 0) >= item.price_tokens;
                
                return (
                  <Card 
                    key={item.id}
                    className={`border transition-all hover:border-purple-500/50 ${
                      item.is_premium ? 'bg-gradient-to-br from-purple-900/30 to-slate-900 border-purple-500/30' : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {item.category}
                        </Badge>
                        {item.is_premium && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="w-full h-24 bg-slate-700/50 rounded-lg mb-3 flex items-center justify-center">
                        <Gift className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-bold">{item.price_tokens}</span>
                        </div>
                        <Button 
                          size="sm"
                          disabled={!canAfford}
                          onClick={() => handlePurchase(item.id)}
                          className={canAfford ? 'bg-purple-500 hover:bg-purple-600' : 'bg-slate-600'}
                        >
                          {canAfford ? 'Buy' : 'Need More'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Avatar Creator Modal */}
      <AvatarCreator
        isOpen={showAvatarCreator}
        onClose={() => setShowAvatarCreator(false)}
        onSave={handleSaveAvatar}
        initialData={profile ? {
          avatar_name: profile.avatar_name,
          avatar_class: profile.avatar_class,
          avatar_appearance: profile.avatar_appearance
        } : undefined}
      />
    </PageWrapper>
  );
}
