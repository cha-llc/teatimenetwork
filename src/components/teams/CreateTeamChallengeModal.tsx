import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, Calendar, Zap } from 'lucide-react';

interface CreateTeamChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onCreateChallenge: (
    teamId: string,
    title: string,
    habitName: string,
    targetCompletions: number,
    startDate: string,
    endDate: string,
    description?: string
  ) => Promise<any>;
}

export function CreateTeamChallengeModal({ 
  isOpen, 
  onClose, 
  teamId, 
  onCreateChallenge 
}: CreateTeamChallengeModalProps) {
  const [title, setTitle] = useState('');
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCompletions, setTargetCompletions] = useState(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !habitName.trim()) return;

    setLoading(true);
    const result = await onCreateChallenge(
      teamId,
      title.trim(),
      habitName.trim(),
      targetCompletions,
      startDate,
      endDate,
      description.trim() || undefined
    );
    setLoading(false);

    if (result) {
      setTitle('');
      setHabitName('');
      setDescription('');
      setTargetCompletions(7);
      onClose();
    }
  };

  const presetChallenges = [
    { title: '7-Day Workout', habit: 'Exercise', target: 7, days: 7 },
    { title: 'Meditation Week', habit: 'Meditate', target: 7, days: 7 },
    { title: 'Reading Challenge', habit: 'Read 30 mins', target: 14, days: 14 },
    { title: 'Hydration Month', habit: 'Drink 8 glasses', target: 30, days: 30 },
  ];

  const applyPreset = (preset: typeof presetChallenges[0]) => {
    setTitle(preset.title);
    setHabitName(preset.habit);
    setTargetCompletions(preset.target);
    setEndDate(
      new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            Create Team Challenge
          </DialogTitle>
          <DialogDescription>
            Start a challenge for your team to complete together
          </DialogDescription>
        </DialogHeader>

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Quick Start</Label>
          <div className="flex flex-wrap gap-2">
            {presetChallenges.map((preset) => (
              <Button
                key={preset.title}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                {preset.title}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="challenge-title">Challenge Title</Label>
              <Input
                id="challenge-title"
                placeholder="e.g., 7-Day Workout"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Exercise"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge-description">Description (Optional)</Label>
            <Textarea
              id="challenge-description"
              placeholder="What's this challenge about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-completions">Target Completions (per person)</Label>
            <Input
              id="target-completions"
              type="number"
              min={1}
              max={100}
              value={targetCompletions}
              onChange={(e) => setTargetCompletions(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-700 dark:text-green-300">
                  Challenge Duration
                </p>
                <p className="text-green-600/80 dark:text-green-400/80">
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !habitName.trim() || loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loading ? 'Creating...' : 'Start Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
