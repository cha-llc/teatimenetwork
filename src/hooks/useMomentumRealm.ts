import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface MomentumProfile {
  id: string;
  user_id: string;
  avatar_name: string;
  avatar_class: string;
  avatar_appearance: {
    skin: string;
    hair: string;
    eyes: string;
    outfit: string;
    accessory: string | null;
  };
  level: number;
  experience: number;
  momentum_tokens: number;
  current_chapter: number;
  total_monsters_defeated: number;
  total_quests_completed: number;
  current_ally_id: string | null;
  unlocked_allies: string[];
  unlocked_artifacts: string[];
  unlocked_outfits: string[];
  unlocked_accessories: string[];
  ar_trees_planted: number;
  daily_roulette_spins: number;
  last_roulette_spin: string | null;
}

export interface StoryChapter {
  id: string;
  chapter_number: number;
  title: string;
  description: string;
  narrative_intro: string;
  narrative_completion: string;
  required_level: number;
  required_quests: number;
  rewards: { tokens: number; experience: number };
}

export interface Ally {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url: string | null;
  rarity: string;
  unlock_requirement: any;
  passive_bonus: { type: string; value: number };
  special_ability: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  category: string | null;
  requirements: any;
  rewards: { tokens: number; experience: number };
  is_cooperative: boolean;
  max_participants: number;
  duration_hours: number;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
  expires_at: string | null;
  quest?: Quest;
}

export interface ChaosMonster {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url: string | null;
  health: number;
  difficulty: string;
  weakness_category: string | null;
  rewards: { tokens: number; experience: number };
}

export interface MonsterBattle {
  id: string;
  monster_id: string;
  team_id: string | null;
  current_health: number;
  max_health: number;
  status: string;
  participants: string[];
  damage_log: any[];
  started_at: string;
  expires_at: string | null;
  monster?: ChaosMonster;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  item_type: string;
  item_data: any;
  price_tokens: number;
  is_premium: boolean;
  is_limited: boolean;
  stock: number | null;
  image_url: string | null;
}

export interface ARTree {
  id: string;
  user_id: string;
  habit_id: string | null;
  tree_type: string;
  growth_stage: number;
  total_waterings: number;
  position: { x: number; y: number; z: number };
  planted_at: string;
  last_watered: string | null;
}

export interface RouletteReward {
  type: string;
  value: number;
  label: string;
  rarity: string;
}

const ROULETTE_REWARDS: RouletteReward[] = [
  { type: 'tokens', value: 10, label: '10 Tokens', rarity: 'common' },
  { type: 'tokens', value: 25, label: '25 Tokens', rarity: 'common' },
  { type: 'tokens', value: 50, label: '50 Tokens', rarity: 'uncommon' },
  { type: 'tokens', value: 100, label: '100 Tokens', rarity: 'rare' },
  { type: 'experience', value: 25, label: '25 XP', rarity: 'common' },
  { type: 'experience', value: 50, label: '50 XP', rarity: 'common' },
  { type: 'experience', value: 100, label: '100 XP', rarity: 'uncommon' },
  { type: 'experience', value: 250, label: '250 XP', rarity: 'rare' },
  { type: 'streak_shield', value: 1, label: 'Streak Shield', rarity: 'rare' },
  { type: 'xp_boost', value: 2, label: '2x XP (24h)', rarity: 'epic' },
  { type: 'token_boost', value: 1.5, label: '1.5x Tokens (24h)', rarity: 'epic' },
  { type: 'mystery_ally', value: 1, label: 'Mystery Ally Egg', rarity: 'legendary' },
];

const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
  4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
  19200, 21200, 23300, 25500, 27800, 30200, 32700, 35300, 38000, 40800
];

// Ally images mapping
const ALLY_IMAGES: Record<string, string> = {
  'Spark': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849333095_ec5e1a23.jpg',
  'Warrior Spirit': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849333129_586f4edc.jpg',
  'Sage Owl': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849336023_052edaa7.jpg',
  'Crystal Fox': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849336067_b05bd756.jpg',
};

// Monster images mapping
const MONSTER_IMAGES: Record<string, string> = {
  'Procrastination Phantom': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849353803_ed7afdc6.jpg',
  'Distraction Imp': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849356365_0d3c932f.png',
  'Comfort Zone Golem': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849355762_809ed5bc.jpg',
};

// Tree images mapping
const TREE_IMAGES: Record<string, string> = {
  'oak': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849382168_583d6336.jpg',
  'cherry_blossom': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849384874_d421e928.png',
  'crystal': 'https://d64gsuwffb70l.cloudfront.net/694b4398bd8d5c5b93f8f6c4_1766849382801_141ed91f.jpg',
};

