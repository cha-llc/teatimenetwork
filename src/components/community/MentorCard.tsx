import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, MessageCircle, Award } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  expertise: string[];
  bio: string;
  mentees_helped: number;
  rating: number;
}

interface MentorCardProps {
  mentor: Mentor;
  onRequestMentorship: (mentorId: string) => void;
}

export function MentorCard({ mentor, onRequestMentorship }: MentorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <CardContent className="p-4 -mt-10">
        <div className="flex items-end gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-900 shadow-lg">
            {mentor.name.charAt(0)}
          </div>
          <div className="flex-1 pb-1">
            <h3 className="font-bold text-lg">{mentor.name}</h3>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{mentor.rating}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {mentor.bio}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {mentor.expertise.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{mentor.mentees_helped} mentees</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-purple-500" />
            <span>Top Mentor</span>
          </div>
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          onClick={() => onRequestMentorship(mentor.id)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Request Mentorship
        </Button>
      </CardContent>
    </Card>
  );
}
