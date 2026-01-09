import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Gift, Target, Send, Sparkles } from 'lucide-react';

interface SponsorStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    recipientEmail: string;
    habitId: string;
    habitName: string;
    message: string;
    rewardPromise?: string;
    targetDays: number;
  }) => void;
  loading?: boolean;
}

const habitOptions = [
  { id: '1', name: 'Morning Exercise' },
  { id: '2', name: 'Daily Reading' },
  { id: '3', name: 'Meditation' },
  { id: '4', name: 'Healthy Eating' },
  { id: '5', name: 'Early Wake Up' }
];

const rewardSuggestions = [
  "I'll buy you coffee ☕",
  "Dinner's on me! 🍽️",
  "Movie night, my treat 🎬",
  "I'll do your chores for a day 🧹",
  "Gift card surprise 🎁"
];

export function SponsorStreakModal({ isOpen, onClose, onSubmit, loading }: SponsorStreakModalProps) {
  const [email, setEmail] = useState('');
  const [selectedHabit, setSelectedHabit] = useState('');
  const [message, setMessage] = useState('');
  const [rewardPromise, setRewardPromise] = useState('');
  const [targetDays, setTargetDays] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const habit = habitOptions.find(h => h.id === selectedHabit);
    if (habit) {
      onSubmit({
        recipientEmail: email,
        habitId: selectedHabit,
        habitName: habit.name,
        message,
        rewardPromise: rewardPromise || undefined,
        targetDays
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            Sponsor a Friend's Streak
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Friend's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Select Habit to Sponsor</Label>
            <Select value={selectedHabit} onValueChange={setSelectedHabit} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a habit" />
              </SelectTrigger>
              <SelectContent>
                {habitOptions.map(habit => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Streak (Days)
            </Label>
            <div className="flex gap-2 mt-2">
              {[7, 14, 21, 30].map(days => (
                <Button
                  key={days}
                  type="button"
                  variant={targetDays === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetDays(days)}
                  className={targetDays === days ? 'bg-purple-600' : ''}
                >
                  {days} days
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Encouragement Message</Label>
            <Textarea
              id="message"
              placeholder="I believe in you! You've got this..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Reward Promise (Optional)
            </Label>
            <Input
              placeholder="What will you do if they succeed?"
              value={rewardPromise}
              onChange={(e) => setRewardPromise(e.target.value)}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {rewardSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setRewardPromise(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Your friend will receive:</span>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-6">
              <li>• Email notification about your sponsorship</li>
              <li>• Your encouragement message</li>
              <li>• Daily motivation during their streak</li>
              {rewardPromise && <li>• Your reward promise when they succeed!</li>}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !email || !selectedHabit || !message}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Sponsor Streak
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