// Demo data
const DEMO_PROFILE: MomentumProfile = {
  id: 'demo-profile',
  user_id: 'demo-user-id',
  avatar_name: 'Hero',
  avatar_class: 'Warrior',
  avatar_appearance: {
    skin: '#FFDFC4',
    hair: '#4A3728',
    eyes: '#3B82F6',
    outfit: 'default',
    accessory: null,
  },
  level: 1,
  experience: 0,
  momentum_tokens: 100,
  current_chapter: 1,
  total_monsters_defeated: 0,
  total_quests_completed: 0,
  current_ally_id: 'ally-1',
  unlocked_allies: ['ally-1'],
  unlocked_artifacts: [],
  unlocked_outfits: ['default'],
  unlocked_accessories: [],
  ar_trees_planted: 0,
  daily_roulette_spins: 1,
  last_roulette_spin: null,
};

const DEMO_CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter-1',
    chapter_number: 1,
    title: 'The Awakening',
    description: 'Begin your journey as a Momentum Hero. Learn the basics of habit building and defeat your first chaos monster.',
    narrative_intro: 'You awaken in a world where habits shape reality. The Chaos has spread, corrupting the land with procrastination and distraction. Only you can restore balance.',
    narrative_completion: 'With your first victory, you feel the power of momentum flowing through you. The journey has just begun.',
    required_level: 1,
    required_quests: 3,
    rewards: { tokens: 100, experience: 200 },
  },
  {
    id: 'chapter-2',
    chapter_number: 2,
    title: 'The First Trial',
    description: 'Face greater challenges and unlock your first ally companion.',
    narrative_intro: 'The path ahead grows darker, but you are not alone. Ancient allies await those who prove their dedication.',
    narrative_completion: 'Your ally joins your cause. Together, you are stronger than the sum of your parts.',
    required_level: 3,
    required_quests: 5,
    rewards: { tokens: 200, experience: 400 },
  },
  {
    id: 'chapter-3',
    chapter_number: 3,
    title: 'The Shadow Realm',
    description: 'Enter the realm of shadows where your greatest fears manifest as monsters.',
    narrative_intro: 'Beyond the veil lies the Shadow Realm, where doubt and fear take physical form. Only the truly dedicated may enter.',
    narrative_completion: 'You have conquered your inner demons. The shadows retreat before your light.',
    required_level: 5,
    required_quests: 7,
    rewards: { tokens: 300, experience: 600 },
  },
  {
    id: 'chapter-4',
    chapter_number: 4,
    title: 'The Fortress of Discipline',
    description: 'Storm the fortress and face the Perfectionism Guardian.',
    narrative_intro: 'The Fortress of Discipline stands before you, its walls built from broken promises and abandoned goals.',
    narrative_completion: 'The fortress falls, and with it, the illusion that perfection is required for progress.',
    required_level: 8,
    required_quests: 10,
    rewards: { tokens: 500, experience: 1000 },
  },
  {
    id: 'chapter-5',
    chapter_number: 5,
    title: 'The Final Stand',
    description: 'Face the Chaos Lord and restore balance to the realm.',
    narrative_intro: 'The Chaos Lord awaits at the heart of corruption. All your training has led to this moment.',
    narrative_completion: 'Victory! The Chaos Lord is defeated, and balance is restored. But remember, the journey of habits never truly ends.',
    required_level: 10,
    required_quests: 15,
    rewards: { tokens: 1000, experience: 2000 },
  },
];

const DEMO_ALLIES: Ally[] = [
  {
    id: 'ally-1',
    name: 'Spark',
    type: 'elemental',
    description: 'A tiny flame spirit that ignites your motivation. Spark has been with heroes since the dawn of discipline.',
    image_url: null,
    rarity: 'common',
    unlock_requirement: { type: 'default' },
    passive_bonus: { type: 'experience_boost', value: 5 },
    special_ability: 'Motivation Burst: +10% XP for 1 hour after completing 3 habits',
  },
  {
    id: 'ally-2',
    name: 'Warrior Spirit',
    type: 'spirit',
    description: 'The ghost of an ancient warrior who mastered the art of daily discipline. Grants strength in battle.',
    image_url: null,
    rarity: 'rare',
    unlock_requirement: { type: 'monsters_defeated', count: 5 },
    passive_bonus: { type: 'damage_boost', value: 15 },
    special_ability: 'Battle Cry: Double damage on your next attack',
  },
  {
    id: 'ally-3',
    name: 'Sage Owl',
    type: 'beast',
    description: 'A wise owl who sees through the fog of distraction. Helps you focus on what truly matters.',
    image_url: null,
    rarity: 'epic',
    unlock_requirement: { type: 'quests_completed', count: 10 },
    passive_bonus: { type: 'quest_progress', value: 20 },
    special_ability: 'Clarity Vision: Reveal monster weaknesses',
  },
  {
    id: 'ally-4',
    name: 'Crystal Fox',
    type: 'mythical',
    description: 'A legendary fox made of pure crystallized momentum. Said to appear only to the most dedicated heroes.',
    image_url: null,
    rarity: 'legendary',
    unlock_requirement: { type: 'level', level: 10 },
    passive_bonus: { type: 'token_boost', value: 25 },
    special_ability: 'Fortune\'s Favor: Double token rewards once per day',
  },
];

