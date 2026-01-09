import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Video, MessageCircle, Sparkles, Trophy, Radio } from 'lucide-react';
import type { HubEvent } from '@/hooks/useCommunityHubs';

interface EventCardProps {
  event: HubEvent;
  onRegister: (eventId: string) => void;
}

const eventTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  ama: { icon: <MessageCircle className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', label: 'AMA' },
  workshop: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Workshop' },
  challenge: { icon: <Trophy className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700', label: 'Challenge' },
  meetup: { icon: <Users className="w-4 h-4" />, color: 'bg-green-100 text-green-700', label: 'Meetup' },
  livestream: { icon: <Video className="w-4 h-4" />, color: 'bg-red-100 text-red-700', label: 'Livestream' }
};

export function EventCard({ event, onRegister }: EventCardProps) {
  const config = eventTypeConfig[event.event_type] || eventTypeConfig.meetup;
  const eventDate = new Date(event.scheduled_at);
  const isUpcoming = eventDate > new Date();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${event.is_live ? 'ring-2 ring-red-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge className={`${config.color} flex items-center gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
          {event.is_live && (
            <Badge className="bg-red-500 text-white animate-pulse flex items-center gap-1">
              <Radio className="w-3 h-3" />
              LIVE NOW
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {event.host_name.charAt(0)}
          </div>
          <span>Hosted by {event.host_name}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(eventDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(eventDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {event.current_participants}
              {event.max_participants && ` / ${event.max_participants}`}
            </span>
          </div>
        </div>

        {event.max_participants && (
          <div className="mb-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {event.max_participants - event.current_participants} spots left
            </p>
          </div>
        )}

        {event.is_live ? (
          <Button className="w-full bg-red-500 hover:bg-red-600">
            <Video className="w-4 h-4 mr-2" />
            Join Live
          </Button>
        ) : isUpcoming ? (
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => onRegister(event.id)}
          >
            Register Now
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Event Ended
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
