import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Shield, User, MoreVertical, UserMinus, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/hooks/useTeams';

interface TeamMemberCardProps {
  member: TeamMember;
  isOwner: boolean;
  canManage: boolean;
  onRemove: (memberId: string) => void;
}

export function TeamMemberCard({ member, isOwner, canManage, onRemove }: TeamMemberCardProps) {
  const getRoleIcon = () => {
    switch (member.role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = () => {
    switch (member.role) {
      case 'owner':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Admin</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (member.status === 'pending') {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return null;
  };

  const initials = member.display_name
    ? member.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : member.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {member.display_name || member.email?.split('@')[0] || 'Unknown'}
            </span>
            {getRoleIcon()}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {member.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getRoleBadge()}
          {getStatusBadge()}
          
          {canManage && member.role !== 'owner' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onRemove(member.id)}
                  className="text-red-600"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove from Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {member.joined_at && (
        <p className="text-xs text-gray-400 mt-2">
          Joined {new Date(member.joined_at).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}
