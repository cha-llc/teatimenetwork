/**
 * CONTENT HOOKS - TEA TIME NETWORK
 * 
 * Custom React hooks for easy integration of content architecture.
 * Handles data fetching, caching, and state management.
 * 
 * Usage:
 * const { episodes, loading } = useShowEpisodes('tea-time-cj');
 * const { episode, attachments } = useEpisodeDetail(episodeId);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
} from '../lib/contentArchitecture';
import contentService from '../services/contentService';

// ============================================================================
// SHOW HOOKS
// ============================================================================

/**
 * useShow
 * 
 * Fetch a single show by ID.
 * 
 * Usage:
 * const { show, loading, error } = useShow('tea-time-cj');
 */
export function useShow(showId: ShowId) {
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true);
        const result = await contentService.getShow(showId);
        setShow(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchShow();
  }, [showId]);

  return { show, loading, error };
}

/**
 * useAllShows
 * 
 * Fetch all canonical shows.
 * 
 * Usage:
 * const { shows, loading, error } = useAllShows();
 */
export function useAllShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchShows = async () => {
      try {
        setLoading(true);
        const result = await contentService.getAllShows();
        setShows(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  return { shows, loading, error };
}

// ============================================================================
// EPISODE HOOKS
// ============================================================================

/**
 * useEpisode
 * 
 * Fetch a single episode by ID.
 * 
 * Usage:
 * const { episode, loading, error } = useEpisode(episodeId);
 */
export function useEpisode(episodeId: string) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        setLoading(true);
        const result = await contentService.getEpisode(episodeId);
        setEpisode(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [episodeId]);

  return { episode, loading, error };
}

/**
 * useShowEpisodes
 * 
 * Fetch all episodes for a show.
 * 
 * Usage:
 * const { episodes, loading, error } = useShowEpisodes('tea-time-cj');
 */
export function useShowEpisodes(showId: ShowId) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        const result = await contentService.getEpisodesByShow(showId);
        setEpisodes(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [showId]);

  return { episodes, loading, error };
}

/**
 * useEpisodesByTag
 * 
 * Fetch episodes by functional tag.
 * 
 * Usage:
 * const { episodes, loading, error } = useEpisodesByTag('discipline');
 */
export function useEpisodesByTag(tag: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        const result = await contentService.getEpisodesByTag(tag);
        setEpisodes(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [tag]);

  return { episodes, loading, error };
}

// ============================================================================
// CONTENT ROUTING HOOKS
// ============================================================================

/**
 * useShowBrowseView
 * 
 * Fetch complete view for "Browse by Show" experience.
 * Includes all episodes, next to resume, metadata.
 * 
 * Usage:
 * const { view, loading, error } = useShowBrowseView('tea-time-cj', userId);
 */
