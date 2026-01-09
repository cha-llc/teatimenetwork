import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, Palette, Shirt, Sparkles, Crown, Shield, 
  Sword, Wand2, Heart, Flame, Zap, Star,
  Check, ChevronRight
} from 'lucide-react';

export interface AvatarData {
  avatar_name: string;
  avatar_class: string;
  avatar_appearance: {
    skin: string;
    hair: string;
    eyes: string;
    outfit: string;
    accessory: string | null;
  };
}

interface AvatarCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvatarData) => void;
  initialData?: AvatarData;
}

const SKIN_COLORS = [
  { id: 'fair', color: '#FFDFC4', name: 'Fair' },
  { id: 'light', color: '#F0D5BE', name: 'Light' },
  { id: 'medium', color: '#D4A574', name: 'Medium' },
  { id: 'tan', color: '#C68642', name: 'Tan' },
  { id: 'brown', color: '#8D5524', name: 'Brown' },
  { id: 'dark', color: '#5C3317', name: 'Dark' },
];

const HAIR_COLORS = [
  { id: 'black', color: '#1C1C1C', name: 'Black' },
  { id: 'brown', color: '#4A3728', name: 'Brown' },
  { id: 'blonde', color: '#D4A76A', name: 'Blonde' },
  { id: 'red', color: '#8B3A3A', name: 'Red' },
  { id: 'gray', color: '#9E9E9E', name: 'Gray' },
  { id: 'purple', color: '#7B68EE', name: 'Purple' },
  { id: 'blue', color: '#4169E1', name: 'Blue' },
  { id: 'pink', color: '#FF69B4', name: 'Pink' },
];

const EYE_COLORS = [
  { id: 'brown', color: '#634E34', name: 'Brown' },
  { id: 'blue', color: '#3B7AB8', name: 'Blue' },
  { id: 'green', color: '#4A7C59', name: 'Green' },
  { id: 'hazel', color: '#8E7618', name: 'Hazel' },
  { id: 'gray', color: '#7D8A8A', name: 'Gray' },
  { id: 'amber', color: '#FFBF00', name: 'Amber' },
  { id: 'violet', color: '#8B5CF6', name: 'Violet' },
];

