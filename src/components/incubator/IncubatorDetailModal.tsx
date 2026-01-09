import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlavorProfileBadge, TeaPotVisual } from './FlavorProfileBadge';
import { IncubatorHabit, IncubatorEvolution } from '@/hooks/useIncubator';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Beaker, 
  Sparkles, 
  Users, 
  Clock,
  TrendingUp,
  Crown,
  Zap,
  Star,
  GitBranch,
  Loader2,
  Calendar,
  Timer,
  Repeat,
  Send
} from 'lucide-react';

interface IncubatorDetailModalProps {
  habit: IncubatorHabit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVote: (voteType: 'upvote' | 'downvote' | 'evolve') => void;
  onJoinTesting: () => void;
  onSubmitFeedback: (feedback: string, rating: number) => Promise<void>;
  onEvolve: () => void;
  getEvolutions: (id: string) => Promise<IncubatorEvolution[]>;
  isEvolving?: boolean;
}

export function IncubatorDetailModal({
  habit,
  open,
  onOpenChange,
  onVote,
  onJoinTesting,
  onSubmitFeedback,
  onEvolve,
  getEvolutions,
  isEvolving
}: IncubatorDetailModalProps) {
  const { language } = useLanguage();
  const [evolutions, setEvolutions] = useState<IncubatorEvolution[]>([]);
  const [loadingEvolutions, setLoadingEvolutions] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (habit && open) {
      setLoadingEvolutions(true);
      getEvolutions(habit.id)
        .then(setEvolutions)
        .finally(() => setLoadingEvolutions(false));
    }
  }, [habit, open, getEvolutions]);

  if (!habit) return null;

  const steepProgress = habit.status === 'steeping' 
    ? Math.min(100, ((Date.now() - new Date(habit.created_at).getTime()) / (habit.steep_time * 24 * 60 * 60 * 1000)) * 100)
    : 100;

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || rating === 0) return;
    setSubmittingFeedback(true);
    try {
      await onSubmitFeedback(feedback, rating);
      setFeedback('');
      setRating(0);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusColor = () => {
    switch (habit.status) {
      case 'steeping': return 'text-amber-600 dark:text-amber-400';
      case 'testing': return 'text-blue-600 dark:text-blue-400';
      case 'evolved': return 'text-purple-600 dark:text-purple-400';
      case 'immortal': return 'text-amber-500';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <TeaPotVisual status={habit.status} steepProgress={steepProgress} />
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{habit.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <FlavorProfileBadge flavor={habit.flavor_profile} />
                {habit.category && (
                  <Badge variant="secondary">{habit.category}</Badge>
                )}
                <Badge variant="outline" className={getStatusColor()}>
                  {habit.status === 'steeping' && <Clock className="w-3 h-3 mr-1" />}
                  {habit.status === 'testing' && <Beaker className="w-3 h-3 mr-1" />}
                  {habit.status === 'evolved' && <Sparkles className="w-3 h-3 mr-1" />}
                  {habit.status === 'immortal' && <Crown className="w-3 h-3 mr-1" />}
                  {habit.status.charAt(0).toUpperCase() + habit.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {language === 'es' ? 'Resumen' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="evolutions">
              <GitBranch className="w-4 h-4 mr-1" />
              {language === 'es' ? 'Evoluciones' : 'Evolutions'}
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <Star className="w-4 h-4 mr-1" />
              {language === 'es' ? 'Feedback' : 'Feedback'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">{language === 'es' ? 'Descripción' : 'Description'}</h4>
              <p className="text-muted-foreground">{habit.description || (language === 'es' ? 'Sin descripción' : 'No description')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <ThumbsUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <div className="text-2xl font-bold">{habit.vote_count}</div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Votos' : 'Votes'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-2xl font-bold">{habit.test_count}</div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Probadores' : 'Testers'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <div className="text-2xl font-bold">{habit.success_rate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Éxito' : 'Success'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <GitBranch className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <div className="text-2xl font-bold">{evolutions.length}</div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Evoluciones' : 'Evolutions'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Habit Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Frecuencia' : 'Frequency'}</div>
                  <div className="font-medium">{habit.suggested_frequency}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Duración' : 'Duration'}</div>
                  <div className="font-medium">{habit.suggested_duration} min</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{language === 'es' ? 'Infusión' : 'Steep Time'}</div>
                  <div className="font-medium">{habit.steep_time} {language === 'es' ? 'días' : 'days'}</div>
                </div>
              </div>
            </div>

            {/* Steep Progress */}
            {habit.status === 'steeping' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{language === 'es' ? 'Progreso de Infusión' : 'Steep Progress'}</span>
                  <span>{steepProgress.toFixed(0)}%</span>
                </div>
                <Progress value={steepProgress} className="h-2" />
              </div>
            )}

            {/* AI Optimized Schedule */}
            {habit.ai_optimized_schedule && (
              <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    {language === 'es' ? 'Optimización IA' : 'AI Optimization'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {habit.ai_optimized_schedule.schedule_optimization && (
                    <p>{habit.ai_optimized_schedule.schedule_optimization}</p>
                  )}
                  {habit.ai_optimized_schedule.new_tips && (
                    <ul className="list-disc list-inside space-y-1">
                      {habit.ai_optimized_schedule.new_tips.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Immortal Royalties */}
            {habit.is_immortal && (
              <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-8 h-8 text-amber-500" />
                    <div>
                      <div className="font-semibold">{language === 'es' ? 'Hábito Inmortal' : 'Immortal Habit'}</div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Permanente en la biblioteca' : 'Permanent in library'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">${habit.total_royalties_earned.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{(habit.royalty_rate * 100).toFixed(0)}% {language === 'es' ? 'regalías' : 'royalty'}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evolutions" className="mt-4">
            {loadingEvolutions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : evolutions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{language === 'es' ? 'Aún no hay evoluciones' : 'No evolutions yet'}</p>
                <p className="text-sm">{language === 'es' ? 'Vota para evolucionar este hábito' : 'Vote to evolve this habit'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evolutions.map(evo => (
                  <Card key={evo.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30">
                          {language === 'es' ? 'Evolución' : 'Evolution'} #{evo.evolution_number}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(evo.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{evo.reason}</p>
                      {evo.aggregate_success_rate > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <TrendingUp className="w-4 h-4" />
                          {evo.aggregate_success_rate.toFixed(0)}% {language === 'es' ? 'tasa de éxito' : 'success rate'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="mt-4">
            {habit.is_testing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'es' ? 'Tu Calificación' : 'Your Rating'}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-lg transition-colors ${
                          rating >= star 
                            ? 'text-yellow-500' 
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'es' ? 'Tu Feedback' : 'Your Feedback'}
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder={language === 'es' 
                      ? '¿Cómo fue tu experiencia con este hábito?' 
                      : 'How was your experience with this habit?'}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleSubmitFeedback} 
                  disabled={!feedback.trim() || rating === 0 || submittingFeedback}
                  className="w-full"
                >
                  {submittingFeedback && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Enviar Feedback' : 'Submit Feedback'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Beaker className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{language === 'es' ? 'Únete a las pruebas para dar feedback' : 'Join testing to provide feedback'}</p>
                <Button onClick={onJoinTesting} className="mt-4">
                  <Beaker className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Unirse a Pruebas' : 'Join Testing'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={habit.user_vote === 'upvote' ? 'default' : 'ghost'}
              size="sm"
              className={habit.user_vote === 'upvote' ? 'bg-green-500 hover:bg-green-600' : ''}
              onClick={() => onVote('upvote')}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <span className="px-3 font-semibold">{habit.vote_count}</span>
            <Button
              variant={habit.user_vote === 'downvote' ? 'default' : 'ghost'}
              size="sm"
              className={habit.user_vote === 'downvote' ? 'bg-red-500 hover:bg-red-600' : ''}
              onClick={() => onVote('downvote')}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant={habit.user_vote === 'evolve' ? 'default' : 'outline'}
            className={habit.user_vote === 'evolve' ? 'bg-purple-500 hover:bg-purple-600' : ''}
            onClick={() => onVote('evolve')}
          >
            <Zap className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Votar Evolución' : 'Vote Evolve'}
          </Button>

          {habit.status !== 'immortal' && (
            <Button
              variant="outline"
              onClick={onEvolve}
              disabled={isEvolving}
              className="ml-auto"
            >
              {isEvolving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {language === 'es' ? 'Evolucionar con IA' : 'AI Evolve'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
