/**
 * CONTENT ARCHITECTURE - TEA TIME NETWORK
 * 
 * This is the spine of the application.
 * All content flows through this architecture.
 * Everything else (notes, challenges, workbooks) attaches to this.
 * 
 * Non-negotiable principles:
 * - Content is easy to revisit
 * - Content is easy to locate by purpose
 * - Content is structured for long-term reuse
 * - Content is independent of algorithms
 */

// ============================================================================
// SHOW TYPES
// ============================================================================

export type ShowId = 'tea-time-cj' | 'motivation-court' | 'confession-court' | 'sunday-power-hour';

export interface Show {
  id: ShowId;
  title: string;
  description: string;
  baseColor: string; // Hex color for show identity
  secondaryColor: string;
  icon: string; // Icon/emoji identifier
  schedule: string; // e.g., "Tuesdays 6pm CST"
  hostName: string;
  hostBio?: string;
  episodeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EPISODE TYPES (ATOMIC UNIT)
// ============================================================================

export type AccessLevel = 'free' | 'locked';
export type ContentTag = 
  | 'discipline'
  | 'boundaries'
  | 'identity'
  | 'mindset'
  | 'relationships'
  | 'selfcare'
  | 'productivity'
  | 'confidence'
  | 'purpose'
  | 'habit-building';

export interface Episode {
  // Primary Keys
  id: string; // Unique episode ID
  showId: ShowId; // Which show this belongs to
  
  // Core Metadata
  title: string;
  description: string; // Plain, grounded description of episode purpose
  airDate: Date;
  durationSeconds: number; // Duration in seconds
  
  // Access Control
  accessLevel: AccessLevel; // 'free' or 'locked'
  
  // Indexing & Discovery
  tags: ContentTag[]; // Functional tags, not aesthetic
  episodeNumber?: number; // Sequential number within show
  season?: number;
  
  // Content Storage
  replayUrl?: string; // Full-length replay only, no highlights
  transcriptUrl?: string;
  
  // Playback State (user-specific, stored separately)
  // watchedSeconds?: number;
  // completionPercentage?: number;
  // isWatched?: boolean;
  
