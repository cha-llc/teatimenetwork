import React from 'react';
import {
  Heart, Dumbbell, Book, Brain, Target, Star, Sun, Moon,
  Coffee, Music, Camera, Palette, Code, Globe, Home, Briefcase,
  Wallet, Gift, Trophy, Flame, Zap, Clock, Calendar, Check,
  Folder, Shield, Wine, Cigarette, Candy, Ban
} from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, React.FC<any>> = {
  heart: Heart,
  dumbbell: Dumbbell,
  book: Book,
  brain: Brain,
  target: Target,
  star: Star,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  music: Music,
  camera: Camera,
  palette: Palette,
  code: Code,
  globe: Globe,
  home: Home,
  briefcase: Briefcase,
  wallet: Wallet,
  gift: Gift,
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  clock: Clock,
  calendar: Calendar,
  check: Check,
  folder: Folder,
  shield: Shield,
  wine: Wine,
  cigarette: Cigarette,
  candy: Candy,
  ban: Ban
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = '', size = 24 }) => {
  const IconComponent = iconMap[icon.toLowerCase()] || Folder;
  return <IconComponent className={className} size={size} />;
};

export default CategoryIcon;
