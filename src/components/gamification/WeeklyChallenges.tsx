import React from 'react';
import { WeeklyChallenge, ChallengeProgress } from '@/hooks/useGamification';
import { Target, Trophy, Clock, CheckCircle2, Flame, Zap, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WeeklyChallengesProps {
  challenges: WeeklyChallenge[];
  progress: ChallengeProgress[];
  isPremium?: boolean;
}

const getChallengeIcon = (type: string) => {
  switch (type) {
    case 'perfect_week':
      return <Star className="w-5 h-5" />;
    case 'early_completions':
      return <Zap className="w-5 h-5" />;
    case 'streak_milestone':
      return <Flame className="w-5 h-5" />;
    case 'total_completions':
      return <Target className="w-5 h-5" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
};

const getChallengeColor = (type: string) => {
  switch (type) {
    case 'perfect_week':
      return 'from-amber-400 to-yellow-500';
    case 'early_completions':
      return 'from-blue-400 to-cyan-500';
    case 'streak_milestone':
      return 'from-orange-400 to-red-500';
    case 'total_completions':
      return 'from-green-400 to-emerald-500';
    default:
      return 'from-purple-400 to-pink-500';
  }
};

const WeeklyChallenges: React.FC<WeeklyChallengesProps> = ({
  challenges,
  progress,
  isPremium = false
}) => {
  const getProgress = (challengeId: string) => {
    return progress.find(p => p.challenge_id === challengeId);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (challenges.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Weekly Challenges</h3>
            <p className="text-sm text-gray-500">New challenges coming soon!</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Check back next week for new challenges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Weekly Challenges</h3>
            <p className="text-sm text-gray-500">Complete for bonus points</p>
          </div>
        </div>
        {challenges[0] && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{getDaysRemaining(challenges[0].end_date)} days left</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {challenges.map((challenge, index) => {
          const challengeProgress = getProgress(challenge.id);
          const progressPercent = challengeProgress 
            ? Math.min((challengeProgress.current_progress / challenge.target_value) * 100, 100)
            : 0;
          const isCompleted = challengeProgress?.is_completed || false;
          const color = getChallengeColor(challenge.challenge_type);

          // Lock some challenges for free users
          const isLocked = !isPremium && index >= 2;

          return (
            <div
              key={challenge.id}
              className={`
                relative rounded-xl border p-4 transition-all
                ${isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : isLocked
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {isLocked && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
                  <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    Premium Only
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : `bg-gradient-to-br ${color} text-white`
                  }
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : getChallengeIcon(challenge.challenge_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800">{challenge.title}</h4>
                    <span className={`
                      text-sm font-semibold
                      ${isCompleted ? 'text-green-600' : 'text-amber-600'}
                    `}>
                      +{challenge.points_reward} pts
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-700">
                        {challengeProgress?.current_progress || 0} / {challenge.target_value}
                      </span>
                    </div>
                    <Progress 
                      value={progressPercent} 
                      className={`h-2 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChallenges;
