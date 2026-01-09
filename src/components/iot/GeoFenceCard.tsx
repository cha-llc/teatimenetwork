import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, MapPin, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { GeoFence } from '@/hooks/useIoTIntegrations';

interface GeoFenceCardProps {
  fence: GeoFence;
  onToggle: (fenceId: string, isActive: boolean) => void;
  onDelete: (fenceId: string) => void;
}

export function GeoFenceCard({ fence, onToggle, onDelete }: GeoFenceCardProps) {
  const getTriggerIcon = () => {
    switch (fence.trigger_on) {
      case 'enter':
        return <ArrowDownToLine className="h-4 w-4" />;
      case 'exit':
        return <ArrowUpFromLine className="h-4 w-4" />;
      case 'both':
        return <ArrowLeftRight className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = () => {
    switch (fence.trigger_on) {
      case 'enter': return 'On Arrival';
      case 'exit': return 'On Departure';
      case 'both': return 'Both';
      default: return fence.trigger_on;
    }
  };

  return (
    <Card className={`transition-all duration-200 ${fence.is_active ? 'border-2 border-blue-200 dark:border-blue-800' : 'opacity-60'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${fence.is_active ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted'} flex items-center justify-center`}>
              <MapPin className={`h-5 w-5 ${fence.is_active ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold">{fence.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getTriggerIcon()}
                  <span className="ml-1">{getTriggerLabel()}</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {fence.radius_meters}m radius
                </Badge>
              </div>
            </div>
          </div>
          <Switch
            checked={fence.is_active}
            onCheckedChange={(checked) => onToggle(fence.id, checked)}
          />
        </div>

        {/* Map Preview Placeholder */}
        <div className="relative h-32 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg mb-4 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full border-4 ${fence.is_active ? 'border-blue-500' : 'border-gray-400'} bg-blue-500/20 flex items-center justify-center`}>
                <MapPin className={`h-6 w-6 ${fence.is_active ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <div className={`absolute -inset-4 rounded-full border-2 border-dashed ${fence.is_active ? 'border-blue-400' : 'border-gray-300'} animate-pulse`} />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-white/80 dark:bg-black/50 px-2 py-1 rounded">
            {fence.latitude.toFixed(4)}, {fence.longitude.toFixed(4)}
          </div>
        </div>

        {/* Linked Habits */}
        {fence.linked_habits.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Linked Habits:</p>
            <div className="flex flex-wrap gap-1">
              {fence.linked_habits.map((habitId, index) => (
                <Badge key={habitId} variant="secondary" className="text-xs">
                  Habit {index + 1}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Delete Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(fence.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Location
        </Button>
      </CardContent>
    </Card>
  );
}
