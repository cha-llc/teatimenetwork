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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NeuroTeaBlend } from '@/hooks/useBiofeedback';
import { Loader2, Sparkles, Music, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateBlendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: {
    name: string;
    blendType: NeuroTeaBlend['blend_type'];
    teaFlavor: NeuroTeaBlend['tea_flavor'];
    targetState: string;
  }) => Promise<NeuroTeaBlend | null>;
}

export function CreateBlendModal({ isOpen, onClose, onCreate }: CreateBlendModalProps) {
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [blendType, setBlendType] = useState<NeuroTeaBlend['blend_type']>('focus');
  const [teaFlavor, setTeaFlavor] = useState<NeuroTeaBlend['tea_flavor']>('green_tea');
  const [targetState, setTargetState] = useState('');

  const blendTypes = [
    { value: 'focus', label: 'Focus', description: 'Enhance concentration and productivity', icon: '🎯' },
    { value: 'calm', label: 'Calm', description: 'Reduce stress and anxiety', icon: '🧘' },
    { value: 'energy', label: 'Energy', description: 'Boost alertness and motivation', icon: '⚡' },
    { value: 'sleep', label: 'Sleep', description: 'Prepare for restful sleep', icon: '🌙' },
    { value: 'custom', label: 'Custom', description: 'AI-generated based on your needs', icon: '✨' }
  ];

  const teaFlavors = [
    { value: 'green_tea', label: 'Green Tea', description: 'Light, refreshing, balanced', emoji: '🍵' },
    { value: 'chamomile', label: 'Chamomile', description: 'Soothing, floral, gentle', emoji: '🌼' },
    { value: 'matcha', label: 'Matcha', description: 'Earthy, energizing, focused', emoji: '🍃' },
    { value: 'oolong', label: 'Oolong', description: 'Complex, warming, meditative', emoji: '🫖' },
    { value: 'earl_grey', label: 'Earl Grey', description: 'Citrusy, sophisticated, uplifting', emoji: '☕' }
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setIsCreating(true);
    try {
      const result = await onCreate({
        name,
        blendType,
        teaFlavor,
        targetState: targetState || `Achieve ${blendType} state`
      });
      
      if (result) {
        setName('');
        setTargetState('');
        onClose();
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Create Neuro-Tea Blend
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="blend-name" className="text-gray-300">Blend Name</Label>
            <Input
              id="blend-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Focus Brew"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Blend Type */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <Music className="w-4 h-4 text-blue-400" />
              Blend Type
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {blendTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setBlendType(type.value as NeuroTeaBlend['blend_type'])}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    blendType === type.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className="text-xs mt-1 text-gray-300">{type.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {blendTypes.find(t => t.value === blendType)?.description}
            </p>
          </div>

          {/* Tea Flavor */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" />
              Tea Flavor Theme
            </Label>
            <Select value={teaFlavor} onValueChange={(v) => setTeaFlavor(v as NeuroTeaBlend['tea_flavor'])}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {teaFlavors.map((flavor) => (
                  <SelectItem key={flavor.value} value={flavor.value} className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span>{flavor.emoji}</span>
                      <span>{flavor.label}</span>
                      <span className="text-gray-500 text-xs">- {flavor.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target State */}
          <div className="space-y-2">
            <Label htmlFor="target-state" className="text-gray-300">
              Target Mental State (optional)
            </Label>
            <Textarea
              id="target-state"
              value={targetState}
              onChange={(e) => setTargetState(e.target.value)}
              placeholder="Describe your desired mental state, e.g., 'Deep focus for coding with calm alertness'"
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Our AI will generate optimal binaural frequencies and ambient sounds based on your description.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">AI will generate:</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Optimal binaural beat frequency (1-40 Hz)</li>
              <li>• Base carrier tone frequency</li>
              <li>• Tea-themed ambient soundscape</li>
              <li>• Recommended session duration</li>
              <li>• Poetic blend description</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Brewing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Blend
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