export function useShowBrowseView(showId: ShowId, userId?: string) {
  const [view, setView] = useState<ShowBrowseView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchView = async () => {
      try {
        setLoading(true);
        const result = await contentService.getShowBrowseView(showId, userId);
        setView(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchView();
  }, [showId, userId]);

  return { view, loading, error };
}

/**
 * useEpisodeBrowseView
 * 
 * Fetch complete view for "Browse by Episode" experience.
 * Includes episode, all attachments, navigation, playback state.
 * 
 * Usage:
 * const { view, loading, error } = useEpisodeBrowseView(episodeId, userId);
 */
export function useEpisodeBrowseView(episodeId: string, userId?: string) {
  const [view, setView] = useState<EpisodeBrowseView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchView = async () => {
      try {
        setLoading(true);
        const result = await contentService.getEpisodeBrowseView(episodeId, userId);
        setView(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchView();
  }, [episodeId, userId]);

  return { view, loading, error };
}

// ============================================================================
// ATTACHMENT HOOKS
// ============================================================================

/**
 * useTeaTimeNotes
 * 
 * Fetch all notes attached to an episode.
 * 
 * Usage:
 * const { notes, loading, error } = useTeaTimeNotes(episodeId);
 */
export function useTeaTimeNotes(episodeId: string) {
  const [notes, setNotes] = useState<TeaTimeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const result = await contentService.getTeaTimeNotesByEpisode(episodeId);
        setNotes(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [episodeId]);

  return { notes, loading, error };
}

/**
 * useChallenges
 * 
 * Fetch all challenges attached to an episode.
 * 
 * Usage:
 * const { challenges, loading, error } = useChallenges(episodeId);
 */
export function useChallenges(episodeId: string) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const result = await contentService.getChallengesByEpisode(episodeId);
        setChallenges(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [episodeId]);

  return { challenges, loading, error };
}

/**
 * useWorkbooks
 * 
 * Fetch all workbooks attached to an episode.
 * 
 * Usage:
 * const { workbooks, loading, error } = useWorkbooks(episodeId);
 */
export function useWorkbooks(episodeId: string) {
  const [workbooks, setWorkbooks] = useState<WorkbookLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkbooks = async () => {
      try {
        setLoading(true);
        const result = await contentService.getWorkbooksByEpisode(episodeId);
        setWorkbooks(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkbooks();
  }, [episodeId]);

  return { workbooks, loading, error };
}

/**
 * useReflectionPrompts
 * 
 * Fetch all reflection prompts attached to an episode.
 * 
 * Usage:
 * const { prompts, loading, error } = useReflectionPrompts(episodeId);
 */
export function useReflectionPrompts(episodeId: string) {
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const result = await contentService.getReflectionPromptsByEpisode(episodeId);
        setPrompts(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [episodeId]);

  return { prompts, loading, error };
}

// ============================================================================
// PLAYBACK STATE HOOKS
// ============================================================================

/**
 * usePlaybackState
 * 
 * Get and manage user's playback state for an episode.
 * 
 * Usage:
 * const { state, saveState, loading } = usePlaybackState(userId, episodeId);
 */
export function usePlaybackState(userId: string, episodeId: string) {
  const [state, setState] = useState<EpisodePlaybackState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        setLoading(true);
        const result = await contentService.getPlaybackState(userId, episodeId);
        setState(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [userId, episodeId]);

  const saveState = useCallback(async (updates: Partial<EpisodePlaybackState>) => {
    try {
      const newState: EpisodePlaybackState = {
        userId,
        episodeId,
        watchedSeconds: updates.watchedSeconds ?? state?.watchedSeconds ?? 0,
        completionPercentage: updates.completionPercentage ?? state?.completionPercentage ?? 0,
        isCompleted: updates.isCompleted ?? state?.isCompleted ?? false,
        lastWatchedAt: updates.lastWatchedAt ?? new Date(),
        resumePosition: updates.resumePosition ?? state?.resumePosition ?? 0,
      };

      const success = await contentService.savePlaybackState(newState);
      if (success) {
        setState(newState);
      }
      return success;
    } catch (err) {
      console.error('Error saving playback state:', err);
      return false;
    }
  }, [userId, episodeId, state]);

  return { state, saveState, loading, error };
}

/**
 * useUserPlaybackHistory
 * 
 * Get all playback states for a user.
 * Useful for dashboard, watch history, "continue watching".
 * 
 * Usage:
 * const { states, loading, error } = useUserPlaybackHistory(userId);
 */
export function useUserPlaybackHistory(userId: string, episodeIds?: string[]) {
  const [states, setStates] = useState<EpisodePlaybackState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        const result = await contentService.getUserPlaybackStates(userId, episodeIds);
        setStates(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [userId, episodeIds?.join(',')]);

  return { states, loading, error };
}

// ============================================================================
// ACCESS CONTROL HOOKS
// ============================================================================

/**
 * useAccessibleContent
 * 
 * Get content accessible to user based on subscription.
 * 
 * Usage:
 * const { episodes, loading } = useAccessibleContent(userId, subscriptionStatus);
 */
export function useAccessibleContent(userId: string, subscriptionStatus: 'free' | 'active' | 'expired') {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const result = await contentService.getAccessibleEpisodes(userId, subscriptionStatus);
        setEpisodes(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userId, subscriptionStatus]);

  return { episodes, loading, error };
}

export default {
  useShow,
  useAllShows,
  useEpisode,
  useShowEpisodes,
  useEpisodesByTag,
  useShowBrowseView,
  useEpisodeBrowseView,
  useTeaTimeNotes,
  useChallenges,
  useWorkbooks,
  useReflectionPrompts,
  usePlaybackState,
  useUserPlaybackHistory,
  useAccessibleContent,
};
