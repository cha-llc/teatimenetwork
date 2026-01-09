import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FlavorProfileSelector } from './FlavorProfileBadge';
import { FlavorProfile } from '@/hooks/useIncubator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Lightbulb, Clock, Repeat } from 'lucide-react';

interface ProposeHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropose: (habit: {
    title: string;
    description: string;
    flavor_profile: FlavorProfile;
    category: string;
    suggested_frequency: string;
    suggested_duration: number;
    steep_time: number;
  }) => Promise<any>;
}

const categories = [
  { value: 'health', labelEn: 'Health & Fitness', labelEs: 'Salud y Fitness' },
  { value: 'productivity', labelEn: 'Productivity', labelEs: 'Productividad' },
  { value: 'mindfulness', labelEn: 'Mindfulness', labelEs: 'Mindfulness' },
  { value: 'learning', labelEn: 'Learning', labelEs: 'Aprendizaje' },
  { value: 'social', labelEn: 'Social', labelEs: 'Social' },
  { value: 'creativity', labelEn: 'Creativity', labelEs: 'Creatividad' },
  { value: 'finance', labelEn: 'Finance', labelEs: 'Finanzas' },
  { value: 'self-care', labelEn: 'Self-Care', labelEs: 'Autocuidado' },
  { value: 'other', labelEn: 'Other', labelEs: 'Otro' },
];

const frequencies = [
  { value: 'daily', labelEn: 'Daily', labelEs: 'Diario' },
  { value: 'weekdays', labelEn: 'Weekdays', labelEs: 'Días laborables' },
  { value: 'weekends', labelEn: 'Weekends', labelEs: 'Fines de semana' },
  { value: '3x-week', labelEn: '3x per week', labelEs: '3 veces por semana' },
  { value: 'weekly', labelEn: 'Weekly', labelEs: 'Semanal' },
];

export function ProposeHabitModal({ open, onOpenChange, onPropose }: ProposeHabitModalProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flavor_profile: 'medium' as FlavorProfile,
    category: '',
    suggested_frequency: 'daily',
    suggested_duration: 15,
    steep_time: 7,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onPropose(formData);
      setFormData({
        title: '',
        description: '',
        flavor_profile: 'medium',
        category: '',
        suggested_frequency: 'daily',
        suggested_duration: 15,
        steep_time: 7,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            {language === 'es' ? 'Proponer Nuevo Hábito' : 'Propose New Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {language === 'es' ? 'Nombre del Hábito' : 'Habit Name'}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder={language === 'es' ? 'ej. Meditación matutina' : 'e.g. Morning meditation'}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {language === 'es' ? 'Descripción' : 'Description'}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder={language === 'es' 
                ? 'Describe el hábito y cómo ayuda...' 
                : 'Describe the habit and how it helps...'}
              rows={3}
            />
          </div>

          {/* Flavor Profile */}
          <div className="space-y-2">
            <Label>
              {language === 'es' ? 'Perfil de Sabor (Dificultad)' : 'Flavor Profile (Difficulty)'}
            </Label>
            <FlavorProfileSelector
              value={formData.flavor_profile}
              onChange={flavor => setFormData({ ...formData, flavor_profile: flavor })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{language === 'es' ? 'Categoría' : 'Category'}</Label>
            <Select
              value={formData.category}
              onValueChange={value => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={language === 'es' ? 'Seleccionar categoría' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === 'es' ? cat.labelEs : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Repeat className="w-4 h-4" />
                {language === 'es' ? 'Frecuencia' : 'Frequency'}
              </Label>
              <Select
                value={formData.suggested_frequency}
                onValueChange={value => setFormData({ ...formData, suggested_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {language === 'es' ? freq.labelEs : freq.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {language === 'es' ? 'Duración (min)' : 'Duration (min)'}
              </Label>
              <Input
                type="number"
                min={1}
                max={180}
                value={formData.suggested_duration}
                onChange={e => setFormData({ ...formData, suggested_duration: parseInt(e.target.value) || 15 })}
              />
            </div>
          </div>

          {/* Steep Time */}
          <div className="space-y-2">
            <Label>
              {language === 'es' ? 'Tiempo de Infusión (días)' : 'Steep Time (days)'}
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              {language === 'es' 
                ? 'Cuánto tiempo debe el hábito "infusionar" antes de pasar a pruebas beta'
                : 'How long should the habit "steep" before moving to beta testing'}
            </p>
            <div className="flex items-center gap-4">
              {[3, 7, 14, 30].map(days => (
                <Button
                  key={days}
                  type="button"
                  variant={formData.steep_time === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, steep_time: days })}
                >
                  {days} {language === 'es' ? 'días' : 'days'}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'es' ? 'Proponer Hábito' : 'Propose Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
