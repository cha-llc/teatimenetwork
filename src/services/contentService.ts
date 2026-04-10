/**
 * CONTENT SERVICE - TEA TIME NETWORK
 * 
 * Core service for content management and retrieval.
 * Single source of truth for all episode, show, and attachment data.
 * 
 * Rules:
 * - No data duplication
 * - All queries go through this service
 * - Access control enforced at service level
 * - Caching transparent to caller
 */

import {
  Show,
  ShowId,
  Episode,
  EpisodePlaybackState,
  TeaTimeNote,
  Challenge,
  WorkbookLink,
  ReflectionPrompt,
  ShowBrowseView,
  EpisodeBrowseView,
  CANONICAL_SHOWS,
  validateEpisode,
  validateShow,
} from '../lib/contentArchitecture';

// ============================================================================
// SHOW QUERIES
// ============================================================================

export async function getShow(showId: ShowId): Promise<Show | null> {
  /**
   * Returns show metadata.
   * Shows are immutable (no code changes needed to add new shows).
   * Shows live in CANONICAL_SHOWS registry.
   */
  try {
    return CANONICAL_SHOWS[showId] || null;
  } catch (error) {
    console.error(`Error fetching show ${showId}:`, error);
    return null;
  }
}

export async function getAllShows(): Promise<Show[]> {
  /**
   * Returns all canonical shows in order.
   * Used for show selection/browsing.
   */
  try {
    return Object.values(CANONICAL_SHOWS);
  } catch (error) {
    console.error('Error fetching all shows:', error);
    return [];
  }
}

// ============================================================================
// EPISODE QUERIES (PRIMARY OPERATIONS)
// ============================================================================

export async function getEpisode(episodeId: string): Promise<Episode | null> {
  /**
   * Get single episode by ID.
   * Returns full episode metadata + attachment IDs.
   * Does NOT return attachment content (fetch separately).
   * 
   * Called by:
   * - EpisodeDetail page
   * - Resume where left off
   * - Next/previous navigation
   */
  try {
    // TODO: Query from Supabase episodes table
    // SELECT * FROM episodes WHERE id = episodeId
    return null;
  } catch (error) {
    console.error(`Error fetching episode ${episodeId}:`, error);
    return null;
  }
}

export async function getEpisodesByShow(showId: ShowId): Promise<Episode[]> {
  /**
   * Get all episodes for a specific show.
   * Ordered by air date (newest first).
   * 
   * Called by:
   * - ShowBrowse page
   * - Show replay section
   * - User dashboard (show context)
   * 
   * Returns full Episode objects but NOT attachment content.
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM episodes WHERE showId = showId ORDER BY airDate DESC
    return [];
  } catch (error) {
    console.error(`Error fetching episodes for show ${showId}:`, error);
    return [];
  }
}

export async function getEpisodesByTag(tag: string): Promise<Episode[]> {
  /**
   * Get episodes by functional tag (discipline, boundaries, etc.)
   * Used for discovery and filtering.
   * 
   * Called by:
   * - Search/filter interface
   * - Content recommendations
   * - Category browsing
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM episodes WHERE tags @> [tag]
    return [];
  } catch (error) {
    console.error(`Error fetching episodes by tag ${tag}:`, error);
    return [];
  }
}

export async function getEpisodeBatch(episodeIds: string[]): Promise<Episode[]> {
  /**
   * Get multiple episodes efficiently.
   * Used when you need episode metadata for many episodes at once.
   * 
   * Called by:
   * - Dashboard showing recent episodes
   * - User's watch history
   * - Content recommendations
   */
  try {
    if (episodeIds.length === 0) return [];
    // TODO: Query from Supabase
    // SELECT * FROM episodes WHERE id IN (episodeIds)
    return [];
  } catch (error) {
    console.error('Error fetching episode batch:', error);
    return [];
  }
}

// ============================================================================
// CONTENT ROUTING & NAVIGATION
// ============================================================================