const CLASSES = [
  { id: 'warrior', name: 'Discipline Warrior', icon: Sword, color: 'from-red-500 to-orange-500', description: 'Masters of consistency and strength' },
  { id: 'mage', name: 'Habit Mage', icon: Wand2, color: 'from-purple-500 to-indigo-500', description: 'Wielders of habit stacking magic' },
  { id: 'healer', name: 'Wellness Healer', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Guardians of health and balance' },
  { id: 'ranger', name: 'Focus Ranger', icon: Zap, color: 'from-green-500 to-emerald-500', description: 'Experts in deep work and productivity' },
  { id: 'paladin', name: 'Streak Paladin', icon: Shield, color: 'from-blue-500 to-cyan-500', description: 'Protectors of unbroken streaks' },
  { id: 'monk', name: 'Mindful Monk', icon: Star, color: 'from-amber-500 to-yellow-500', description: 'Masters of meditation and presence' },
];

const OUTFITS = [
  { id: 'casual', name: 'Casual', color: '#6B7280' },
  { id: 'warrior', name: 'Warrior Armor', color: '#DC2626' },
  { id: 'mage', name: 'Mage Robes', color: '#7C3AED' },
  { id: 'healer', name: 'Healer Vestments', color: '#EC4899' },
  { id: 'ranger', name: 'Ranger Gear', color: '#059669' },
  { id: 'royal', name: 'Royal Attire', color: '#F59E0B' },
];

const ACCESSORIES = [
  { id: null, name: 'None', icon: null },
  { id: 'crown', name: 'Crown', icon: Crown },
  { id: 'shield', name: 'Shield', icon: Shield },
  { id: 'flame', name: 'Flame Aura', icon: Flame },
  { id: 'sparkle', name: 'Sparkle', icon: Sparkles },
  { id: 'star', name: 'Star Halo', icon: Star },
];

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [avatarName, setAvatarName] = useState(initialData?.avatar_name || '');
  const [avatarClass, setAvatarClass] = useState(initialData?.avatar_class || 'warrior');
  const [skin, setSkin] = useState(initialData?.avatar_appearance?.skin || SKIN_COLORS[0].color);
  const [hair, setHair] = useState(initialData?.avatar_appearance?.hair || HAIR_COLORS[0].color);
  const [eyes, setEyes] = useState(initialData?.avatar_appearance?.eyes || EYE_COLORS[0].color);
  const [outfit, setOutfit] = useState(initialData?.avatar_appearance?.outfit || OUTFITS[0].id);
  const [accessory, setAccessory] = useState<string | null>(initialData?.avatar_appearance?.accessory || null);
  const [activeTab, setActiveTab] = useState('class');

  const handleSave = () => {
    onSave({
      avatar_name: avatarName || 'Hero',
      avatar_class: avatarClass,
      avatar_appearance: {
        skin,
        hair,
        eyes,
        outfit,
        accessory
      }
    });
    onClose();
  };

  const selectedClass = CLASSES.find(c => c.id === avatarClass);
  const ClassIcon = selectedClass?.icon || Sword;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-purple-400" />
            Create Your Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-40 h-40 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: skin }}
            >
              {/* Face representation */}
              <div className="relative">
                {/* Eyes */}
                <div className="flex gap-6 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: eyes }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: eyes }}
                  />
                </div>
                {/* Mouth */}
                <div className="w-8 h-2 bg-pink-400 rounded-full mx-auto mt-2" />
              </div>
              
              {/* Hair */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 rounded-t-full"
                style={{ backgroundColor: hair }}
              />
              
              {/* Outfit indicator */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-8 rounded-b-2xl"
                style={{ backgroundColor: OUTFITS.find(o => o.id === outfit)?.color }}
              />
              
              {/* Accessory */}
              {accessory && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  {accessory === 'crown' && <Crown className="w-8 h-8 text-yellow-400" />}
                  {accessory === 'shield' && <Shield className="w-8 h-8 text-blue-400" />}
                  {accessory === 'flame' && <Flame className="w-8 h-8 text-orange-400" />}
                  {accessory === 'sparkle' && <Sparkles className="w-8 h-8 text-purple-400" />}
                  {accessory === 'star' && <Star className="w-8 h-8 text-yellow-300" />}
                </div>
              )}
              
              {/* Class Icon */}
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r ${selectedClass?.color} flex items-center justify-center shadow-lg`}>
                <ClassIcon className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Name Input */}
            <div className="w-full">
              <Label className="text-slate-400">Avatar Name</Label>
              <Input
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="Enter your hero name..."
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>

            {/* Selected Class */}
            {selectedClass && (
              <div className={`mt-4 w-full p-3 rounded-xl bg-gradient-to-r ${selectedClass.color} bg-opacity-20`}>
                <div className="flex items-center gap-2 mb-1">
                  <ClassIcon className="w-5 h-5" />
                  <span className="font-bold">{selectedClass.name}</span>
                </div>
                <p className="text-sm text-white/80">{selectedClass.description}</p>
              </div>
            )}
          </div>

          {/* Customization Tabs */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 bg-slate-800 mb-4">
                <TabsTrigger value="class" className="data-[state=active]:bg-purple-500">
                  <Sword className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-500">
                  <Palette className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="outfit" className="data-[state=active]:bg-purple-500">
                  <Shirt className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="accessory" className="data-[state=active]:bg-purple-500">
                  <Sparkles className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Class Selection */}
              <TabsContent value="class" className="space-y-2">
                <Label className="text-slate-400">Choose Your Class</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CLASSES.map((cls) => {
                    const Icon = cls.icon;
                    return (
                      <button
                        key={cls.id}
                        onClick={() => setAvatarClass(cls.id)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          avatarClass === cls.id 
                            ? `bg-gradient-to-r ${cls.color} ring-2 ring-white` 
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{cls.name}</span>
                        </div>
                        <p className="text-xs text-white/70 line-clamp-1">{cls.description}</p>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Appearance */}
              <TabsContent value="appearance" className="space-y-4">
                {/* Skin Color */}
                <div>
                  <Label className="text-slate-400 mb-2 block">Skin Tone</Label>
                  <div className="flex gap-2">
                    {SKIN_COLORS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSkin(s.color)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          skin === s.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                        style={{ backgroundColor: s.color }}
                        title={s.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <Label className="text-slate-400 mb-2 block">Hair Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setHair(h.color)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          hair === h.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                        style={{ backgroundColor: h.color }}
                        title={h.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Eye Color */}
                <div>
                  <Label className="text-slate-400 mb-2 block">Eye Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {EYE_COLORS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setEyes(e.color)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          eyes === e.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                        style={{ backgroundColor: e.color }}
                        title={e.name}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Outfit */}
              <TabsContent value="outfit" className="space-y-2">
                <Label className="text-slate-400">Choose Outfit</Label>
                <div className="grid grid-cols-2 gap-2">
                  {OUTFITS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOutfit(o.id)}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                        outfit === o.id 
                          ? 'bg-slate-700 ring-2 ring-purple-500' 
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: o.color }}
                      />
                      <span className="text-sm">{o.name}</span>
                      {outfit === o.id && <Check className="w-4 h-4 text-purple-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Accessory */}
              <TabsContent value="accessory" className="space-y-2">
                <Label className="text-slate-400">Choose Accessory</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCESSORIES.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id || 'none'}
                        onClick={() => setAccessory(a.id)}
                        className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                          accessory === a.id 
                            ? 'bg-slate-700 ring-2 ring-purple-500' 
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        {Icon ? (
                          <Icon className="w-6 h-6 text-purple-400" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-600" />
                        )}
                        <span className="text-sm">{a.name}</span>
                        {accessory === a.id && <Check className="w-4 h-4 text-purple-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-indigo-500"
          >
            Save Avatar
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCreator;