const DEMO_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Morning Momentum',
    description: 'Complete 3 habits before noon to build morning momentum.',
    quest_type: 'daily',
    category: 'productivity',
    requirements: { type: 'habits', count: 3, timeframe: 'morning' },
    rewards: { tokens: 20, experience: 30 },
    is_cooperative: false,
    max_participants: 1,
    duration_hours: 12,
  },
  {
    id: 'quest-2',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak on any habit.',
    quest_type: 'streak',
    category: 'fitness',
    requirements: { type: 'streak', count: 3 },
    rewards: { tokens: 50, experience: 75 },
    is_cooperative: false,
    max_participants: 1,
    duration_hours: 72,
  },
  {
    id: 'quest-3',
    title: 'Habit Hero',
    description: 'Complete all your habits for the day.',
    quest_type: 'daily',
    category: 'health',
    requirements: { type: 'all_habits', count: 1 },
    rewards: { tokens: 30, experience: 50 },
    is_cooperative: false,
    max_participants: 1,
    duration_hours: 24,
  },
  {
    id: 'quest-4',
    title: 'Team Challenge',
    description: 'Work with friends to complete 20 habits collectively.',
    quest_type: 'cooperative',
    category: 'mindfulness',
    requirements: { type: 'team_habits', count: 20 },
    rewards: { tokens: 100, experience: 150 },
    is_cooperative: true,
    max_participants: 5,
    duration_hours: 48,
  },
  {
    id: 'quest-5',
    title: 'Weekly Warrior',
    description: 'Complete at least 5 habits every day for a week.',
    quest_type: 'weekly',
    category: 'productivity',
    requirements: { type: 'daily_minimum', count: 7, minimum: 5 },
    rewards: { tokens: 200, experience: 300 },
    is_cooperative: false,
    max_participants: 1,
    duration_hours: 168,
  },
  {
    id: 'quest-6',
    title: 'Mindfulness Master',
    description: 'Complete 5 mindfulness-related habits.',
    quest_type: 'special',
    category: 'mindfulness',
    requirements: { type: 'category_habits', count: 5, category: 'mindfulness' },
    rewards: { tokens: 75, experience: 100 },
    is_cooperative: false,
    max_participants: 1,
    duration_hours: 48,
  },
];

const DEMO_MONSTERS: ChaosMonster[] = [
  {
    id: 'monster-1',
    name: 'Procrastination Phantom',
    type: 'procrastination',
    description: 'A ghostly creature that whispers "later" and "tomorrow" to weaken your resolve.',
    image_url: null,
    health: 100,
    difficulty: 'easy',
    weakness_category: 'productivity',
    rewards: { tokens: 50, experience: 75 },
  },
  {
    id: 'monster-2',
    name: 'Distraction Imp',
    type: 'distraction',
    description: 'A mischievous imp that creates endless notifications and temptations.',
    image_url: null,
    health: 150,
    difficulty: 'medium',
    weakness_category: 'mindfulness',
    rewards: { tokens: 75, experience: 100 },
  },
  {
    id: 'monster-3',
    name: 'Comfort Zone Golem',
    type: 'comfort_zone',
    description: 'A massive stone creature that blocks the path to growth and change.',
    image_url: null,
    health: 250,
    difficulty: 'hard',
    weakness_category: 'fitness',
    rewards: { tokens: 150, experience: 200 },
  },
  {
    id: 'monster-4',
    name: 'Doubt Dragon',
    type: 'doubt',
    description: 'A fearsome dragon that breathes fire of self-doubt and imposter syndrome.',
    image_url: null,
    health: 400,
    difficulty: 'boss',
    weakness_category: 'learning',
    rewards: { tokens: 300, experience: 500 },
  },
];

const DEMO_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'item-1',
    name: 'Streak Shield',
    description: 'Protects your streak from breaking once. Use wisely!',
    category: 'consumable',
    item_type: 'streak_protection',
    item_data: { uses: 1 },
    price_tokens: 50,
    is_premium: false,
    is_limited: false,
    stock: null,
    image_url: null,
  },
  {
    id: 'item-2',
    name: 'XP Booster',
    description: 'Double your XP gains for 24 hours.',
    category: 'consumable',
    item_type: 'xp_boost',
    item_data: { multiplier: 2, duration_hours: 24 },
    price_tokens: 100,
    is_premium: false,
    is_limited: false,
    stock: null,
    image_url: null,
  },
  {
    id: 'item-3',
    name: 'Golden Armor',
    description: 'A prestigious outfit that shows your dedication.',
    category: 'outfit',
    item_type: 'cosmetic',
    item_data: { outfit_id: 'golden_armor' },
    price_tokens: 500,
    is_premium: true,
    is_limited: false,
    stock: null,
    image_url: null,
  },
  {
    id: 'item-4',
    name: 'Phoenix Wings',
    description: 'Legendary accessory that symbolizes rebirth and persistence.',
    category: 'accessory',
    item_type: 'cosmetic',
    item_data: { accessory_id: 'phoenix_wings' },
    price_tokens: 750,
    is_premium: true,
    is_limited: true,
    stock: 100,
    image_url: null,
  },
  {
    id: 'item-5',
    name: 'Mystery Egg',
    description: 'Contains a random ally. Could be common or legendary!',
    category: 'ally',
    item_type: 'mystery_box',
    item_data: { possible_allies: ['ally-1', 'ally-2', 'ally-3', 'ally-4'] },
    price_tokens: 200,
    is_premium: false,
    is_limited: false,
    stock: null,
    image_url: null,
  },
  {
    id: 'item-6',
    name: 'Token Multiplier',
    description: '1.5x token gains for 48 hours.',
    category: 'consumable',
    item_type: 'token_boost',
    item_data: { multiplier: 1.5, duration_hours: 48 },
    price_tokens: 150,
    is_premium: false,
    is_limited: false,
    stock: null,
    image_url: null,
  },
];