export async function getShowBrowseView(showId: ShowId, userId?: string): Promise<ShowBrowseView | null> {
  /**
   * Get complete view for "Browse by Show" experience.
   * 
   * Returns:
   * - Show metadata
   * - All episodes for show
   * - Next episode to resume (if userId provided)
   * - Episode count and last updated
   * 
   * Called by:
   * - ShowBrowse page
   * - Show detail view
   */
  try {
    const show = await getShow(showId);
    if (!show) return null;

    const episodes = await getEpisodesByShow(showId);

    let nextEpisodeToResume: (Episode & { playbackState: EpisodePlaybackState }) | undefined;
    if (userId) {
      // Find last watched episode
      const playbackStates = await getUserPlaybackStates(userId, episodeIds);
      const watchedEpisodes = episodes.filter(e => 
        playbackStates.some(ps => ps.episodeId === e.id && ps.completionPercentage < 100)
      );
      
      if (watchedEpisodes.length > 0) {
        const lastWatched = watchedEpisodes.sort((a, b) => b.airDate.getTime() - a.airDate.getTime())[0];
        const playbackState = playbackStates.find(ps => ps.episodeId === lastWatched.id)!;
        nextEpisodeToResume = { ...lastWatched, playbackState };
      }
    }

    return {
      show,
      episodes,
      nextEpisodeToResume,
      totalEpisodes: episodes.length,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`Error getting show browse view for ${showId}:`, error);
    return null;
  }
}

export async function getEpisodeBrowseView(episodeId: string, userId?: string): Promise<EpisodeBrowseView | null> {
  /**
   * Get complete view for "Browse by Episode" experience.
   * 
   * Returns:
   * - Episode metadata
   * - All attached content (notes, challenges, workbooks, prompts)
   * - Navigation (next/previous in show)
   * - User's playback state (if userId provided)
   * 
   * Called by:
   * - EpisodeDetail page
   * - Content attachment screens
   */
  try {
    const episode = await getEpisode(episodeId);
    if (!episode) return null;

    // Fetch all attached content in parallel
    const [notes, challenges, workbooks, reflectionPrompts, playbackState] = await Promise.all([
      getTeaTimeNotesByEpisode(episodeId),
      getChallengesByEpisode(episodeId),
      getWorkbooksByEpisode(episodeId),
      getReflectionPromptsByEpisode(episodeId),
      userId ? getPlaybackState(userId, episodeId) : Promise.resolve(undefined),
    ]);

    // Get next/previous episodes in same show
    const showEpisodes = await getEpisodesByShow(episode.showId);
    const currentIndex = showEpisodes.findIndex(e => e.id === episodeId);
    const nextEpisodeInShow = currentIndex < showEpisodes.length - 1 ? showEpisodes[currentIndex + 1] : undefined;
    const previousEpisodeInShow = currentIndex > 0 ? showEpisodes[currentIndex - 1] : undefined;

    return {
      episode,
      attachedNotes: notes,
      attachedChallenges: challenges,
      attachedWorkbooks: workbooks,
      reflectionPrompts,
      nextEpisodeInShow,
      previousEpisodeInShow,
      playbackState,
    };
  } catch (error) {
    console.error(`Error getting episode browse view for ${episodeId}:`, error);
    return null;
  }
}

// ============================================================================
// ATTACHMENT QUERIES
// ============================================================================

