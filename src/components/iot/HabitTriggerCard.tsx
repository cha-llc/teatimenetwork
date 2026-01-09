import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Zap, MapPin, Clock, Mic, Activity, TrendingUp } from 'lucide-react';
import { HabitTrigger } from '@/hooks/useIoTIntegrations';

interface HabitTriggerCardProps {
  trigger: HabitTrigger;
  onToggle: (triggerId: string, isActive: boolean) => void;
  onDelete: (triggerId: string) => void;
}

export function HabitTriggerCard({ trigger, onToggle, onDelete }: HabitTriggerCardProps) {
  const getTriggerIcon = () => {
    switch (trigger.trigger_type) {
      case 'activity':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'location':
        return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'time':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'voice_command':
        return <Mic className="h-5 w-5 text-cyan-500" />;
      case 'device_event':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTriggerTypeLabel = () => {
    switch (trigger.trigger_type) {
      case 'activity': return 'Activity Trigger';
      case 'location': return 'Location Trigger';
      case 'time': return 'Time Trigger';
      case 'voice_command': return 'Voice Command';
      case 'device_event': return 'Device Event';
      default: return trigger.trigger_type;
    }
  };

  const getConditionDescription = () => {
    const { trigger_conditions } = trigger;
    
    if (trigger_conditions.metric) {
      return `When ${trigger_conditions.metric} ${trigger_conditions.operator} ${trigger_conditions.value}`;
    }
    if (trigger_conditions.location) {
      return `When arriving at ${trigger_conditions.location}`;
    }
    if (trigger_conditions.time) {
      return `At ${trigger_conditions.time}`;
    }
    
    return 'Custom condition';
  };

  const getActionDescription = () => {
    switch (trigger.action_type) {
      case 'complete_habit':
        return 'Auto-complete habit';
      case 'remind':
        return 'Send reminder';
      case 'start_timer':
        return `Start ${trigger.action_config.duration || 30}min timer`;
      case 'log_progress':
        return 'Log progress';
      default:
        return trigger.action_type;
    }
  };

  const formatLastTriggered = () => {
    if (!trigger.last_triggered_at) return 'Never triggered';
    const diff = Date.now() - new Date(trigger.last_triggered_at).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <Card className={`transition-all duration-200 ${trigger.is_active ? 'border-2 border-primary/20' : 'opacity-60'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${trigger.is_active ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center`}>
              {getTriggerIcon()}
            </div>
            <div>
              <h3 className="font-semibold">{trigger.trigger_name}</h3>
              <Badge variant="secondary" className="text-xs mt-1">
                {getTriggerTypeLabel()}
              </Badge>
            </div>
          </div>
          <Switch
            checked={trigger.is_active}
            onCheckedChange={(checked) => onToggle(trigger.id, checked)}
          />
        </div>

        {/* Condition & Action */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">IF</span>
            </div>
            <p className="text-sm">{getConditionDescription()}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">DO</span>
            </div>
            <p className="text-sm">{getActionDescription()}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Triggered {trigger.times_triggered} times</span>
          </div>
          <span>{formatLastTriggered()}</span>
        </div>

        {/* Delete Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(trigger.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Trigger
        </Button>
      </CardContent>
    </Card>
  );
}