export const useMomentumRealm = () => {
  const [profile, setProfile] = useState<MomentumProfile | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [allies, setAllies] = useState<Ally[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [monsters, setMonsters] = useState<ChaosMonster[]>([]);
  const [activeBattles, setActiveBattles] = useState<MonsterBattle[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [arTrees, setARTrees] = useState<ARTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Get image for ally
  const getAllyImage = (allyName: string) => ALLY_IMAGES[allyName] || ALLY_IMAGES['Spark'];
  
  // Get image for monster
  const getMonsterImage = (monsterName: string) => MONSTER_IMAGES[monsterName] || MONSTER_IMAGES['Procrastination Phantom'];
  
  // Get image for tree
  const getTreeImage = (treeType: string) => TREE_IMAGES[treeType] || TREE_IMAGES['oak'];

  // Calculate level from XP
  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP_REQUIREMENTS[i]) return i + 1;
    }
    return 1;
  };

  // Get XP progress to next level
  const getXPProgress = (xp: number, level: number): { current: number; required: number; percentage: number } => {
    const currentLevelXP = LEVEL_XP_REQUIREMENTS[level - 1] || 0;
    const nextLevelXP = LEVEL_XP_REQUIREMENTS[level] || LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
    const current = xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    return { current, required, percentage: Math.min((current / required) * 100, 100) };
  };

  // Initialize with demo data
  const initializeDemoMode = useCallback(() => {
    console.log('Initializing Momentum Realm in demo mode');
    setIsDemoMode(true);
    
    // Load saved profile from localStorage or use default
    const savedProfile = localStorage.getItem('momentum_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        setProfile({ ...DEMO_PROFILE });
      }
    } else {
      setProfile({ ...DEMO_PROFILE });
    }
    
    // Set static data first
    setChapters(DEMO_CHAPTERS);
    setAllies(DEMO_ALLIES);
    setQuests(DEMO_QUESTS);
    setMonsters(DEMO_MONSTERS);
    setShopItems(DEMO_SHOP_ITEMS);
    
    // Load saved user quests and reattach quest data
    const savedUserQuests = localStorage.getItem('momentum_user_quests');
    if (savedUserQuests) {
      try {
        const parsedQuests = JSON.parse(savedUserQuests) as UserQuest[];
        // Reattach quest data from DEMO_QUESTS
        const questsWithData = parsedQuests.map(uq => ({
          ...uq,
          quest: DEMO_QUESTS.find(q => q.id === uq.quest_id) || uq.quest
        }));
        setUserQuests(questsWithData);
      } catch {
        setUserQuests([]);
      }
    }
    
    // Load saved battles and reattach monster data
    const savedBattles = localStorage.getItem('momentum_battles');
    if (savedBattles) {
      try {
        const battles = JSON.parse(savedBattles) as MonsterBattle[];
        // Reattach monster data from DEMO_MONSTERS
        const battlesWithMonsters = battles.map((b: MonsterBattle) => ({
          ...b,
          monster: DEMO_MONSTERS.find(m => m.id === b.monster_id) || b.monster
        }));
        setActiveBattles(battlesWithMonsters);
      } catch {
        setActiveBattles([]);
      }
    }
    
    // Load saved trees
    const savedTrees = localStorage.getItem('momentum_trees');
    if (savedTrees) {
      try {
        setARTrees(JSON.parse(savedTrees));
      } catch {
        setARTrees([]);
      }
    }
    
    setLoading(false);
  }, []);

  // Save profile to localStorage
  const saveProfile = useCallback((newProfile: MomentumProfile) => {
    setProfile(newProfile);
    localStorage.setItem('momentum_profile', JSON.stringify(newProfile));
  }, []);

  // Save user quests to localStorage
  const saveUserQuests = useCallback((newQuests: UserQuest[]) => {
    setUserQuests(newQuests);
    localStorage.setItem('momentum_user_quests', JSON.stringify(newQuests));
  }, []);

  // Save battles to localStorage
  const saveBattles = useCallback((newBattles: MonsterBattle[]) => {
    setActiveBattles(newBattles);
    localStorage.setItem('momentum_battles', JSON.stringify(newBattles));
  }, []);

  // Save trees to localStorage
  const saveTrees = useCallback((newTrees: ARTree[]) => {
    setARTrees(newTrees);
    localStorage.setItem('momentum_trees', JSON.stringify(newTrees));
  }, []);

  // Fetch all game data
  const fetchGameData = useCallback(async () => {
    setLoading(true);
    
    // Check if we have an authenticated session first
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, go straight to demo mode
    if (!session) {
      console.log('No authenticated session, using demo mode');
      initializeDemoMode();
      return;
    }
    
    try {
      // Try to fetch from database first with a timeout
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 3000);
      });
      
      const queryPromise = supabase
        .from('story_chapters')
        .select('*')
        .order('chapter_number');
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data: chaptersData, error: chaptersError } = result;
      
      if (chaptersError || !chaptersData || chaptersData.length === 0) {
        // Fall back to demo mode
        console.log('Database query failed or empty, using demo mode');
        initializeDemoMode();
        return;
      }
      
      setChapters(chaptersData);

      // Fetch allies
      const { data: alliesData } = await supabase.from('allies').select('*');
      setAllies(alliesData?.length ? alliesData : DEMO_ALLIES);

      // Fetch quests
      const { data: questsData } = await supabase.from('quests').select('*').eq('is_active', true);
      setQuests(questsData?.length ? questsData : DEMO_QUESTS);

      // Fetch monsters
      const { data: monstersData } = await supabase.from('chaos_monsters').select('*');
      setMonsters(monstersData?.length ? monstersData : DEMO_MONSTERS);

      // Fetch shop items
      const { data: shopData } = await supabase.from('shop_items').select('*');
      setShopItems(shopData?.length ? shopData : DEMO_SHOP_ITEMS);

      // Fetch active battles
      const { data: battlesData } = await supabase
        .from('monster_battles')
        .select('*, monster:chaos_monsters(*)')
        .eq('status', 'active');
      if (battlesData) setActiveBattles(battlesData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching game data, using demo mode:', error);
      initializeDemoMode();
    }
  }, [initializeDemoMode]);

  // Fetch user-specific data
  const fetchUserData = useCallback(async (userId: string) => {
    if (isDemoMode) {
      // Already initialized in demo mode
      return;
    }
    
    try {
      // Fetch or create profile
      let { data: profileData, error } = await supabase
        .from('momentum_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profileData) {
        // Use demo profile
        setProfile({ ...DEMO_PROFILE, user_id: userId });
        return;
      }
      
      setProfile(profileData);

      // Fetch user quests
      const { data: userQuestsData } = await supabase
        .from('user_quests')
        .select('*, quest:quests(*)')
        .eq('user_id', userId)
        .in('status', ['active', 'completed']);
      if (userQuestsData) setUserQuests(userQuestsData);

      // Fetch AR trees
      const { data: treesData } = await supabase
        .from('ar_habit_trees')
        .select('*')
        .eq('user_id', userId);
      if (treesData) setARTrees(treesData);

    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfile({ ...DEMO_PROFILE, user_id: userId });
    }
  }, [isDemoMode]);

  // Update avatar
  const updateAvatar = async (updates: Partial<MomentumProfile>) => {
    if (!profile) return;
    
    if (isDemoMode) {
      const newProfile = { ...profile, ...updates };
      saveProfile(newProfile);
      return { data: newProfile, error: null };
    }
    
    const { data, error } = await supabase
      .from('momentum_profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  // Add experience and handle level ups
  const addExperience = async (amount: number) => {
    if (!profile) return;
    
    const newXP = profile.experience + amount;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > profile.level;
    
    const newProfile = {
      ...profile,
      experience: newXP,
      level: newLevel,
      momentum_tokens: leveledUp ? profile.momentum_tokens + (newLevel * 25) : profile.momentum_tokens
    };

    if (isDemoMode) {
      saveProfile(newProfile);
      if (leveledUp) {
        toast.success(`Level Up! You are now level ${newLevel}!`);
      }
      return { data: newProfile, error: null, leveledUp, newLevel };
    }
    
    const { data, error } = await supabase
      .from('momentum_profiles')
      .update(newProfile)
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      if (leveledUp) {
        toast.success(`Level Up! You are now level ${newLevel}!`);
      }
    }
    return { data, error, leveledUp, newLevel };
  };

  // Add tokens
  const addTokens = async (amount: number) => {
    if (!profile) return;
    
    const newProfile = { ...profile, momentum_tokens: profile.momentum_tokens + amount };
    
    if (isDemoMode) {
      saveProfile(newProfile);
      return { data: newProfile, error: null };
    }
    
    const { data, error } = await supabase
      .from('momentum_profiles')
      .update({ momentum_tokens: newProfile.momentum_tokens })
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  // Spend tokens
  const spendTokens = async (amount: number): Promise<boolean> => {
    if (!profile || profile.momentum_tokens < amount) return false;
    
    const newProfile = { ...profile, momentum_tokens: profile.momentum_tokens - amount };
    
    if (isDemoMode) {
      saveProfile(newProfile);
      return true;
    }
    
    const { error } = await supabase
      .from('momentum_profiles')
      .update({ momentum_tokens: newProfile.momentum_tokens })
      .eq('id', profile.id);

    if (!error) {
      setProfile(newProfile);
      return true;
    }
    return false;
  };

  // Start a quest
  const startQuest = async (questId: string) => {
    if (!profile) return;
    
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    // Check if already started
    const existing = userQuests.find(uq => uq.quest_id === questId && uq.status === 'active');
    if (existing) {
      toast.error('Quest already in progress!');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + quest.duration_hours);

    const newUserQuest: UserQuest = {
      id: `uq-${Date.now()}`,
      user_id: profile.user_id,
      quest_id: questId,
      status: 'active',
      progress: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      expires_at: expiresAt.toISOString(),
      quest: quest,
    };

    if (isDemoMode) {
      const newQuests = [...userQuests, newUserQuest];
      saveUserQuests(newQuests);
      toast.success('Quest started!');
      return { data: newUserQuest, error: null };
    }

    const { data, error } = await supabase
      .from('user_quests')
      .insert({
        user_id: profile.user_id,
        quest_id: questId,
        expires_at: expiresAt.toISOString()
      })
      .select('*, quest:quests(*)')
      .single();

    if (!error && data) {
      setUserQuests(prev => [...prev, data]);
      toast.success('Quest started!');
    }
    return { data, error };
  };

  // Update quest progress
  const updateQuestProgress = async (userQuestId: string, progress: number) => {
    const userQuest = userQuests.find(uq => uq.id === userQuestId);
    if (!userQuest || !userQuest.quest) return;

    const isCompleted = progress >= (userQuest.quest.requirements.count || 1);
    
    const updatedQuest: UserQuest = {
      ...userQuest,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? new Date().toISOString() : null,
    };

    if (isDemoMode) {
      const newQuests = userQuests.map(uq => uq.id === userQuestId ? updatedQuest : uq);
      saveUserQuests(newQuests);
      
      if (isCompleted && userQuest.quest) {
        await addExperience(userQuest.quest.rewards.experience);
        await addTokens(userQuest.quest.rewards.tokens);
        
        const newProfile = { 
          ...profile!, 
          total_quests_completed: (profile?.total_quests_completed || 0) + 1 
        };
        saveProfile(newProfile);
        toast.success('Quest completed! Rewards claimed.');
      }
      
      return { data: updatedQuest, error: null, isCompleted };
    }

    const { data, error } = await supabase
      .from('user_quests')
      .update({ 
        progress,
        status: isCompleted ? 'completed' : 'active',
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', userQuestId)
      .select('*, quest:quests(*)')
      .single();

    if (!error && data) {
      setUserQuests(prev => prev.map(uq => uq.id === userQuestId ? data : uq));
      
      if (isCompleted && userQuest.quest) {
        await addExperience(userQuest.quest.rewards.experience);
        await addTokens(userQuest.quest.rewards.tokens);
        
        await supabase
          .from('momentum_profiles')
          .update({ total_quests_completed: (profile?.total_quests_completed || 0) + 1 })
          .eq('id', profile?.id);
        
        toast.success('Quest completed! Rewards claimed.');
      }
    }
    return { data, error, isCompleted };
  };

  // Start a monster battle
  const startBattle = async (monsterId: string, teamId?: string) => {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster || !profile) return;

    // Check if already in battle with this monster
    const existing = activeBattles.find(b => b.monster_id === monsterId && b.status === 'active');
    if (existing) {
      toast.error('Already battling this monster!');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const newBattle: MonsterBattle = {
      id: `battle-${Date.now()}`,
      monster_id: monsterId,
      team_id: teamId || null,
      current_health: monster.health,
      max_health: monster.health,
      status: 'active',
      participants: [profile.user_id],
      damage_log: [],
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      monster: monster,
    };

    if (isDemoMode) {
      const newBattles = [...activeBattles, newBattle];
      saveBattles(newBattles);
      toast.success('Battle started! Complete habits to deal damage.');
      return { data: newBattle, error: null };
    }

    const { data, error } = await supabase
      .from('monster_battles')
      .insert({
        monster_id: monsterId,
        team_id: teamId || null,
        current_health: monster.health,
        max_health: monster.health,
        participants: [profile.user_id],
        expires_at: expiresAt.toISOString()
      })
      .select('*, monster:chaos_monsters(*)')
      .single();

    if (!error && data) {
      setActiveBattles(prev => [...prev, data]);
      toast.success('Battle started! Complete habits to deal damage.');
    }
    return { data, error };
  };

  // Deal damage to monster
  const dealDamage = async (battleId: string, damage: number) => {
    const battle = activeBattles.find(b => b.id === battleId);
    if (!battle || !profile) return;

    const newHealth = Math.max(0, battle.current_health - damage);
    const isDefeated = newHealth === 0;

    const damageEntry = {
      user_id: profile.user_id,
      damage,
      timestamp: new Date().toISOString()
    };

    const updatedBattle: MonsterBattle = {
      ...battle,
      current_health: newHealth,
      status: isDefeated ? 'completed' : 'active',
      damage_log: [...battle.damage_log, damageEntry],
    };

    if (isDemoMode) {
      const newBattles = isDefeated 
        ? activeBattles.filter(b => b.id !== battleId)
        : activeBattles.map(b => b.id === battleId ? updatedBattle : b);
      saveBattles(newBattles);

      if (isDefeated && battle.monster) {
        await addExperience(battle.monster.rewards.experience);
        await addTokens(battle.monster.rewards.tokens);
        
        const newProfile = { 
          ...profile, 
          total_monsters_defeated: (profile.total_monsters_defeated || 0) + 1 
        };
        saveProfile(newProfile);
        toast.success(`${battle.monster.name} defeated! +${battle.monster.rewards.tokens} tokens, +${battle.monster.rewards.experience} XP`);
      }

      return { data: updatedBattle, error: null, isDefeated };
    }

    const { data, error } = await supabase
      .from('monster_battles')
      .update({
        current_health: newHealth,
        status: isDefeated ? 'completed' : 'active',
        completed_at: isDefeated ? new Date().toISOString() : null,
        damage_log: [...battle.damage_log, damageEntry]
      })
      .eq('id', battleId)
      .select('*, monster:chaos_monsters(*)')
      .single();

    if (!error && data) {
      setActiveBattles(prev => 
        isDefeated 
          ? prev.filter(b => b.id !== battleId)
          : prev.map(b => b.id === battleId ? data : b)
      );

      if (isDefeated && battle.monster) {
        await addExperience(battle.monster.rewards.experience);
        await addTokens(battle.monster.rewards.tokens);
        
        await supabase
          .from('momentum_profiles')
          .update({ total_monsters_defeated: (profile.total_monsters_defeated || 0) + 1 })
          .eq('id', profile.id);
        
        toast.success(`${battle.monster.name} defeated! +${battle.monster.rewards.tokens} tokens, +${battle.monster.rewards.experience} XP`);
      }
    }
    return { data, error, isDefeated };
  };

  // Purchase shop item
  const purchaseItem = async (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || !profile) return { success: false, error: 'Item not found' };

    if (profile.momentum_tokens < item.price_tokens) {
      return { success: false, error: 'Not enough tokens' };
    }

    const success = await spendTokens(item.price_tokens);
    if (!success) return { success: false, error: 'Failed to spend tokens' };

    // Apply item effects
    if (item.category === 'outfit' && profile) {
      await updateAvatar({
        unlocked_outfits: [...profile.unlocked_outfits, item.item_data.outfit_id]
      });
    } else if (item.category === 'accessory' && profile) {
      await updateAvatar({
        unlocked_accessories: [...profile.unlocked_accessories, item.item_data.accessory_id]
      });
    }

    toast.success(`Purchased ${item.name}!`);
    return { success: true };
  };

  // Plant AR tree
  const plantTree = async (habitId: string, treeType: string = 'oak') => {
    if (!profile) return;

    const newTree: ARTree = {
      id: `tree-${Date.now()}`,
      user_id: profile.user_id,
      habit_id: habitId,
      tree_type: treeType,
      growth_stage: 1,
      total_waterings: 0,
      position: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      planted_at: new Date().toISOString(),
      last_watered: null,
    };

    if (isDemoMode) {
      const newTrees = [...arTrees, newTree];
      saveTrees(newTrees);
      
      const newProfile = { ...profile, ar_trees_planted: profile.ar_trees_planted + 1 };
      saveProfile(newProfile);
      
      toast.success('Tree planted in your AR garden!');
      return { data: newTree, error: null };
    }

    const { data, error } = await supabase
      .from('ar_habit_trees')
      .insert({
        user_id: profile.user_id,
        habit_id: habitId,
        tree_type: treeType,
        position: newTree.position
      })
      .select()
      .single();

    if (!error && data) {
      setARTrees(prev => [...prev, data]);
      await supabase
        .from('momentum_profiles')
        .update({ ar_trees_planted: profile.ar_trees_planted + 1 })
        .eq('id', profile.id);
      toast.success('Tree planted in your AR garden!');
    }
    return { data, error };
  };

  // Water AR tree
  const waterTree = async (treeId: string) => {
    const tree = arTrees.find(t => t.id === treeId);
    if (!tree) return;

    const newWaterings = tree.total_waterings + 1;
    const newStage = Math.min(5, Math.floor(newWaterings / 5) + 1);

    const updatedTree: ARTree = {
      ...tree,
      total_waterings: newWaterings,
      growth_stage: newStage,
      last_watered: new Date().toISOString(),
    };

    if (isDemoMode) {
      const newTrees = arTrees.map(t => t.id === treeId ? updatedTree : t);
      saveTrees(newTrees);
      
      if (newStage > tree.growth_stage) {
        toast.success(`Tree grew to stage ${newStage}!`);
      } else {
        toast.success('Tree watered!');
      }
      return { data: updatedTree, error: null };
    }

    const { data, error } = await supabase
      .from('ar_habit_trees')
      .update({
        total_waterings: newWaterings,
        growth_stage: newStage,
        last_watered: new Date().toISOString()
      })
      .eq('id', treeId)
      .select()
      .single();

    if (!error && data) {
      setARTrees(prev => prev.map(t => t.id === treeId ? data : t));
      if (newStage > tree.growth_stage) {
        toast.success(`Tree grew to stage ${newStage}!`);
      } else {
        toast.success('Tree watered!');
      }
    }
    return { data, error };
  };

  // Spin ritual roulette
  const spinRoulette = async (): Promise<RouletteReward | null> => {
    if (!profile) return null;
    
    // Check if can spin
    const lastSpin = profile.last_roulette_spin ? new Date(profile.last_roulette_spin) : null;
    const now = new Date();
    const hoursSinceLastSpin = lastSpin ? (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60) : 25;
    const canSpin = hoursSinceLastSpin > 24 || profile.daily_roulette_spins > 0;
    
    if (!canSpin) {
      toast.error('Come back tomorrow for your daily spin!');
      return null;
    }

    setIsSpinning(true);

    // Weighted random selection
    const weights = ROULETTE_REWARDS.map(r => {
      switch (r.rarity) {
        case 'common': return 40;
        case 'uncommon': return 25;
        case 'rare': return 20;
        case 'epic': return 12;
        case 'legendary': return 3;
        default: return 10;
      }
    });
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedReward = ROULETTE_REWARDS[0];
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedReward = ROULETTE_REWARDS[i];
        break;
      }
    }

    // Simulate spin delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Apply reward
    if (selectedReward.type === 'tokens') {
      await addTokens(selectedReward.value);
    } else if (selectedReward.type === 'experience') {
      await addExperience(selectedReward.value);
    }

    // Update spin tracking
    const newProfile = {
      ...profile,
      last_roulette_spin: now.toISOString(),
      daily_roulette_spins: Math.max(0, profile.daily_roulette_spins - 1)
    };

    if (isDemoMode) {
      saveProfile(newProfile);
    } else {
      await supabase
        .from('momentum_profiles')
        .update({
          last_roulette_spin: now.toISOString(),
          daily_roulette_spins: Math.max(0, profile.daily_roulette_spins - 1)
        })
        .eq('id', profile.id);
    }

    setIsSpinning(false);
    toast.success(`You won: ${selectedReward.label}!`);
    return selectedReward;
  };

  // Check if can spin roulette
  const canSpinRoulette = (): boolean => {
    if (!profile) return false;
    const lastSpin = profile.last_roulette_spin ? new Date(profile.last_roulette_spin) : null;
    const now = new Date();
    const hoursSinceLastSpin = lastSpin ? (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60) : 25;
    return hoursSinceLastSpin > 24 || profile.daily_roulette_spins > 0;
  };

  // Unlock ally
  const unlockAlly = async (allyId: string) => {
    if (!profile || profile.unlocked_allies.includes(allyId)) return;

    const newProfile = {
      ...profile,
      unlocked_allies: [...profile.unlocked_allies, allyId]
    };

    if (isDemoMode) {
      saveProfile(newProfile);
      const ally = allies.find(a => a.id === allyId);
      toast.success(`Unlocked ${ally?.name || 'new ally'}!`);
      return { data: newProfile, error: null };
    }

    const { data, error } = await supabase
      .from('momentum_profiles')
      .update({
        unlocked_allies: [...profile.unlocked_allies, allyId]
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      const ally = allies.find(a => a.id === allyId);
      toast.success(`Unlocked ${ally?.name || 'new ally'}!`);
    }
    return { data, error };
  };

  // Set active ally
  const setActiveAlly = async (allyId: string | null) => {
    if (!profile) return;

    const newProfile = { ...profile, current_ally_id: allyId };

    if (isDemoMode) {
      saveProfile(newProfile);
      const ally = allies.find(a => a.id === allyId);
      toast.success(`${ally?.name || 'Ally'} is now active!`);
      return { data: newProfile, error: null };
    }

    const { data, error } = await supabase
      .from('momentum_profiles')
      .update({ current_ally_id: allyId })
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      const ally = allies.find(a => a.id === allyId);
      toast.success(`${ally?.name || 'Ally'} is now active!`);
    }
    return { data, error };
  };

  // Get current ally
  const getCurrentAlly = (): Ally | null => {
    if (!profile?.current_ally_id) return null;
    return allies.find(a => a.id === profile.current_ally_id) || null;
  };

  // Initialize
  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  return {
    // State
    profile,
    chapters,
    allies,
    quests,
    userQuests,
    monsters,
    activeBattles,
    shopItems,
    arTrees,
    loading,
    isSpinning,
    isDemoMode,
    
    // Helper functions
    getAllyImage,
    getMonsterImage,
    getTreeImage,
    calculateLevel,
    getXPProgress,
    canSpinRoulette,
    getCurrentAlly,
    
    // Actions
    fetchUserData,
    updateAvatar,
    addExperience,
    addTokens,
    spendTokens,
    startQuest,
    updateQuestProgress,
    startBattle,
    dealDamage,
    purchaseItem,
    plantTree,
    waterTree,
    spinRoulette,
    unlockAlly,
    setActiveAlly,
    
    // Constants
    ROULETTE_REWARDS,
    LEVEL_XP_REQUIREMENTS,
  };
};
