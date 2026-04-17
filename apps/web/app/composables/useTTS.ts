/**
 * useTTS — TTS service composable
 * Wraps TTSService for reactive Vue state management.
 */
import { TTSService } from '~/services/TTSService';
import { chunkText, type TextChunk } from '~/utils/chunker';
import type { TTSChunk, TTSProgress } from '@audiary/types';

let ttsServiceInstance: TTSService | null = null;

export function useTTS() {
  const isReady = useState('tts-ready', () => false);
  const isInitializing = useState('tts-initializing', () => false);
  const chunks = useState<TTSChunk[]>('tts-chunks', () => []);
  const progress = useState<TTSProgress>('tts-progress', () => ({
    totalChunks: 0,
    completedChunks: 0,
    currentChunkIndex: -1,
    isProcessing: false,
  }));

  function getService(): TTSService {
    if (!ttsServiceInstance) {
      ttsServiceInstance = new TTSService();
    }
    return ttsServiceInstance;
  }

  async function initialize() {
    if (isReady.value || isInitializing.value) return;

    isInitializing.value = true;
    try {
      const service = getService();
      await service.initialize();
      isReady.value = true;
    } catch (err) {
      console.error('[useTTS] Initialization failed:', err);
    } finally {
      isInitializing.value = false;
    }
  }

  /**
   * Prepare text for TTS by chunking it.
   * Does not start synthesis — call processNextChunk for that.
   */
  function prepareText(text: string): TextChunk[] {
    const textChunks = chunkText(text);

    chunks.value = textChunks.map((tc) => ({
      index: tc.index,
      text: tc.text,
      status: 'pending' as const,
    }));

    progress.value = {
      totalChunks: textChunks.length,
      completedChunks: 0,
      currentChunkIndex: -1,
      isProcessing: false,
    };

    return textChunks;
  }

  /**
   * Synthesize a specific chunk. Returns the audio buffer.
   */
  async function synthesizeChunk(index: number): Promise<ArrayBuffer | null> {
    const chunk = chunks.value[index];
    if (!chunk) return null;

    // Update state
    chunks.value[index] = { ...chunk, status: 'processing' };
    progress.value = {
      ...progress.value,
      currentChunkIndex: index,
      isProcessing: true,
    };

    try {
      const service = getService();
      const audioBuffer = await service.synthesize(chunk.text);

      chunks.value[index] = {
        ...chunk,
        status: 'ready',
        audioBuffer,
      };

      progress.value = {
        ...progress.value,
        completedChunks: progress.value.completedChunks + 1,
        isProcessing: chunks.value.some((c) => c.status === 'processing'),
      };

      return audioBuffer;
    } catch (err: any) {
      chunks.value[index] = {
        ...chunk,
        status: 'error',
        error: err.message,
      };

      progress.value = {
        ...progress.value,
        isProcessing: false,
      };

      return null;
    }
  }

  function destroy() {
    ttsServiceInstance?.destroy();
    ttsServiceInstance = null;
    isReady.value = false;
    chunks.value = [];
  }

  return {
    isReady,
    isInitializing,
    chunks,
    progress,
    initialize,
    prepareText,
    synthesizeChunk,
    destroy,
  };
}
