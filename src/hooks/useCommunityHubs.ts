import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface MomentumHub {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  icon: string;
  cover_image?: string;
  member_count: number;
  is_official: boolean;
  is_private: boolean;
  created_by?: string;
  created_at: string;
  isMember?: boolean;
  role?: string;
}

export interface HubEvent {
  id: string;
  hub_id: string;
  title: string;
  description: string;
  event_type: 'ama' | 'workshop' | 'challenge' | 'meetup' | 'livestream';
  host_name: string;
  host_avatar?: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants?: number;
  current_participants: number;
  meeting_url?: string;
  is_live: boolean;
}

export interface MentorshipMatch {
  id: string;
  hub_id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  focus_areas: string[];
  notes?: string;
  mentor?: { name: string; avatar?: string; expertise?: string[] };
  mentee?: { name: string; avatar?: string };
}

export interface StreakSponsor {
  id: string;
  sponsor_id: string;
  recipient_id: string;
  habit_id: string;
  message: string;
  reward_promise?: string;
  target_days: number;
  current_days: number;
  status: 'active' | 'completed' | 'failed';
  sponsor?: { name: string; avatar?: string };
  habit?: { name: string };
}

export interface DisciplineDuel {
  id: string;
  title: string;
  description?: string;
  challenger_id: string;
  opponent_id?: string;
  habit_category: string;
  duration_days: number;
  stake: string;
  challenger_score: number;
  opponent_score: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  winner_id?: string;
  started_at?: string;
  ends_at?: string;
  challenger?: { name: string; avatar?: string };
  opponent?: { name: string; avatar?: string };
}

export interface AccessibilitySettings {
  adhd_mode: boolean;
  flexible_reminders: boolean;
  reminder_buffer_minutes: number;
  break_down_tasks: boolean;
  dopamine_rewards: boolean;
  gentle_notifications: boolean;
  no_streak_pressure: boolean;
  celebration_level: 'minimal' | 'normal' | 'enthusiastic';
  reduced_animations: boolean;
  high_contrast: boolean;
  larger_text: boolean;
  simplified_interface: boolean;
  one_habit_focus: boolean;
  daily_limit?: number;
  flexible_day_boundary: boolean;
  day_start_hour: number;
  grace_period_hours: number;
}

const defaultAccessibilitySettings: AccessibilitySettings = {
  adhd_mode: false,
  flexible_reminders: false,
  reminder_buffer_minutes: 30,
  break_down_tasks: false,
  dopamine_rewards: true,
  gentle_notifications: false,
  no_streak_pressure: false,
  celebration_level: 'normal',
  reduced_animations: false,
  high_contrast: false,
  larger_text: false,
  simplified_interface: false,
  one_habit_focus: false,
  daily_limit: undefined,
  flexible_day_boundary: false,
  day_start_hour: 0,
  grace_period_hours: 2
};

// Mock data for demonstration
const mockHubs: MomentumHub[] = [
  {
    id: '1',
    name: 'Fitness Warriors',
    slug: 'fitness-warriors',
    description: 'Transform your body, transform your life. Join thousands of fitness enthusiasts building unstoppable workout habits.',
    theme: 'fitness',
    icon: 'dumbbell',
    member_count: 12453,
    is_official: true,
    is_private: false,
    created_at: new Date().toISOString(),
    isMember: true,
    role: 'member'
  },
  {
    id: '2',
    name: 'Productivity Ninjas',
    slug: 'productivity-ninjas',
    description: 'Master your time, conquer your goals. Learn from top performers and build systems that work.',
    theme: 'productivity',
    icon: 'zap',
    member_count: 8921,
    is_official: true,
    is_private: false,
    created_at: new Date().toISOString(),
    isMember: false
  },
  {
    id: '3',
    name: 'Mindful Moments',
    slug: 'mindful-moments',
    description: 'Find peace in the chaos. Build meditation, journaling, and mindfulness habits with a supportive community.',
    theme: 'mindfulness',
    icon: 'heart',
    member_count: 6234,
    is_official: true,
    is_private: false,
    created_at: new Date().toISOString(),
    isMember: false
  },
  {
    id: '4',
    name: 'Learning Legends',
    slug: 'learning-legends',
    description: 'Never stop growing. Join lifelong learners building reading, studying, and skill-building habits.',
    theme: 'learning',
    icon: 'book',
    member_count: 5678,
    is_official: true,
    is_private: false,
    created_at: new Date().toISOString(),
    isMember: true,
    role: 'member'
  },
  {
    id: '5',
    name: 'Creative Collective',
    slug: 'creative-collective',
    description: 'Unleash your creativity daily. Writers, artists, musicians - build your creative practice together.',
    theme: 'creativity',
    icon: 'palette',
    member_count: 4521,
    is_official: true,
    is_private: false,
    created_at: new Date().toISOString(),
    isMember: false
  },
  {
    id: '6',
    name: 'Wellness Warriors',
    slug: 'wellness-warriors',
    description: 'Holistic health habits for mind, body, and soul. Sleep, nutrition, and self-care enthusiasts welcome.',
    theme: 'wellness',
    icon: 'sun',
    member_count: 7890,
    is_official: true,
    is_private: false,
    created_at: new Date().toISOString(),
    isMember: false
  }
];