export async function getTeaTimeNotesByEpisode(episodeId: string): Promise<TeaTimeNote[]> {
  /**
   * Get all notes attached to an episode.
   * Notes are created independently and linked to episodes.
   * No duplication - each note has one episodeId.
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM tea_time_notes WHERE episodeId = episodeId
    return [];
  } catch (error) {
    console.error(`Error fetching notes for episode ${episodeId}:`, error);
    return [];
  }
}

export async function getChallengesByEpisode(episodeId: string): Promise<Challenge[]> {
  /**
   * Get all challenges attached to an episode.
   * Challenges are created independently and linked to episodes.
   * No duplication - each challenge has one episodeId.
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM challenges WHERE episodeId = episodeId
    return [];
  } catch (error) {
    console.error(`Error fetching challenges for episode ${episodeId}:`, error);
    return [];
  }
}

export async function getWorkbooksByEpisode(episodeId: string): Promise<WorkbookLink[]> {
  /**
   * Get all workbooks attached to an episode.
   * Workbooks are external links stored independently.
   * No duplication - each workbook has one episodeId.
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM workbook_links WHERE episodeId = episodeId
    return [];
  } catch (error) {
    console.error(`Error fetching workbooks for episode ${episodeId}:`, error);
    return [];
  }
}

export async function getReflectionPromptsByEpisode(episodeId: string): Promise<ReflectionPrompt[]> {
  /**
   * Get all reflection prompts attached to an episode.
   * Prompts are created independently and linked to episodes.
   * No duplication - each prompt has one episodeId.
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM reflection_prompts WHERE episodeId = episodeId
    return [];
  } catch (error) {
    console.error(`Error fetching reflection prompts for episode ${episodeId}:`, error);
    return [];
  }
}

// ============================================================================
// PLAYBACK STATE QUERIES (USER-SPECIFIC)
// ============================================================================

export async function getPlaybackState(userId: string, episodeId: string): Promise<EpisodePlaybackState | null> {
  /**
   * Get user's playback state for a specific episode.
   * Used for "resume where you left off" functionality.
   * 
   * Stored separately from Episode to avoid duplication.
   * Each user has their own playback state per episode.
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM episode_playback_state 
    // WHERE userId = userId AND episodeId = episodeId
    return null;
  } catch (error) {
    console.error(`Error fetching playback state for ${userId}/${episodeId}:`, error);
    return null;
  }
}

export async function getUserPlaybackStates(userId: string, episodeIds?: string[]): Promise<EpisodePlaybackState[]> {
  /**
   * Get all playback states for a user.
   * If episodeIds provided, filter to those episodes.
   * 
   * Used for:
   * - Dashboard showing watch history
   * - Finding "continue watching" next episode
   * - Progress tracking
   */
  try {
    // TODO: Query from Supabase
    // SELECT * FROM episode_playback_state 
    // WHERE userId = userId [AND episodeId IN (episodeIds)]
    return [];
  } catch (error) {
    console.error('Error fetching user playback states:', error);
    return [];
  }
}

export async function savePlaybackState(state: EpisodePlaybackState): Promise<boolean> {
  /**
   * Save or update user's playback state.
   * Called during/after episode playback.
   * 
   * Triggers:
   * - Every 10 seconds during playback (or on pause)
   * - When episode is completed
   * - When user navigates away
   */
  try {
    // Validate
    if (!state.userId || !state.episodeId) {
      console.error('Invalid playback state: missing userId or episodeId');
      return false;
    }

    if (state.completionPercentage < 0 || state.completionPercentage > 100) {
      console.error('Invalid completion percentage');
      return false;
    }

    // TODO: Upsert to Supabase
    // INSERT INTO episode_playback_state (userId, episodeId, ...) 
    // VALUES (...) 
    // ON CONFLICT(userId, episodeId) DO UPDATE SET ...
    
    return true;
  } catch (error) {
    console.error('Error saving playback state:', error);
    return false;
  }
}

// ============================================================================
// ADMIN OPERATIONS (CREATE/UPDATE/DELETE)
// ============================================================================

