/**
 * useProgress — Reading progress tracking composable
 * Syncs progress to API when online, falls back to localStorage offline.
 */
import type { ReadingProgress, UpsertProgressRequest } from '@audiary/types';

const LOCAL_STORAGE_KEY = 'audiary-progress';

export function useProgress() {
  const api = useApi();

  /**
   * Get reading progress for a book.
   * Tries API first, falls back to local storage.
   */
  async function getProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      const progress = await api.get<ReadingProgress | null>(`/progress/${bookId}`);
      if (progress) {
        saveLocal(bookId, progress);
      }
      return progress;
    } catch {
      // Offline — try local storage
      return getLocal(bookId);
    }
  }

  /**
   * Save reading progress.
   * Saves to API when online, always saves locally.
   */
  async function saveProgress(bookId: string, data: UpsertProgressRequest): Promise<void> {
    // Always save locally first
    saveLocal(bookId, {
      id: '',
      bookId,
      chapterId: data.chapterId,
      chunkIndex: data.chunkIndex,
      playbackPosition: data.playbackPosition,
      updatedAt: new Date().toISOString(),
    });

    // Try to sync with API
    try {
      await api.put(`/progress/${bookId}`, data);
    } catch {
      // Will sync when back online
      console.warn('[useProgress] Offline, progress saved locally');
    }
  }

  function saveLocal(bookId: string, progress: ReadingProgress): void {
    try {
      const all = getAllLocal();
      all[bookId] = progress;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // localStorage might be full or unavailable
    }
  }

  function getLocal(bookId: string): ReadingProgress | null {
    try {
      const all = getAllLocal();
      return all[bookId] || null;
    } catch {
      return null;
    }
  }

  function getAllLocal(): Record<string, ReadingProgress> {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  return {
    getProgress,
    saveProgress,
  };
}
