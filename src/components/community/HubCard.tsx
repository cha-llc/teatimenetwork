import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Dumbbell, Zap, Heart, BookOpen, Palette, Sun, Check, Crown } from 'lucide-react';
import type { MomentumHub } from '@/hooks/useCommunityHubs';

interface HubCardProps {
  hub: MomentumHub;
  onJoin: (hubId: string) => void;
  onLeave: (hubId: string) => void;
  onView: (hub: MomentumHub) => void;
}

const themeIcons: Record<string, React.ReactNode> = {
  fitness: <Dumbbell className="w-6 h-6" />,
  productivity: <Zap className="w-6 h-6" />,
  mindfulness: <Heart className="w-6 h-6" />,
  learning: <BookOpen className="w-6 h-6" />,
  creativity: <Palette className="w-6 h-6" />,
  wellness: <Sun className="w-6 h-6" />
};

const themeColors: Record<string, string> = {
  fitness: 'from-red-500 to-orange-500',
  productivity: 'from-blue-500 to-cyan-500',
  mindfulness: 'from-purple-500 to-pink-500',
  learning: 'from-green-500 to-emerald-500',
  creativity: 'from-yellow-500 to-amber-500',
  wellness: 'from-teal-500 to-green-500'
};

export function HubCard({ hub, onJoin, onLeave, onView }: HubCardProps) {
  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => onView(hub)}>
      <div className={`h-24 bg-gradient-to-r ${themeColors[hub.theme] || 'from-gray-500 to-gray-600'} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white">
          {themeIcons[hub.theme] || <Users className="w-6 h-6" />}
        </div>
        {hub.is_official && (
          <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-900">
            <Crown className="w-3 h-3 mr-1" />
            Official
          </Badge>
        )}
        {hub.isMember && (
          <div className="absolute bottom-3 right-3 p-1.5 bg-green-500 rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1 group-hover:text-purple-600 transition-colors">
          {hub.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {hub.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{formatMemberCount(hub.member_count)} members</span>
          </div>
          
          {hub.isMember ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onLeave(hub.id);
              }}
              className="text-gray-600"
            >
              Joined
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onJoin(hub.id);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Join Hub
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