export async function createEpisode(episode: Episode): Promise<{ success: boolean; episodeId?: string; error?: string }> {
  /**
   * Create a new episode.
   * Validates against Episode schema.
   * 
   * Can be called without code changes.
   * Just pass in populated Episode object.
   */
  try {
    const validation = validateEpisode(episode);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // TODO: Insert into Supabase
    // INSERT INTO episodes VALUES (...)
    
    return {
      success: true,
      episodeId: episode.id,
    };
  } catch (error) {
    console.error('Error creating episode:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateEpisode(episodeId: string, updates: Partial<Episode>): Promise<{ success: boolean; error?: string }> {
  /**
   * Update an existing episode.
   * Only allows updating specific fields (no schema changes).
   */
  try {
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return { success: false, error: 'Episode not found' };
    }

    const updated = { ...episode, ...updates };
    const validation = validateEpisode(updated);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // TODO: Update in Supabase
    // UPDATE episodes SET ... WHERE id = episodeId
    
    return { success: true };
  } catch (error) {
    console.error('Error updating episode:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function attachNoteToEpisode(episodeId: string, note: TeaTimeNote): Promise<{ success: boolean; error?: string }> {
  /**
   * Attach a note to an episode.
   * Note is created independently, then linked via episodeId.
   * No duplication - note has exactly one episodeId.
   */
  try {
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return { success: false, error: 'Episode not found' };
    }

    // TODO: Create note in Supabase
    // INSERT INTO tea_time_notes VALUES (...)
    
    // TODO: Update episode's attachedNoteIds
    // UPDATE episodes SET attachedNoteIds = array_append(...) WHERE id = episodeId
    
    return { success: true };
  } catch (error) {
    console.error('Error attaching note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Similar functions for attaching challenges, workbooks, prompts...

// ============================================================================
// ACCESS CONTROL (INTEGRATED WITH SERVICE)
// ============================================================================

export async function getAccessibleEpisodes(userId: string, userSubscriptionStatus: 'free' | 'active' | 'expired'): Promise<Episode[]> {
  /**
   * Get all episodes accessible to a user based on subscription.
   * 
   * Free users: only episodes with accessLevel = 'free'
   * Active subscribers: all episodes
   * Expired: free episodes only
   * 
   * Called by:
   * - Dashboard
   * - Browse views
   * - Search results
   */
  try {
    const allEpisodes = await Promise.all(
      Object.keys(CANONICAL_SHOWS).map(showId => getEpisodesByShow(showId as ShowId))
    ).then(results => results.flat());

    // Filter by access level
    if (userSubscriptionStatus === 'active') {
      return allEpisodes;
    }

    return allEpisodes.filter(episode => episode.accessLevel === 'free');
  } catch (error) {
    console.error('Error getting accessible episodes:', error);
    return [];
  }
}

// ============================================================================
// SEARCH & DISCOVERY (NON-ALGORITHMIC)
// ============================================================================

export async function searchEpisodes(query: string): Promise<Episode[]> {
  /**
   * Search episodes by title or description.
   * Non-algorithmic - exact term matching.
   * Returns episodes by air date (most recent first).
   * 
   * Called by:
   * - Search interface
   * - Content discovery
   */
  try {
    // TODO: Full-text search in Supabase
    // SELECT * FROM episodes 
    // WHERE title ILIKE '%' || query || '%' 
    // OR description ILIKE '%' || query || '%'
    // ORDER BY airDate DESC
    return [];
  } catch (error) {
    console.error('Error searching episodes:', error);
    return [];
  }
}

// ============================================================================
// STATISTICS & METADATA
// ============================================================================

export async function getContentStats(): Promise<{
  totalShows: number;
  totalEpisodes: number;
  totalNotes: number;
  totalChallenges: number;
  episodesByShow: Record<ShowId, number>;
}> {
  /**
   * Get overall content statistics.
   * Used for admin dashboard and analytics.
   */
  try {
    const shows = await getAllShows();
    const episodesByShow: Record<ShowId, number> = {} as any;
    let totalEpisodes = 0;

    for (const show of shows) {
      const episodes = await getEpisodesByShow(show.id);
      episodesByShow[show.id] = episodes.length;
      totalEpisodes += episodes.length;
    }

    return {
      totalShows: shows.length,
      totalEpisodes,
      totalNotes: 0, // TODO: Count from DB
      totalChallenges: 0, // TODO: Count from DB
      episodesByShow,
    };
  } catch (error) {
    console.error('Error getting content stats:', error);
    return {
      totalShows: 0,
      totalEpisodes: 0,
      totalNotes: 0,
      totalChallenges: 0,
      episodesByShow: {},
    };
  }
}

export default {
  getShow,
  getAllShows,
  getEpisode,
  getEpisodesByShow,
  getEpisodesByTag,
  getEpisodeBatch,
  getShowBrowseView,
  getEpisodeBrowseView,
  getTeaTimeNotesByEpisode,
  getChallengesByEpisode,
  getWorkbooksByEpisode,
  getReflectionPromptsByEpisode,
  getPlaybackState,
  getUserPlaybackStates,
  savePlaybackState,
  createEpisode,
  updateEpisode,
  attachNoteToEpisode,
  getAccessibleEpisodes,
  searchEpisodes,
  getContentStats,
};