  // Attachments (stored separately, referenced by ID)
  attachedNoteIds: string[];
  attachedChallengeIds: string[];
  attachedWorkbookIds: string[];
  reflectionPromptIds: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  visibility: 'public' | 'draft' | 'archived';
}

// ============================================================================
// ATTACHMENT TYPES (ATTACH TO EPISODES)
// ============================================================================

export interface TeaTimeNote {
  id: string;
  episodeId: string;
  title: string;
  content: string;
  author: string; // CJ or guest
  createdAt: Date;
  updatedAt: Date;
  visibility: 'public' | 'private';
}

export interface Challenge {
  id: string;
  episodeId: string;
  title: string;
  description: string;
  duration: string; // e.g., "7 days", "14 days", "30 days"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkbookLink {
  id: string;
  episodeId: string;
  title: string;
  description: string;
  url: string;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReflectionPrompt {
  id: string;
  episodeId: string;
  prompt: string;
  guidance?: string;
  createdAt: Date;
}

// ============================================================================
// PLAYBACK STATE (USER-SPECIFIC, SEPARATE FROM EPISODE)
// ============================================================================

export interface EpisodePlaybackState {
  userId: string;
  episodeId: string;
  watchedSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;
  lastWatchedAt: Date;
  resumePosition: number; // For "resume where you left off"
}

// ============================================================================
// CONTENT ROUTING & NAVIGATION
// ============================================================================

export interface ShowBrowseView {
  show: Show;
  episodes: Episode[]; // All episodes for this show
  nextEpisodeToResume?: Episode & { playbackState: EpisodePlaybackState };
  totalEpisodes: number;
  lastUpdated: Date;
}

export interface EpisodeBrowseView {
  episode: Episode;
  attachedNotes: TeaTimeNote[];
  attachedChallenges: Challenge[];
  attachedWorkbooks: WorkbookLink[];
  reflectionPrompts: ReflectionPrompt[];
  nextEpisodeInShow?: Episode;
  previousEpisodeInShow?: Episode;
  playbackState?: EpisodePlaybackState;
}

// ============================================================================
// SHOW REGISTRY (LOCKED - NO NEW SHOWS WITHOUT CODE)
// ============================================================================

export const CANONICAL_SHOWS: Record<ShowId, Show> = {
  'tea-time-cj': {
    id: 'tea-time-cj',
    title: 'Tea Time with CJ',
    description: 'Weekly conversations about discipline, boundaries, and intentional living',
    baseColor: '#7C9885',
    secondaryColor: '#F4A460',
    icon: '🍵',
    schedule: 'Tuesdays 6pm CST',
    hostName: 'CJ Adisa',
    hostBio: 'Founder of Tea Time Network',
    episodeCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  'motivation-court': {
    id: 'motivation-court',
    title: 'Motivation Court',
    description: 'Real-time motivation, accountability, and action-oriented advice',
    baseColor: '#5a7a64',
    secondaryColor: '#FFD700',
    icon: '⚖️',
    schedule: 'Mondays 6pm CST',
    hostName: 'CJ Adisa',
    episodeCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  'confession-court': {
    id: 'confession-court',
    title: 'Confession Court',
    description: 'Honest conversations about the hard things',
    baseColor: '#8B4513',
    secondaryColor: '#FFB6C1',
    icon: '🎭',
    schedule: 'Saturdays 6pm CST',
    hostName: 'CJ Adisa',
    episodeCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  'sunday-power-hour': {
    id: 'sunday-power-hour',
    title: 'Sunday Power Hour',
    description: 'Start your week with intention, strategy, and momentum',
    baseColor: '#FFD700',
    secondaryColor: '#7C9885',
    icon: '⚡',
    schedule: 'Sundays 6pm CST',
    hostName: 'CJ Adisa',
    episodeCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
};

// ============================================================================
// CONTENT TAG DEFINITIONS (FUNCTIONAL, NOT AESTHETIC)
// ============================================================================

export const CONTENT_TAG_DEFINITIONS: Record<ContentTag, string> = {
  'discipline': 'Content focused on building discipline and consistency',
  'boundaries': 'Content about setting and maintaining boundaries',
  'identity': 'Content exploring identity and self-understanding',
  'mindset': 'Content about mental frameworks and perspectives',
  'relationships': 'Content about relationships and connection',
  'selfcare': 'Content about self-care and wellbeing',
  'productivity': 'Content about productivity and effectiveness',
  'confidence': 'Content building confidence and self-belief',
  'purpose': 'Content exploring purpose and direction',
  'habit-building': 'Content about building and breaking habits',
};

// ============================================================================
// CONTENT DUPLICATION PREVENTION
// ============================================================================

/**
 * Rules to prevent content duplication:
 * 
 * 1. Each episode is atomic - never duplicate episode data across shows
 * 2. Attachments (notes, challenges, workbooks) are created once and linked
 * 3. Replay URLs are stored once, no duplicate files
 * 4. Tags are functional references, not stored with every episode copy
 * 5. Playback state is user-specific and never duplicated
 */

// ============================================================================
// FUTURE-PROOFING SCHEMA
// ============================================================================

/**
 * This architecture supports future additions WITHOUT schema changes:
 * 
 * COURSES: Can extend Episode with courseId, lessonNumber, courseProgress
 * CERTIFICATIONS: Can add certificate requirements to Challenges
 * EVENTS: Can create Event type with eventDate, episodeId reference
 * ARCHIVES: Can add Archive collection type with episodeIds array
 * 
 * All future content types follow the same pattern:
 * 1. Define type interface
 * 2. Link to Episode via episodeId
 * 3. Store independently from Episode
 * 4. Reference by ID, never duplicate
 */

// ============================================================================
// REPLAY RULES (NON-NEGOTIABLE)
// ============================================================================

/**
 * Replay Behavior:
 * 
 * ✓ Full-length only (no highlights, no clips)
 * ✓ No autoplay on entry (intentional viewing)
 * ✓ Manual play button click required
 * ✓ Resume from where user left off
 * ✓ Clear episode context shown before playback
 * ✓ Transcript/notes accessible during playback
 * 
 * Purpose: Replays are reference tools, not entertainment loops
 */

// ============================================================================
// NAVIGATION RULES (CLEAR & CALM)
// ============================================================================

/**
 * Navigation must support:
 * 
 * 1. Browse by Show
 *    → User sees all episodes for a show
 *    → Clear metadata and purpose for each
 *    → Ability to resume where they left off
 * 
 * 2. Browse by Episode
 *    → Episode detail page with context
 *    → Attached notes/challenges/workbooks visible
 *    → Reflection prompts for deeper engagement
 * 
 * 3. Resume Functionality
 *    → "Continue watching" from exact timestamp
 *    → No data loss on app refresh
 *    → Clear indicator of progress
 * 
 * 4. Context-First Design
 *    → "What is this episode for?" answered upfront
 *    → Visual identity tied to show
 *    → No infinite scroll or feed behavior
 *    → Calm, intentional interface
 */

// ============================================================================
// DATA ACCESS PATTERNS
// ============================================================================

/**
 * Developer can:
 * 
 * 1. Add new episode without code rewrite
 *    → Just populate Episode interface
 *    → Hook into existing routing
 *    → Done
 * 
 * 2. Attach notes/challenges cleanly
 *    → Create attachment with episodeId reference
 *    → No duplication or merging needed
 *    → Query by episodeId to fetch
 * 
 * 3. Reuse episode data across screens
 *    → Episode type is immutable reference
 *    → Use showId for show context
 *    → Use episodeId for attachments
 * 
 * 4. Enforce access rules consistently
 *    → Check episode.accessLevel in one place
 *    → All screens use same validation
 *    → RLS policies match episode.accessLevel
 */

// ============================================================================
// VALIDATION & CONSISTENCY RULES
// ============================================================================

export function validateEpisode(episode: Episode): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!episode.id) errors.push('Episode ID is required');
  if (!episode.showId) errors.push('Show ID is required');
  if (!episode.title || episode.title.trim().length === 0) errors.push('Episode title is required');
  if (!episode.description || episode.description.trim().length === 0) errors.push('Episode description is required');
  if (!episode.airDate) errors.push('Air date is required');
  if (episode.durationSeconds <= 0) errors.push('Duration must be positive');
  if (!['free', 'locked'].includes(episode.accessLevel)) errors.push('Invalid access level');

  // Show must exist in registry
  if (!Object.keys(CANONICAL_SHOWS).includes(episode.showId)) {
    errors.push(`Show ${episode.showId} not found in canonical shows`);
  }

  // Tags must be valid
  for (const tag of episode.tags) {
    if (!Object.keys(CONTENT_TAG_DEFINITIONS).includes(tag)) {
      errors.push(`Invalid tag: ${tag}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateShow(show: Show): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!show.id || !Object.keys(CANONICAL_SHOWS).includes(show.id)) {
    errors.push('Show must be from canonical shows registry');
  }
  if (!show.title) errors.push('Show title is required');
  if (!show.description) errors.push('Show description is required');
  if (!show.baseColor) errors.push('Base color is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}
