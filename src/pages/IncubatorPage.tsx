import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncubatorCard } from '@/components/incubator/IncubatorCard';
import { ProposeHabitModal } from '@/components/incubator/ProposeHabitModal';
import { IncubatorDetailModal } from '@/components/incubator/IncubatorDetailModal';
import { useIncubator, IncubatorHabit } from '@/hooks/useIncubator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Plus, 
  Search, 
  Beaker, 
  Crown, 
  Sparkles, 
  Clock,
  TrendingUp,
  Lock,
  Loader2,
  Filter,
  Coffee,
  Leaf
} from 'lucide-react';

export default function IncubatorPage() {
  const { user, profile } = useAuth();
  const isPremium = profile?.is_premium;
  const { language } = useLanguage();

  const {
    incubatorHabits,
    loading,
    evolving,
    proposeHabit,
    vote,
    joinTesting,
    submitFeedback,
    evolveHabit,
    getEvolutions
  } = useIncubator();

  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<IncubatorHabit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flavorFilter, setFlavorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('votes');

  // Filter and sort habits
  const filteredHabits = incubatorHabits
    .filter(habit => {
      if (searchQuery && !habit.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && habit.status !== statusFilter) {
        return false;
      }
      if (flavorFilter !== 'all' && habit.flavor_profile !== flavorFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.vote_count - a.vote_count;
        case 'testers':
          return b.test_count - a.test_count;
        case 'success':
          return b.success_rate - a.success_rate;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const steepingHabits = filteredHabits.filter(h => h.status === 'steeping');
  const testingHabits = filteredHabits.filter(h => h.status === 'testing');
  const evolvedHabits = filteredHabits.filter(h => h.status === 'evolved');
  const immortalHabits = filteredHabits.filter(h => h.status === 'immortal');

  // Premium gate for non-premium users
  if (!isPremium) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {language === 'es' ? 'Incubadora de Hábitos' : 'Habit Incubator'}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {language === 'es' 
              ? 'Propón, vota y evoluciona hábitos con la comunidad. Función exclusiva para usuarios premium.'
              : 'Propose, vote, and evolve habits with the community. Exclusive feature for premium users.'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Beaker className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <div className="text-sm font-medium">{language === 'es' ? 'Proponer' : 'Propose'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">{language === 'es' ? 'Votar' : 'Vote'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-sm font-medium">{language === 'es' ? 'Evolucionar' : 'Evolve'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <div className="text-sm font-medium">{language === 'es' ? 'Inmortalizar' : 'Immortalize'}</div>
              </CardContent>
            </Card>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            {language === 'es' ? 'Actualizar a Premium' : 'Upgrade to Premium'}
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={language === 'es' ? 'Incubadora de Hábitos' : 'Habit Incubator'}
      description={language === 'es' 
        ? 'Donde las ideas de hábitos se infusionan, evolucionan y se inmortalizan'
        : 'Where habit ideas steep, evolve, and become immortal'}
      icon={<Coffee className="w-5 h-5" />}
      action={
        <Button 
          onClick={() => setShowProposeModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          {language === 'es' ? 'Proponer Hábito' : 'Propose Habit'}
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{steepingHabits.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'es' ? 'Infusionando' : 'Steeping'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Beaker className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{testingHabits.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'es' ? 'En Prueba' : 'Testing'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{evolvedHabits.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'es' ? 'Evolucionados' : 'Evolved'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{immortalHabits.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'es' ? 'Inmortales' : 'Immortal'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'es' ? 'Buscar hábitos...' : 'Search habits...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={language === 'es' ? 'Estado' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'es' ? 'Todos' : 'All'}</SelectItem>
            <SelectItem value="steeping">{language === 'es' ? 'Infusionando' : 'Steeping'}</SelectItem>
            <SelectItem value="testing">{language === 'es' ? 'En Prueba' : 'Testing'}</SelectItem>
            <SelectItem value="evolved">{language === 'es' ? 'Evolucionado' : 'Evolved'}</SelectItem>
            <SelectItem value="immortal">{language === 'es' ? 'Inmortal' : 'Immortal'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={flavorFilter} onValueChange={setFlavorFilter}>
          <SelectTrigger className="w-[180px]">
            <Leaf className="w-4 h-4 mr-2" />
            <SelectValue placeholder={language === 'es' ? 'Sabor' : 'Flavor'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'es' ? 'Todos' : 'All'}</SelectItem>
            <SelectItem value="mild">{language === 'es' ? 'Suave' : 'Mild'}</SelectItem>
            <SelectItem value="medium">{language === 'es' ? 'Medio' : 'Medium'}</SelectItem>
            <SelectItem value="spicy">{language === 'es' ? 'Picante' : 'Spicy'}</SelectItem>
            <SelectItem value="bold">{language === 'es' ? 'Audaz' : 'Bold'}</SelectItem>
            <SelectItem value="exotic">{language === 'es' ? 'Exótico' : 'Exotic'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <TrendingUp className="w-4 h-4 mr-2" />
            <SelectValue placeholder={language === 'es' ? 'Ordenar' : 'Sort'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">{language === 'es' ? 'Más Votados' : 'Most Voted'}</SelectItem>
            <SelectItem value="testers">{language === 'es' ? 'Más Probadores' : 'Most Testers'}</SelectItem>
            <SelectItem value="success">{language === 'es' ? 'Mayor Éxito' : 'Highest Success'}</SelectItem>
            <SelectItem value="newest">{language === 'es' ? 'Más Recientes' : 'Newest'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all" className="gap-2">
            <Coffee className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'es' ? 'Todos' : 'All'}</span>
            <Badge variant="secondary" className="ml-1">{filteredHabits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="steeping" className="gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">{language === 'es' ? 'Infusionando' : 'Steeping'}</span>
            <Badge variant="secondary" className="ml-1">{steepingHabits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <Beaker className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">{language === 'es' ? 'Prueba' : 'Testing'}</span>
            <Badge variant="secondary" className="ml-1">{testingHabits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="evolved" className="gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="hidden sm:inline">{language === 'es' ? 'Evolucionado' : 'Evolved'}</span>
            <Badge variant="secondary" className="ml-1">{evolvedHabits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="immortal" className="gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">{language === 'es' ? 'Inmortal' : 'Immortal'}</span>
            <Badge variant="secondary" className="ml-1">{immortalHabits.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            <TabsContent value="all">
              {filteredHabits.length === 0 ? (
                <EmptyState onPropose={() => setShowProposeModal(true)} language={language} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHabits.map(habit => (
                    <IncubatorCard
                      key={habit.id}
                      habit={habit}
                      onVote={voteType => vote(habit.id, voteType)}
                      onJoinTesting={() => joinTesting(habit.id)}
                      onViewDetails={() => setSelectedHabit(habit)}
                      isEvolving={evolving === habit.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="steeping">
              <HabitGrid 
                habits={steepingHabits} 
                onVote={vote}
                onJoinTesting={joinTesting}
                onViewDetails={setSelectedHabit}
                evolving={evolving}
                onPropose={() => setShowProposeModal(true)}
                language={language}
              />
            </TabsContent>

            <TabsContent value="testing">
              <HabitGrid 
                habits={testingHabits} 
                onVote={vote}
                onJoinTesting={joinTesting}
                onViewDetails={setSelectedHabit}
                evolving={evolving}
                onPropose={() => setShowProposeModal(true)}
                language={language}
              />
            </TabsContent>

            <TabsContent value="evolved">
              <HabitGrid 
                habits={evolvedHabits} 
                onVote={vote}
                onJoinTesting={joinTesting}
                onViewDetails={setSelectedHabit}
                evolving={evolving}
                onPropose={() => setShowProposeModal(true)}
                language={language}
              />
            </TabsContent>

            <TabsContent value="immortal">
              {immortalHabits.length === 0 ? (
                <div className="text-center py-20">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'es' ? 'Aún no hay hábitos inmortales' : 'No immortal habits yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'es' 
                      ? 'Los hábitos con 50+ votos y 70%+ de éxito pueden volverse inmortales'
                      : 'Habits with 50+ votes and 70%+ success rate can become immortal'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {immortalHabits.map(habit => (
                    <IncubatorCard
                      key={habit.id}
                      habit={habit}
                      onVote={voteType => vote(habit.id, voteType)}
                      onJoinTesting={() => joinTesting(habit.id)}
                      onViewDetails={() => setSelectedHabit(habit)}
                      isEvolving={evolving === habit.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* How It Works Section */}
      <Card className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            {language === 'es' ? '¿Cómo Funciona la Incubadora?' : 'How Does the Incubator Work?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="font-semibold mb-1">{language === 'es' ? '1. Proponer' : '1. Propose'}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'Comparte tu idea de hábito con un perfil de sabor'
                  : 'Share your habit idea with a flavor profile'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-1">{language === 'es' ? '2. Infusionar' : '2. Steep'}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'La comunidad vota mientras el hábito se infusiona'
                  : 'Community votes while the habit steeps'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">{language === 'es' ? '3. Evolucionar' : '3. Evolve'}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'La IA optimiza basándose en datos de probadores'
                  : 'AI optimizes based on tester data'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="font-semibold mb-1">{language === 'es' ? '4. Inmortalizar' : '4. Immortalize'}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'Los mejores hábitos se vuelven permanentes con regalías'
                  : 'Top habits become permanent with royalties'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProposeHabitModal
        open={showProposeModal}
        onOpenChange={setShowProposeModal}
        onPropose={proposeHabit}
      />

      <IncubatorDetailModal
        habit={selectedHabit}
        open={!!selectedHabit}
        onOpenChange={open => !open && setSelectedHabit(null)}
        onVote={voteType => selectedHabit && vote(selectedHabit.id, voteType)}
        onJoinTesting={() => selectedHabit && joinTesting(selectedHabit.id)}
        onSubmitFeedback={(feedback, rating) => 
          selectedHabit ? submitFeedback(selectedHabit.id, feedback, rating) : Promise.resolve()
        }
        onEvolve={() => selectedHabit && evolveHabit(selectedHabit.id)}
        getEvolutions={getEvolutions}
        isEvolving={selectedHabit ? evolving === selectedHabit.id : false}
      />
    </PageWrapper>
  );
}

function HabitGrid({ 
  habits, 
  onVote, 
  onJoinTesting, 
  onViewDetails,
  evolving,
  onPropose,
  language
}: {
  habits: IncubatorHabit[];
  onVote: (id: string, type: 'upvote' | 'downvote' | 'evolve') => void;
  onJoinTesting: (id: string) => void;
  onViewDetails: (habit: IncubatorHabit) => void;
  evolving: string | null;
  onPropose: () => void;
  language: string;
}) {
  if (habits.length === 0) {
    return <EmptyState onPropose={onPropose} language={language} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map(habit => (
        <IncubatorCard
          key={habit.id}
          habit={habit}
          onVote={voteType => onVote(habit.id, voteType)}
          onJoinTesting={() => onJoinTesting(habit.id)}
          onViewDetails={() => onViewDetails(habit)}
          isEvolving={evolving === habit.id}
        />
      ))}
    </div>
  );
}

function EmptyState({ onPropose, language }: { onPropose: () => void; language: string }) {
  return (
    <div className="text-center py-20">
      <Coffee className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-50" />
      <h3 className="text-xl font-semibold mb-2">
        {language === 'es' ? 'No hay hábitos aquí todavía' : 'No habits here yet'}
      </h3>
      <p className="text-muted-foreground mb-6">
        {language === 'es' 
          ? 'Sé el primero en proponer un hábito para la comunidad'
          : 'Be the first to propose a habit for the community'}
      </p>
      <Button onClick={onPropose}>
        <Plus className="w-4 h-4 mr-2" />
        {language === 'es' ? 'Proponer Hábito' : 'Propose Habit'}
      </Button>
    </div>
  );
}
