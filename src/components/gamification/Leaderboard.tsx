import React, { useState } from 'react';
import { LeaderboardEntry } from '@/hooks/useGamification';
import { Trophy, Medal, Crown, Users, ChevronDown, Flame, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isPremium?: boolean;
  onRefresh?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  isPremium = false,
  onRefresh
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayedEntries = showAll ? entries : entries.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
            <Crown className="w-4 h-4 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg shadow-gray-200">
            <Medal className="w-4 h-4 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
            <Medal className="w-4 h-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
            {rank}
          </div>
        );
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-[#7C9885]/10 border-[#7C9885]/30';
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Leaderboard</h3>
            <p className="text-sm text-gray-500">Top performers this month</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Be the first to earn points!</p>
          <p className="text-sm mt-1">Complete habits and challenges to appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Leaderboard</h3>
              <p className="text-sm text-gray-500">{entries.length} active members</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm text-[#7C9885] hover:text-[#6a8573] font-medium"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="px-6 py-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <Avatar className="w-14 h-14 border-4 border-gray-300 shadow-lg">
                <AvatarImage src={entries[1]?.avatar_url || ''} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                  {getInitials(entries[1]?.full_name || 'A')}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[80px]">
                  {entries[1]?.full_name?.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-500">{entries[1]?.total_points.toLocaleString()} pts</p>
              </div>
              <div className="mt-2 w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4">
              <div className="relative">
                <Avatar className="w-18 h-18 border-4 border-amber-400 shadow-xl" style={{ width: '72px', height: '72px' }}>
                  <AvatarImage src={entries[0]?.avatar_url || ''} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xl">
                    {getInitials(entries[0]?.full_name || 'A')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold text-gray-800 truncate max-w-[100px]">
                  {entries[0]?.full_name?.split(' ')[0]}
                </p>
                <p className="text-xs text-amber-600 font-medium">{entries[0]?.total_points.toLocaleString()} pts</p>
              </div>
              <div className="mt-2 w-20 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <Avatar className="w-14 h-14 border-4 border-orange-400 shadow-lg">
                <AvatarImage src={entries[2]?.avatar_url || ''} />
                <AvatarFallback className="bg-orange-100 text-orange-700 text-lg">
                  {getInitials(entries[2]?.full_name || 'A')}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[80px]">
                  {entries[2]?.full_name?.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-500">{entries[2]?.total_points.toLocaleString()} pts</p>
              </div>
              <div className="mt-2 w-16 h-12 bg-gradient-to-br from-amber-600 to-orange-700 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="divide-y divide-gray-100">
        {displayedEntries.slice(entries.length >= 3 ? 3 : 0).map((entry) => {
          const isCurrentUser = entry.profile_id === currentUserId;

          return (
            <div
              key={entry.profile_id}
              className={`
                flex items-center gap-4 p-4 transition-colors
                ${getRankBg(entry.rank, isCurrentUser)}
                ${isCurrentUser ? 'border-l-4 border-l-[#7C9885]' : ''}
              `}
            >
              {getRankIcon(entry.rank)}

              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatar_url || ''} />
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  {getInitials(entry.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800 truncate">
                    {entry.full_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-[#7C9885] font-normal">(You)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {entry.achievement_count} badges
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {entry.best_streak} day streak
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-800">{entry.total_points.toLocaleString()}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {entries.length > 10 && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${entries.length} Members`}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Premium Upsell */}
      {!isPremium && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Compete with friends</p>
              <p className="text-xs text-gray-500">Upgrade to create private leaderboards</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
