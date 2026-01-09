import React from 'react';
import { NeuroTeaBlend } from '@/hooks/useBiofeedback';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Trash2, 
  Music, 
  Clock,
  Waves,
  Leaf,
  Sparkles,
  Download,
  Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NeuroTeaBlendCardProps {
  blend: NeuroTeaBlend;
  isPlaying: boolean;
  onPlay: (blend: NeuroTeaBlend) => void;
  onStop: () => void;
  onDelete: (id: string) => void;
  onExport?: (blend: NeuroTeaBlend) => void;
}

export function NeuroTeaBlendCard({ 
  blend, 
  isPlaying,
  onPlay, 
  onStop, 
  onDelete,
  onExport
}: NeuroTeaBlendCardProps) {
  const { t } = useLanguage();

  const blendTypeConfig = {
    focus: {
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      icon: '🎯'
    },
    calm: {
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      icon: '🧘'
    },
    energy: {
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      icon: '⚡'
    },
    sleep: {
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      icon: '🌙'
    },
    custom: {
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      icon: '✨'
    }
  };

  const teaFlavorConfig = {
    green_tea: { name: 'Green Tea', emoji: '🍵', color: 'text-green-400' },
    chamomile: { name: 'Chamomile', emoji: '🌼', color: 'text-yellow-400' },
    matcha: { name: 'Matcha', emoji: '🍃', color: 'text-emerald-400' },
    oolong: { name: 'Oolong', emoji: '🫖', color: 'text-amber-400' },
    earl_grey: { name: 'Earl Grey', emoji: '☕', color: 'text-purple-400' }
  };

  const config = blendTypeConfig[blend.blend_type];
  const teaConfig = teaFlavorConfig[blend.tea_flavor];

  const ambientSoundLabels: Record<string, string> = {
    bubbling_water: 'Bubbling Water',
    rain: 'Rain',
    wind: 'Wind',
    birds: 'Birds',
    crickets: 'Crickets',
    fire_crackling: 'Fire',
    ocean_waves: 'Ocean',
    forest: 'Forest',
    thunder: 'Thunder',
    wind_chimes: 'Wind Chimes',
    temple_bells: 'Temple Bells',
    bamboo_fountain: 'Bamboo Fountain',
    tea_pouring: 'Tea Pouring',
    kettle_whistle: 'Kettle',
    ceramic_cups: 'Ceramic'
  };

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 overflow-hidden transition-all hover:shadow-lg ${isPlaying ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">{blend.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {blend.blend_type}
                </Badge>
                <span className={`text-xs ${teaConfig.color}`}>
                  {teaConfig.emoji} {teaConfig.name}
                </span>
              </div>
            </div>
          </div>
          {blend.is_public && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
        </div>

        {/* Description */}
        {blend.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{blend.description}</p>
        )}

        {/* Audio specs */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <Waves className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-xs text-gray-500">Binaural</p>
            <p className="text-sm font-medium text-white">{blend.binaural_frequency} Hz</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <Music className="w-4 h-4 mx-auto mb-1 text-purple-400" />
            <p className="text-xs text-gray-500">Base</p>
            <p className="text-sm font-medium text-white">{blend.base_frequency} Hz</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-green-400" />
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium text-white">{blend.duration_minutes} min</p>
          </div>
        </div>

        {/* Ambient sounds */}
        {blend.ambient_sounds && blend.ambient_sounds.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Ambient Sounds</p>
            <div className="flex flex-wrap gap-1">
              {blend.ambient_sounds.map((sound, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-gray-800">
                  {ambientSoundLabels[sound] || sound}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {blend.play_count} plays
          </span>
          {blend.effectiveness_score && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              {Math.round(blend.effectiveness_score * 100)}% effective
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isPlaying ? (
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={onStop}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button
              className={`flex-1 bg-gradient-to-r ${config.color} hover:opacity-90`}
              onClick={() => onPlay(blend)}
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => onExport(blend)}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => onDelete(blend.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