const mockEvents: HubEvent[] = [
  {
    id: '1',
    hub_id: '1',
    title: 'AMA with Olympic Trainer Sarah Chen',
    description: 'Learn how elite athletes build unbreakable discipline. Q&A session with 20+ years of experience.',
    event_type: 'ama',
    host_name: 'Sarah Chen',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    max_participants: 500,
    current_participants: 342,
    is_live: false
  },
  {
    id: '2',
    hub_id: '2',
    title: 'Live: Morning Routine Challenge',
    description: 'Join us for a live morning routine session. Build your perfect morning together!',
    event_type: 'livestream',
    host_name: 'Marcus Johnson',
    scheduled_at: new Date().toISOString(),
    duration_minutes: 45,
    current_participants: 128,
    is_live: true
  },
  {
    id: '3',
    hub_id: '3',
    title: 'Meditation Workshop: Beginner to Pro',
    description: 'A comprehensive workshop on building a sustainable meditation practice.',
    event_type: 'workshop',
    host_name: 'Dr. Emily Park',
    scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    max_participants: 200,
    current_participants: 156,
    is_live: false
  },
  {
    id: '4',
    hub_id: '1',
    title: '30-Day Fitness Challenge Kickoff',
    description: 'Start the new month strong! Join our community-wide fitness challenge.',
    event_type: 'challenge',
    host_name: 'Fitness Warriors Team',
    scheduled_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 30,
    current_participants: 892,
    is_live: false
  }
];

const mockDuels: DisciplineDuel[] = [
  {
    id: '1',
    title: 'Morning Warrior Showdown',
    description: 'Who can maintain the best morning routine for 7 days?',
    challenger_id: 'user1',
    opponent_id: 'user2',
    habit_category: 'morning',
    duration_days: 7,
    stake: 'Loser posts a motivational video',
    challenger_score: 5,
    opponent_score: 4,
    status: 'active',
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    challenger: { name: 'Alex Rivera', avatar: undefined },
    opponent: { name: 'Jordan Smith', avatar: undefined }
  },
  {
    id: '2',
    title: 'Reading Race',
    description: 'Most pages read in 14 days wins!',
    challenger_id: 'user3',
    habit_category: 'reading',
    duration_days: 14,
    stake: 'Winner gets book recommendations curated by loser',
    challenger_score: 0,
    opponent_score: 0,
    status: 'pending',
    challenger: { name: 'Taylor Kim', avatar: undefined }
  }
];

const mockMentors = [
  {
    id: 'm1',
    name: 'Dr. Sarah Mitchell',
    avatar: undefined,
    expertise: ['Habit Psychology', 'Behavior Change', 'ADHD Strategies'],
    bio: '15 years helping people build lasting habits. Specializes in neurodiversity-friendly approaches.',
    mentees_helped: 234,
    rating: 4.9
  },
  {
    id: 'm2',
    name: 'Marcus Chen',
    avatar: undefined,
    expertise: ['Fitness Habits', 'Nutrition', 'Morning Routines'],
    bio: 'Former athlete turned habit coach. Believes everyone can build an athletic mindset.',
    mentees_helped: 156,
    rating: 4.8
  },
  {
    id: 'm3',
    name: 'Priya Sharma',
    avatar: undefined,
    expertise: ['Productivity Systems', 'Time Management', 'Work-Life Balance'],
    bio: 'Tech executive who mastered the art of doing more with less. Loves helping others find their flow.',
    mentees_helped: 189,
    rating: 4.9
  }
];

