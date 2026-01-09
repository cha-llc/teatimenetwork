import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Habit } from './useHabits';

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  goal: 'fitness' | 'productivity' | 'wellness' | 'learning' | 'custom';
  frequency: string;
  target_days: number[];
  recommended_time: string;
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  color: string;
  icon: string;
  is_community: boolean;
  is_official: boolean;
  creator_id: string | null;
  creator_name: string | null;
  use_count: number;
  rating: number;
  created_at: string;
}

// Pre-built official templates
export const officialTemplates: HabitTemplate[] = [
  // Fitness Templates
  {
    id: 'fitness-1',
    name: 'Morning Run',
    description: 'Start your day with an energizing morning run to boost metabolism and mental clarity.',
    category: 'Fitness',
    goal: 'fitness',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '06:00',
    tips: [
      'Start with a 5-minute warm-up walk',
      'Keep a steady pace you can maintain',
      'Stay hydrated before and after',
      'Track your progress with a running app'
    ],
    difficulty: 'medium',
    duration_minutes: 30,
    color: '#F59E0B',
    icon: 'dumbbell',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 12453,
    rating: 4.8,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'fitness-2',
    name: 'Strength Training',
    description: 'Build muscle and increase strength with a structured workout routine.',
    category: 'Fitness',
    goal: 'fitness',
    frequency: 'daily',
    target_days: [1, 3, 5],
    recommended_time: '17:00',
    tips: [
      'Focus on compound movements',
      'Progressive overload is key',
      'Rest 48 hours between muscle groups',
      'Protein intake within 30 minutes post-workout'
    ],
    difficulty: 'hard',
    duration_minutes: 45,
    color: '#EF4444',
    icon: 'dumbbell',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 8932,
    rating: 4.7,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'fitness-3',
    name: 'Daily Stretching',
    description: 'Improve flexibility and prevent injuries with daily stretching exercises.',
    category: 'Fitness',
    goal: 'fitness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '07:00',
    tips: [
      'Hold each stretch for 30 seconds',
      'Never bounce while stretching',
      'Breathe deeply throughout',
      'Focus on tight areas'
    ],
    difficulty: 'easy',
    duration_minutes: 15,
    color: '#10B981',
    icon: 'heart',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 15678,
    rating: 4.9,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'fitness-4',
    name: '10,000 Steps',
    description: 'Walk 10,000 steps daily to improve cardiovascular health and burn calories.',
    category: 'Fitness',
    goal: 'fitness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '12:00',
    tips: [
      'Take walking breaks every hour',
      'Use stairs instead of elevators',
      'Park farther from destinations',
      'Walk during phone calls'
    ],
    difficulty: 'easy',
    duration_minutes: 60,
    color: '#06B6D4',
    icon: 'target',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 23456,
    rating: 4.6,
    created_at: '2024-01-01T00:00:00Z'
  },

  // Productivity Templates
  {
    id: 'productivity-1',
    name: 'Deep Work Session',
    description: 'Dedicate focused time to cognitively demanding tasks without distractions.',
    category: 'Productivity',
    goal: 'productivity',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '09:00',
    tips: [
      'Turn off all notifications',
      'Use the Pomodoro technique',
      'Set a clear goal before starting',
      'Keep water nearby'
    ],
    difficulty: 'medium',
    duration_minutes: 90,
    color: '#EC4899',
    icon: 'target',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 19234,
    rating: 4.9,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'productivity-2',
    name: 'Morning Planning',
    description: 'Plan your day each morning to maximize productivity and focus.',
    category: 'Productivity',
    goal: 'productivity',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '08:00',
    tips: [
      'List your top 3 priorities',
      'Time-block your calendar',
      'Review yesterday\'s progress',
      'Anticipate potential obstacles'
    ],
    difficulty: 'easy',
    duration_minutes: 15,
    color: '#8B5CF6',
    icon: 'calendar',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 28901,
    rating: 4.8,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'productivity-3',
    name: 'Inbox Zero',
    description: 'Process all emails and messages to maintain a clean inbox.',
    category: 'Productivity',
    goal: 'productivity',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '17:00',
    tips: [
      'Use the 2-minute rule',
      'Unsubscribe from unnecessary lists',
      'Create folders/labels for organization',
      'Batch process emails at set times'
    ],
    difficulty: 'easy',
    duration_minutes: 20,
    color: '#3B82F6',
    icon: 'check',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 14567,
    rating: 4.5,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'productivity-4',
    name: 'Weekly Review',
    description: 'Reflect on your week, celebrate wins, and plan for the next week.',
    category: 'Productivity',
    goal: 'productivity',
    frequency: 'weekly',
    target_days: [0],
    recommended_time: '18:00',
    tips: [
      'Review completed tasks and goals',
      'Identify what worked and what didn\'t',
      'Set intentions for next week',
      'Clear your workspace'
    ],
    difficulty: 'easy',
    duration_minutes: 30,
    color: '#F97316',
    icon: 'star',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 11234,
    rating: 4.7,
    created_at: '2024-01-01T00:00:00Z'
  },

  // Wellness Templates
  {
    id: 'wellness-1',
    name: 'Morning Meditation',
    description: 'Start your day with mindfulness to reduce stress and improve focus.',
    category: 'Mindfulness',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '06:30',
    tips: [
      'Find a quiet, comfortable spot',
      'Start with guided meditations',
      'Focus on your breath',
      'Don\'t judge wandering thoughts'
    ],
    difficulty: 'easy',
    duration_minutes: 10,
    color: '#8B5CF6',
    icon: 'brain',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 34567,
    rating: 4.9,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'wellness-2',
    name: 'Gratitude Journal',
    description: 'Write down things you\'re grateful for to boost happiness and well-being.',
    category: 'Mindfulness',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '21:00',
    tips: [
      'Write at least 3 things daily',
      'Be specific about why you\'re grateful',
      'Include small moments',
      'Review past entries when feeling down'
    ],
    difficulty: 'easy',
    duration_minutes: 5,
    color: '#F59E0B',
    icon: 'sun',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 29876,
    rating: 4.8,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'wellness-3',
    name: 'Digital Detox',
    description: 'Take a break from screens to reduce eye strain and improve sleep.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '20:00',
    tips: [
      'Set a specific end time for screens',
      'Use blue light filters in the evening',
      'Replace screen time with reading',
      'Keep devices out of the bedroom'
    ],
    difficulty: 'medium',
    duration_minutes: 60,
    color: '#14B8A6',
    icon: 'moon',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 18234,
    rating: 4.6,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'wellness-4',
    name: 'Hydration Tracker',
    description: 'Drink 8 glasses of water daily for better health and energy.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '08:00',
    tips: [
      'Start your day with a glass of water',
      'Carry a reusable water bottle',
      'Set hourly reminders',
      'Drink before you feel thirsty'
    ],
    difficulty: 'easy',
    duration_minutes: 1,
    color: '#0EA5E9',
    icon: 'coffee',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 41234,
    rating: 4.7,
    created_at: '2024-01-01T00:00:00Z'
  },

  // Learning Templates
  {
    id: 'learning-1',
    name: 'Read 30 Minutes',
    description: 'Expand your knowledge and vocabulary through daily reading.',
    category: 'Learning',
    goal: 'learning',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '21:00',
    tips: [
      'Choose books that interest you',
      'Set a page goal if time-based is hard',
      'Take notes on key insights',
      'Join a book club for accountability'
    ],
    difficulty: 'easy',
    duration_minutes: 30,
    color: '#3B82F6',
    icon: 'book',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 38901,
    rating: 4.9,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'learning-2',
    name: 'Language Practice',
    description: 'Practice a new language daily to achieve fluency faster.',
    category: 'Learning',
    goal: 'learning',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '12:00',
    tips: [
      'Use spaced repetition apps',
      'Practice speaking out loud',
      'Watch content in your target language',
      'Find a language exchange partner'
    ],
    difficulty: 'medium',
    duration_minutes: 20,
    color: '#6366F1',
    icon: 'globe',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 25678,
    rating: 4.8,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'learning-3',
    name: 'Coding Practice',
    description: 'Improve programming skills through daily coding challenges.',
    category: 'Learning',
    goal: 'learning',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '10:00',
    tips: [
      'Start with easy problems',
      'Focus on understanding, not speed',
      'Review solutions after solving',
      'Build projects to apply knowledge'
    ],
    difficulty: 'hard',
    duration_minutes: 45,
    color: '#22C55E',
    icon: 'code',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 19234,
    rating: 4.7,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'learning-4',
    name: 'Online Course',
    description: 'Complete lessons from an online course to learn new skills.',
    category: 'Learning',
    goal: 'learning',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5],
    recommended_time: '19:00',
    tips: [
      'Set a specific course goal',
      'Take notes while watching',
      'Complete exercises and quizzes',
      'Apply what you learn immediately'
    ],
    difficulty: 'medium',
    duration_minutes: 30,
    color: '#A855F7',
    icon: 'trophy',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 21456,
    rating: 4.6,
    created_at: '2024-01-01T00:00:00Z'
  },

  // Breaking Bad Habits Templates (Free for all users)
  {
    id: 'breaking-1',
    name: 'Stop Vaping',
    description: 'Break free from nicotine addiction by tracking your vape-free days and building healthier coping mechanisms.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '08:00',
    tips: [
      'Identify your triggers and plan alternatives',
      'Stay hydrated to reduce cravings',
      'Use the money saved as motivation',
      'Practice deep breathing when urges hit',
      'Celebrate each vape-free milestone'
    ],
    difficulty: 'hard',
    duration_minutes: 5,
    color: '#EF4444',
    icon: 'shield',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 18234,
    rating: 4.9,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'breaking-2',
    name: 'Stop Smoking',
    description: 'Quit smoking and reclaim your health. Track smoke-free days and build a healthier lifestyle.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '08:00',
    tips: [
      'Set a quit date and stick to it',
      'Remove all smoking materials from your environment',
      'Use nicotine replacement therapy if needed',
      'Exercise to manage withdrawal symptoms',
      'Join a support group or tell friends about your goal'
    ],
    difficulty: 'hard',
    duration_minutes: 5,
    color: '#DC2626',
    icon: 'shield',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 24567,
    rating: 4.8,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'breaking-3',
    name: 'Stop Drinking Alcohol',
    description: 'Take control of your relationship with alcohol. Track sober days and discover a clearer, healthier you.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '18:00',
    tips: [
      'Identify social situations that trigger drinking',
      'Find alcohol-free alternatives you enjoy',
      'Build a support network of sober friends',
      'Practice saying no with confidence',
      'Reward yourself with the money saved'
    ],
    difficulty: 'hard',
    duration_minutes: 5,
    color: '#7C3AED',
    icon: 'shield',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 21345,
    rating: 4.9,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'breaking-4',
    name: 'Stop Eating Sugar',
    description: 'Break your sugar addiction and improve your energy, mood, and overall health by going sugar-free.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '07:00',
    tips: [
      'Read food labels to identify hidden sugars',
      'Replace sugary snacks with fruits and nuts',
      'Stay hydrated - thirst is often mistaken for sugar cravings',
      'Eat protein-rich meals to stay satisfied',
      'Plan your meals to avoid impulsive sugar choices'
    ],
    difficulty: 'medium',
    duration_minutes: 5,
    color: '#F59E0B',
    icon: 'shield',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 19876,
    rating: 4.7,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'breaking-5',
    name: 'Stop Consuming Caffeine',
    description: 'Reduce or eliminate caffeine dependency for better sleep, reduced anxiety, and natural energy levels.',
    category: 'Health',
    goal: 'wellness',
    frequency: 'daily',
    target_days: [0, 1, 2, 3, 4, 5, 6],
    recommended_time: '06:00',
    tips: [
      'Gradually reduce intake to avoid withdrawal headaches',
      'Replace coffee with herbal tea or decaf',
      'Get enough sleep to reduce the need for caffeine',
      'Exercise in the morning for natural energy',
      'Stay hydrated throughout the day'
    ],
    difficulty: 'medium',
    duration_minutes: 5,
    color: '#8B5CF6',
    icon: 'coffee',
    is_community: false,
    is_official: true,
    creator_id: null,
    creator_name: 'Tea Time Network',
    use_count: 15678,
    rating: 4.6,
    created_at: '2024-01-01T00:00:00Z'
  }
];


