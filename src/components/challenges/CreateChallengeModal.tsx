import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Lock, 
  Users, 
  Crown,
  Sparkles
} from 'lucide-react';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<any>;
  isPremium: boolean;
}

const habitTypes = [
  { value: 'fitness', label: 'Fitness', color: 'bg-green-500' },
  { value: 'health', label: 'Health', color: 'bg-emerald-500' },
  { value: 'productivity', label: 'Productivity', color: 'bg-blue-500' },
  { value: 'mindfulness', label: 'Mindfulness', color: 'bg-purple-500' },
  { value: 'learning', label: 'Learning', color: 'bg-amber-500' },
  { value: 'social', label: 'Social', color: 'bg-pink-500' },
  { value: 'finance', label: 'Finance', color: 'bg-cyan-500' },
  { value: 'creativity', label: 'Creativity', color: 'bg-orange-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' }
];

const teamColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function CreateChallengeModal({ isOpen, onClose, onCreate, isPremium }: CreateChallengeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitType, setHabitType] = useState('fitness');
  const [challengeType, setChallengeType] = useState<'individual' | 'team'>('individual');
  const [isPrivate, setIsPrivate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goalTarget, setGoalTarget] = useState(30);
  const [goalUnit, setGoalUnit] = useState('days');
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [teams, setTeams] = useState<{ name: string; color: string }[]>([
    { name: 'Team Alpha', color: '#3b82f6' },
    { name: 'Team Beta', color: '#ef4444' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddTeam = () => {
    const colorIndex = teams.length % teamColors.length;
    setTeams([...teams, { name: `Team ${teams.length + 1}`, color: teamColors[colorIndex] }]);
  };

  const handleRemoveTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleUpdateTeam = (index: number, field: 'name' | 'color', value: string) => {
    const updated = [...teams];
    updated[index][field] = value;
    setTeams(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    setLoading(true);
    try {
      const result = await onCreate({
        title,
        description,
        habitType,
        challengeType,
        isPrivate,
        startDate,
        endDate,
        goalTarget,
        goalUnit,
        maxParticipants,
        teams: challengeType === 'team' ? teams : undefined
      });

      if (result) {
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setHabitType('fitness');
        setChallengeType('individual');
        setIsPrivate(false);
        setStartDate('');
        setEndDate('');
        setGoalTarget(30);
        setGoalUnit('days');
        setMaxParticipants(undefined);
        setTeams([
          { name: 'Team Alpha', color: '#3b82f6' },
          { name: 'Team Beta', color: '#ef4444' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Create New Challenge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">Challenge Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 30-Day Fitness Challenge"
                className="bg-slate-800 border-slate-600 text-white mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your challenge and what participants will achieve..."
                className="bg-slate-800 border-slate-600 text-white mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Challenge Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Habit Category</Label>
              <Select value={habitType} onValueChange={setHabitType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {habitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Challenge Type</Label>
              <Select value={challengeType} onValueChange={(v: 'individual' | 'team') => setChallengeType(v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="individual" className="text-white">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Individual Competition
                    </div>
                  </SelectItem>
                  <SelectItem value="team" className="text-white">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Competition
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Setup */}
          {challengeType === 'team' && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300">Teams</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTeam}
                  className="border-slate-600 hover:border-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Team
                </Button>
              </div>
              <div className="space-y-2">
                {teams.map((team, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={team.color}
                      onChange={(e) => handleUpdateTeam(index, 'color', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <Input
                      value={team.name}
                      onChange={(e) => handleUpdateTeam(index, 'name', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                    />
                    {teams.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTeam(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-slate-300">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-slate-300">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                required
              />
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goalTarget" className="text-slate-300">Goal Target</Label>
              <Input
                id="goalTarget"
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(parseInt(e.target.value))}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                min={1}
              />
            </div>
            <div>
              <Label className="text-slate-300">Goal Unit</Label>
              <Select value={goalUnit} onValueChange={setGoalUnit}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="days" className="text-white">Days</SelectItem>
                  <SelectItem value="completions" className="text-white">Completions</SelectItem>
                  <SelectItem value="hours" className="text-white">Hours</SelectItem>
                  <SelectItem value="points" className="text-white">Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <Label htmlFor="maxParticipants" className="text-slate-300">
              Max Participants (optional)
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              value={maxParticipants || ''}
              onChange={(e) => setMaxParticipants(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Unlimited"
              className="bg-slate-800 border-slate-600 text-white mt-1"
              min={2}
            />
          </div>

          {/* Private Challenge (Premium) */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white font-medium">Private Challenge</p>
                  <p className="text-slate-400 text-sm">Only invited members can join</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isPremium && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  disabled={!isPremium}
                />
              </div>
            </div>
            {!isPremium && (
              <p className="text-amber-400/80 text-xs mt-2">
                Upgrade to Premium to create private challenges and invite friends
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title || !startDate || !endDate}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
