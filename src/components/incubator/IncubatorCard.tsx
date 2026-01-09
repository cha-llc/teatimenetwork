import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlavorProfileBadge, TeaPotVisual } from './FlavorProfileBadge';
import { IncubatorHabit } from '@/hooks/useIncubator';
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
  Zap
} from 'lucide-react';

interface IncubatorCardProps {
  habit: IncubatorHabit;
  onVote: (voteType: 'upvote' | 'downvote' | 'evolve') => void;
  onJoinTesting: () => void;
  onViewDetails: () => void;
  isEvolving?: boolean;
}

export function IncubatorCard({ 
  habit, 
  onVote, 
  onJoinTesting, 
  onViewDetails,
  isEvolving 
}: IncubatorCardProps) {
  const { language } = useLanguage();

  const getStatusBadge = () => {
    switch (habit.status) {
      case 'steeping':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'es' ? 'Infusionando' : 'Steeping'}
          </Badge>
        );
      case 'testing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            <Beaker className="w-3 h-3 mr-1" />
            {language === 'es' ? 'En Prueba' : 'Testing'}
          </Badge>
        );
      case 'evolved':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            {language === 'es' ? 'Evolucionado' : 'Evolved'}
          </Badge>
        );
      case 'immortal':
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            {language === 'es' ? 'Inmortal' : 'Immortal'}
          </Badge>
        );
    }
  };

  const steepProgress = habit.status === 'steeping' 
    ? Math.min(100, ((Date.now() - new Date(habit.created_at).getTime()) / (habit.steep_time * 24 * 60 * 60 * 1000)) * 100)
    : 100;

  const daysRemaining = habit.status === 'steeping'
    ? Math.max(0, habit.steep_time - Math.floor((Date.now() - new Date(habit.created_at).getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  return (
    <Card 
      className={`group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
        habit.is_immortal 
          ? 'ring-2 ring-amber-400 dark:ring-amber-500 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20' 
          : ''
      }`}
      onClick={onViewDetails}
    >
      <CardContent className="p-0">
        {/* Header with teapot visual */}
        <div className="relative p-4 pb-2 flex items-start gap-4">
          <TeaPotVisual status={habit.status} steepProgress={steepProgress} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {habit.title}
              </h3>
              {getStatusBadge()}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {habit.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <FlavorProfileBadge flavor={habit.flavor_profile} size="sm" />
              {habit.category && (
                <Badge variant="secondary" className="text-xs">
                  {habit.category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-4 py-2 bg-muted/30 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{habit.test_count} {language === 'es' ? 'probadores' : 'testers'}</span>
          </div>
          
          {habit.success_rate > 0 && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>{habit.success_rate.toFixed(0)}%</span>
            </div>
          )}

          {habit.status === 'steeping' && daysRemaining > 0 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{daysRemaining} {language === 'es' ? 'días restantes' : 'days left'}</span>
            </div>
          )}

          {habit.is_immortal && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 ml-auto">
              <span className="text-xs">{(habit.royalty_rate * 100).toFixed(0)}% {language === 'es' ? 'regalías' : 'royalty'}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-3 border-t flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {/* Vote buttons */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={habit.user_vote === 'upvote' ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 px-2 ${habit.user_vote === 'upvote' ? 'bg-green-500 hover:bg-green-600' : ''}`}
              onClick={() => onVote('upvote')}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <span className="px-2 font-semibold text-sm min-w-[2rem] text-center">
              {habit.vote_count}
            </span>
            <Button
              variant={habit.user_vote === 'downvote' ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 px-2 ${habit.user_vote === 'downvote' ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={() => onVote('downvote')}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Evolve vote */}
          <Button
            variant={habit.user_vote === 'evolve' ? 'default' : 'outline'}
            size="sm"
            className={`h-8 ${habit.user_vote === 'evolve' ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
            onClick={() => onVote('evolve')}
            disabled={isEvolving}
          >
            <Zap className="w-4 h-4 mr-1" />
            {language === 'es' ? 'Evolucionar' : 'Evolve'}
          </Button>

          {/* Join testing */}
          {!habit.is_testing && habit.status !== 'immortal' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 ml-auto"
              onClick={onJoinTesting}
            >
              <Beaker className="w-4 h-4 mr-1" />
              {language === 'es' ? 'Probar' : 'Test'}
            </Button>
          )}

          {habit.is_testing && (
            <Badge variant="secondary" className="ml-auto">
              <Beaker className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Probando' : 'Testing'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
