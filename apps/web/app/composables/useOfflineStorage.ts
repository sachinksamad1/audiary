/**
 * useOfflineStorage — IndexedDB wrapper for offline caching
 * Stores audio chunks, TTS models, and book metadata locally.
 */

const DB_NAME = 'audiary-offline';
const DB_VERSION = 1;

const STORES = {
  AUDIO_CHUNKS: 'audio-chunks',
  BOOKS: 'books-cache',
  MODELS: 'tts-models',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.AUDIO_CHUNKS)) {
        db.createObjectStore(STORES.AUDIO_CHUNKS);
      }
      if (!db.objectStoreNames.contains(STORES.BOOKS)) {
        db.createObjectStore(STORES.BOOKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MODELS)) {
        db.createObjectStore(STORES.MODELS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function useOfflineStorage() {
  /**
   * Save an audio chunk to IndexedDB.
   * Key format: bookId:chapterId:chunkIndex
   */
  async function saveAudioChunk(
    bookId: string,
    chapterId: string,
    chunkIndex: number,
    audioBuffer: ArrayBuffer,
  ): Promise<void> {
    const db = await openDB();
    const key = `${bookId}:${chapterId}:${chunkIndex}`;
    const tx = db.transaction(STORES.AUDIO_CHUNKS, 'readwrite');
    tx.objectStore(STORES.AUDIO_CHUNKS).put(audioBuffer, key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get a cached audio chunk from IndexedDB.
   */
  async function getAudioChunk(
    bookId: string,
    chapterId: string,
    chunkIndex: number,
  ): Promise<ArrayBuffer | null> {
    const db = await openDB();
    const key = `${bookId}:${chapterId}:${chunkIndex}`;
    const tx = db.transaction(STORES.AUDIO_CHUNKS, 'readonly');
    const request = tx.objectStore(STORES.AUDIO_CHUNKS).get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if an audio chunk exists in cache.
   */
  async function hasAudioChunk(
    bookId: string,
    chapterId: string,
    chunkIndex: number,
  ): Promise<boolean> {
    const chunk = await getAudioChunk(bookId, chapterId, chunkIndex);
    return chunk !== null;
  }

  /**
   * Cache book metadata for offline access.
   */
  async function saveBookCache(book: any): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORES.BOOKS, 'readwrite');
    tx.objectStore(STORES.BOOKS).put(book);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get cached book metadata.
   */
  async function getBookCache(bookId: string): Promise<any | null> {
    const db = await openDB();
    const tx = db.transaction(STORES.BOOKS, 'readonly');
    const request = tx.objectStore(STORES.BOOKS).get(bookId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all cached books.
   */
  async function getAllBooksCache(): Promise<any[]> {
    const db = await openDB();
    const tx = db.transaction(STORES.BOOKS, 'readonly');
    const request = tx.objectStore(STORES.BOOKS).getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all audio chunks for a specific book/chapter.
   */
  async function clearAudioChunks(bookId: string, chapterId?: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORES.AUDIO_CHUNKS, 'readwrite');
    const store = tx.objectStore(STORES.AUDIO_CHUNKS);
    const request = store.openCursor();

    const prefix = chapterId ? `${bookId}:${chapterId}:` : `${bookId}:`;

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.key.startsWith(prefix)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  return {
    saveAudioChunk,
    getAudioChunk,
    hasAudioChunk,
    saveBookCache,
    getBookCache,
    getAllBooksCache,
    clearAudioChunks,
  };
}
