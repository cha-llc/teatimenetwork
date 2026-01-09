import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  MoreVertical,
  MessageCircle,
  TrendingUp,
  Flame,
  Trophy,
  UserMinus,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { PartnerProgress } from '@/hooks/useAccountabilityPartners';
import { SendMessageModal } from './SendMessageModal';

interface PartnerCardProps {
  partner: PartnerProgress;
  partnershipId: string;
  onRemove: (id: string) => void;
  onSendMessage: (
    partnershipId: string,
    message: string,
    type: 'encouragement' | 'celebration' | 'support' | 'reminder',
    email?: string
  ) => void;
}

export function PartnerCard({ partner, partnershipId, onRemove, onSendMessage }: PartnerCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-yellow-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  {getInitials(partner.partnerName)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{partner.partnerName}</h3>
                  <p className="text-white/80 text-sm">{partner.partnerEmail}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowMessageModal(true)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onRemove(partnershipId)}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove Partner
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 grid grid-cols-3 gap-4 border-b">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-indigo-600">
                <Trophy className="w-5 h-5" />
                {partner.totalHabits}
              </div>
              <p className="text-xs text-gray-500">Active Habits</p>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center gap-1 text-2xl font-bold ${getStreakColor(partner.longestStreak)}`}>
                <Flame className="w-5 h-5" />
                {partner.longestStreak}
              </div>
              <p className="text-xs text-gray-500">Best Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                <TrendingUp className="w-5 h-5" />
                {partner.weeklyCompletionRate}%
              </div>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </div>

          {/* Habits List */}
          {showDetails && (
            <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Today's Progress
              </h4>
              {partner.habits.map((habit) => (
                <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {habit.category}
                      </Badge>
                      <span className={`flex items-center gap-1 text-sm ${getStreakColor(habit.streak)}`}>
                        <Flame className="w-3 h-3" />
                        {habit.streak}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={habit.completionRate} className="h-2 flex-1" />
                    <span className="text-xs text-gray-500">{habit.completionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Progress' : 'View Progress'}
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowMessageModal(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Encourage
            </Button>
          </div>
        </CardContent>
      </Card>

      <SendMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        partnerName={partner.partnerName}
        onSend={(message, type) => {
          onSendMessage(partnershipId, message, type, partner.partnerEmail);
          setShowMessageModal(false);
        }}
      />
    </>
  );
}
