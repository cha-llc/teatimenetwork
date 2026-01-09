import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scroll, Clock, Users, Coins, Sparkles, 
  CheckCircle, Play, Target, Flame, Star,
  ChevronRight, Plus
} from 'lucide-react';
import { Quest, UserQuest } from '@/hooks/useMomentumRealm';

interface QuestCardProps {
  quest: Quest;
  userQuest?: UserQuest;
  onStart?: (questId: string) => void;
  onComplete?: (userQuestId: string) => void;
  onProgress?: (userQuestId: string, newProgress: number) => void;
  compact?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  userQuest,
  onStart,
  onComplete,
  onProgress,
  compact = false
}) => {
  const isActive = userQuest?.status === 'active';
  const isCompleted = userQuest?.status === 'completed';
  const progress = userQuest?.progress || 0;
  const requiredCount = quest.requirements?.count || 1;
  const progressPercentage = Math.min((progress / requiredCount) * 100, 100);
  const canComplete = isActive && progress >= requiredCount;

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'weekly': return <Target className="w-4 h-4 text-purple-400" />;
      case 'streak': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'cooperative': return <Users className="w-4 h-4 text-green-400" />;
      case 'special': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Scroll className="w-4 h-4 text-slate-400" />;
    }
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'weekly': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'streak': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cooperative': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'special': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'fitness': return 'bg-red-500/20 text-red-400';
      case 'mindfulness': return 'bg-purple-500/20 text-purple-400';
      case 'productivity': return 'bg-blue-500/20 text-blue-400';
      case 'learning': return 'bg-green-500/20 text-green-400';
      case 'health': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const handleAddProgress = () => {
    if (userQuest && onProgress && progress < requiredCount) {
      onProgress(userQuest.id, progress + 1);
    }
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-xl transition-all ${
        isCompleted 
          ? 'bg-green-900/20 border border-green-500/30' 
          : isActive 
          ? 'bg-purple-900/20 border border-purple-500/30'
          : 'bg-slate-800/50 border border-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCompleted ? 'bg-green-500/20' : isActive ? 'bg-purple-500/20' : 'bg-slate-700'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              getQuestTypeIcon(quest.quest_type)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white truncate">{quest.title}</h4>
              {isActive && !isCompleted && (
                <span className="text-xs text-purple-400 font-medium">Quest Active</span>
              )}
            </div>
            {isActive && !isCompleted && (
              <div className="flex items-center gap-2 mt-1">
                <Progress value={progressPercentage} className="h-1.5 flex-1 bg-slate-700" />
                <span className="text-xs text-slate-400">{progress}/{requiredCount}</span>
              </div>
            )}
            {isCompleted && (
              <span className="text-xs text-green-400">Completed!</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isActive && !canComplete && onProgress && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddProgress}
                className="h-7 w-7 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
                title="Add progress"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            {canComplete && onComplete && (
              <Button
                size="sm"
                onClick={() => onComplete(userQuest!.id)}
                className="h-7 bg-green-500 hover:bg-green-600 text-xs px-2"
              >
                Claim
              </Button>
            )}
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Coins className="w-3 h-3" />
              {quest.rewards.tokens}
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <Card className={`relative overflow-hidden transition-all ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-900/30 to-slate-900 border-green-500/30' 
        : isActive 
        ? 'bg-gradient-to-br from-purple-900/30 to-slate-900 border-purple-500/30'
        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
    }`}>
      {/* Completed overlay */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCompleted ? 'bg-green-500/20' : isActive ? 'bg-purple-500/20' : 'bg-slate-700'
          }`}>
            {getQuestTypeIcon(quest.quest_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white">{quest.title}</h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`text-xs ${getQuestTypeColor(quest.quest_type)}`}>
                {quest.quest_type}
              </Badge>
              {quest.category && (
                <Badge className={`text-xs ${getCategoryColor(quest.category)}`}>
                  {quest.category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{quest.description}</p>

        {/* Progress (if active) */}
        {isActive && !isCompleted && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="text-purple-400 font-medium">{progress} / {requiredCount}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-slate-700" />
          </div>
        )}

        {/* Quest Info */}
        <div className="flex items-center gap-4 mb-3 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {quest.duration_hours}h
          </div>
          {quest.is_cooperative && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Up to {quest.max_participants}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {requiredCount} {quest.requirements?.type || 'completions'}
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{quest.rewards.tokens}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold">{quest.rewards.experience} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!userQuest && onStart && (
          <Button 
            onClick={() => onStart(quest.id)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Quest
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {isActive && !canComplete && (
          <div className="space-y-2">
            {onProgress && (
              <Button 
                onClick={handleAddProgress}
                variant="outline"
                className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-900/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Progress ({progress}/{requiredCount})
              </Button>
            )}
            <p className="text-center text-xs text-slate-500">
              Complete habits to make progress, or click above to simulate
            </p>
          </div>
        )}

        {canComplete && onComplete && (
          <Button 
            onClick={() => onComplete(userQuest!.id)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Claim Rewards
          </Button>
        )}

        {isCompleted && (
          <div className="text-center text-sm text-green-400 font-medium py-2">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Quest Completed!
          </div>
        )}
      </CardContent>

      {/* Cooperative badge */}
      {quest.is_cooperative && (
        <div className="absolute top-0 left-0 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-br-lg">
          CO-OP
        </div>
      )}
    </Card>
  );
};

export default QuestCard;