export function useCommunityHubs() {
  const [hubs, setHubs] = useState<MomentumHub[]>(mockHubs);
  const [events, setEvents] = useState<HubEvent[]>(mockEvents);
  const [duels, setDuels] = useState<DisciplineDuel[]>(mockDuels);
  const [mentors] = useState(mockMentors);
  const [sponsors, setSponsors] = useState<StreakSponsor[]>([]);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [loading, setLoading] = useState(false);
  const [accessibilityTips, setAccessibilityTips] = useState<any[]>([]);

  // Load accessibility settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility_settings');
    if (saved) {
      setAccessibilitySettings({ ...defaultAccessibilitySettings, ...JSON.parse(saved) });
    }
  }, []);

  const joinHub = useCallback(async (hubId: string) => {
    setHubs(prev => prev.map(hub => 
      hub.id === hubId 
        ? { ...hub, isMember: true, role: 'member', member_count: hub.member_count + 1 }
        : hub
    ));
  }, []);

  const leaveHub = useCallback(async (hubId: string) => {
    setHubs(prev => prev.map(hub => 
      hub.id === hubId 
        ? { ...hub, isMember: false, role: undefined, member_count: hub.member_count - 1 }
        : hub
    ));
  }, []);

  const createHub = useCallback(async (hubData: Partial<MomentumHub>) => {
    const newHub: MomentumHub = {
      id: Date.now().toString(),
      name: hubData.name || 'New Hub',
      slug: hubData.name?.toLowerCase().replace(/\s+/g, '-') || 'new-hub',
      description: hubData.description || '',
      theme: hubData.theme || 'productivity',
      icon: hubData.icon || 'users',
      member_count: 1,
      is_official: false,
      is_private: hubData.is_private || false,
      created_at: new Date().toISOString(),
      isMember: true,
      role: 'admin'
    };
    setHubs(prev => [newHub, ...prev]);
    return newHub;
  }, []);

  const registerForEvent = useCallback(async (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? { ...event, current_participants: event.current_participants + 1 }
        : event
    ));
  }, []);

  const createDuel = useCallback(async (duelData: Partial<DisciplineDuel>) => {
    const newDuel: DisciplineDuel = {
      id: Date.now().toString(),
      title: duelData.title || 'New Duel',
      description: duelData.description,
      challenger_id: 'current_user',
      habit_category: duelData.habit_category || 'general',
      duration_days: duelData.duration_days || 7,
      stake: duelData.stake || 'Bragging rights',
      challenger_score: 0,
      opponent_score: 0,
      status: 'pending',
      challenger: { name: 'You', avatar: undefined }
    };
    setDuels(prev => [newDuel, ...prev]);
    return newDuel;
  }, []);

  const acceptDuel = useCallback(async (duelId: string) => {
    setDuels(prev => prev.map(duel =>
      duel.id === duelId
        ? {
            ...duel,
            status: 'active',
            opponent_id: 'current_user',
            opponent: { name: 'You', avatar: undefined },
            started_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + duel.duration_days * 24 * 60 * 60 * 1000).toISOString()
          }
        : duel
    ));
  }, []);

  const sponsorStreak = useCallback(async (sponsorData: {
    recipientEmail: string;
    habitId: string;
    habitName: string;
    message: string;
    rewardPromise?: string;
    targetDays: number;
  }) => {
    setLoading(true);
    try {
      // Call edge function to send notification
      await supabase.functions.invoke('community-hubs', {
        body: {
          action: 'send-sponsor-notification',
          data: {
            recipientEmail: sponsorData.recipientEmail,
            sponsorName: 'You',
            habitName: sponsorData.habitName,
            message: sponsorData.message,
            rewardPromise: sponsorData.rewardPromise
          }
        }
      });

      const newSponsor: StreakSponsor = {
        id: Date.now().toString(),
        sponsor_id: 'current_user',
        recipient_id: 'recipient',
        habit_id: sponsorData.habitId,
        message: sponsorData.message,
        reward_promise: sponsorData.rewardPromise,
        target_days: sponsorData.targetDays,
        current_days: 0,
        status: 'active',
        sponsor: { name: 'You' },
        habit: { name: sponsorData.habitName }
      };
      setSponsors(prev => [newSponsor, ...prev]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccessibilitySettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setAccessibilitySettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('accessibility_settings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const getAccessibilityTips = useCallback(async (challenges: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('community-hubs', {
        body: {
          action: 'generate-accessibility-tips',
          data: {
            settings: accessibilitySettings,
            currentChallenges: challenges
          }
        }
      });

      if (data?.tips) {
        try {
          const parsed = JSON.parse(data.tips);
          setAccessibilityTips(Array.isArray(parsed) ? parsed : []);
        } catch {
          setAccessibilityTips([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [accessibilitySettings]);

  const generateDuelChallenge = useCallback(async (category: string, duration: number) => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('community-hubs', {
        body: {
          action: 'generate-duel-challenge',
          data: { category, duration }
        }
      });
      return data?.challenge || '';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hubs,
    events,
    duels,
    mentors,
    sponsors,
    accessibilitySettings,
    accessibilityTips,
    loading,
    joinHub,
    leaveHub,
    createHub,
    registerForEvent,
    createDuel,
    acceptDuel,
    sponsorStreak,
    updateAccessibilitySettings,
    getAccessibilityTips,
    generateDuelChallenge
  };
}