export const useTemplates = () => {
  const { user, profile } = useAuth();
  const [communityTemplates, setCommunityTemplates] = useState<HabitTemplate[]>([]);
  const [myTemplates, setMyTemplates] = useState<HabitTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunityTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('habit_templates')
      .select('*')
      .eq('is_community', true)
      .order('use_count', { ascending: false })
      .limit(50);

    if (!error && data) {
      setCommunityTemplates(data);
    }
  }, []);

  const fetchMyTemplates = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('habit_templates')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyTemplates(data);
    }
  }, [user]);

  const createTemplate = async (template: Partial<HabitTemplate>) => {
    if (!user) return null;

    if (!profile?.is_premium) {
      throw new Error('Creating custom templates is a premium feature. Upgrade to save your own templates!');
    }

    const { data, error } = await supabase
      .from('habit_templates')
      .insert({
        ...template,
        creator_id: user.id,
        creator_name: profile?.full_name || 'Anonymous',
        is_community: false,
        is_official: false,
        use_count: 0,
        rating: 0
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setMyTemplates(prev => [data, ...prev]);
    }

    return data;
  };

  const shareTemplate = async (templateId: string) => {
    if (!user || !profile?.is_premium) {
      throw new Error('Sharing templates is a premium feature.');
    }

    const { error } = await supabase
      .from('habit_templates')
      .update({ is_community: true })
      .eq('id', templateId)
      .eq('creator_id', user.id);

    if (!error) {
      setMyTemplates(prev =>
        prev.map(t => t.id === templateId ? { ...t, is_community: true } : t)
      );
      await fetchCommunityTemplates();
    }
  };

  const unshareTemplate = async (templateId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('habit_templates')
      .update({ is_community: false })
      .eq('id', templateId)
      .eq('creator_id', user.id);

    if (!error) {
      setMyTemplates(prev =>
        prev.map(t => t.id === templateId ? { ...t, is_community: false } : t)
      );
      setCommunityTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('habit_templates')
      .delete()
      .eq('id', templateId)
      .eq('creator_id', user.id);

    if (!error) {
      setMyTemplates(prev => prev.filter(t => t.id !== templateId));
      setCommunityTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const incrementUseCount = async (templateId: string) => {
    // Only increment for non-official templates
    const template = [...communityTemplates, ...myTemplates].find(t => t.id === templateId);
    if (!template || template.is_official) return;

    await supabase
      .from('habit_templates')
      .update({ use_count: (template.use_count || 0) + 1 })
      .eq('id', templateId);
  };

  const habitToTemplate = (habit: Habit): Partial<HabitTemplate> => {
    return {
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      goal: 'custom',
      frequency: habit.frequency,
      target_days: habit.target_days,
      recommended_time: habit.reminder_time || '09:00',
      tips: [],
      difficulty: 'medium',
      duration_minutes: 15,
      color: habit.color,
      icon: habit.icon
    };
  };

  const templateToHabit = (template: HabitTemplate): Partial<Habit> => {
    return {
      name: template.name,
      description: template.description,
      category: template.category,
      frequency: template.frequency,
      target_days: template.target_days,
      reminder_time: template.recommended_time,
      color: template.color,
      icon: template.icon,
      is_active: true
    };
  };

  const getAllTemplates = useCallback(() => {
    return [...officialTemplates, ...communityTemplates];
  }, [communityTemplates]);

  const getTemplatesByGoal = useCallback((goal: string) => {
    return getAllTemplates().filter(t => t.goal === goal);
  }, [getAllTemplates]);

  const searchTemplates = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return getAllTemplates().filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    );
  }, [getAllTemplates]);

  useEffect(() => {
    Promise.all([
      fetchCommunityTemplates(),
      fetchMyTemplates()
    ]).then(() => setLoading(false));
  }, [fetchCommunityTemplates, fetchMyTemplates]);

  return {
    officialTemplates,
    communityTemplates,
    myTemplates,
    loading,
    createTemplate,
    shareTemplate,
    unshareTemplate,
    deleteTemplate,
    incrementUseCount,
    habitToTemplate,
    templateToHabit,
    getAllTemplates,
    getTemplatesByGoal,
    searchTemplates,
    refreshTemplates: () => Promise.all([fetchCommunityTemplates(), fetchMyTemplates()])
  };
};
