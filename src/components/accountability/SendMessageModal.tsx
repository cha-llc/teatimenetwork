import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageCircle, Heart, PartyPopper, HandHeart, Bell, Send } from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSend: (message: string, type: 'encouragement' | 'celebration' | 'support' | 'reminder') => void;
}

const messageTypes = [
  {
    value: 'encouragement',
    label: 'Encouragement',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    description: 'Motivate them to keep going',
    templates: [
      "You've got this! Keep pushing forward! 💪",
      "I believe in you! One step at a time.",
      "Your dedication is inspiring! Keep it up!",
    ],
  },
  {
    value: 'celebration',
    label: 'Celebration',
    icon: PartyPopper,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    description: 'Celebrate their achievements',
    templates: [
      "Amazing work on your streak! So proud of you! 🎉",
      "You're crushing it! Celebrate this win!",
      "What an achievement! You should be proud!",
    ],
  },
  {
    value: 'support',
    label: 'Support',
    icon: HandHeart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Offer support during tough times',
    templates: [
      "It's okay to have off days. Tomorrow is a fresh start!",
      "I'm here for you. We'll get through this together.",
      "Don't be too hard on yourself. Progress isn't always linear.",
    ],
  },
  {
    value: 'reminder',
    label: 'Gentle Reminder',
    icon: Bell,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'A friendly nudge',
    templates: [
      "Hey! Don't forget about your habits today! 😊",
      "Just checking in - have you done your habits yet?",
      "Friendly reminder to stay on track today!",
    ],
  },
];

export function SendMessageModal({ isOpen, onClose, partnerName, onSend }: SendMessageModalProps) {
  const [messageType, setMessageType] = useState<'encouragement' | 'celebration' | 'support' | 'reminder'>('encouragement');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedType = messageTypes.find(t => t.value === messageType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    await onSend(message.trim(), messageType);
    setLoading(false);
    setMessage('');
    setMessageType('encouragement');
  };

  const useTemplate = (template: string) => {
    setMessage(template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            Send Message to {partnerName}
          </DialogTitle>
          <DialogDescription>
            Choose a message type and write your message
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message Type Selection */}
          <div className="space-y-2">
            <Label>Message Type</Label>
            <RadioGroup
              value={messageType}
              onValueChange={(v) => setMessageType(v as typeof messageType)}
              className="grid grid-cols-2 gap-2"
            >
              {messageTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.value}>
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${messageType === type.value
                          ? `border-indigo-500 ${type.bgColor}`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${type.color}`} />
                      <div>
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {selectedType.templates.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => useTemplate(template)}
                >
                  {template.slice(0, 30)}...
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder={`Write your ${messageType} message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
