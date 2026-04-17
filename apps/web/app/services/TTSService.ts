/**
 * TTSService — Abstraction layer for piper-tts-web
 *
 * Per PROJECT_CONTEXT.md: Do NOT call piper-tts-web directly elsewhere.
 * This service wraps all TTS functionality and allows swapping implementation later.
 */

import type { TTSConfig } from '@audiary/types';

// Default Piper voice model from Rhasspy CDN
const DEFAULT_MODEL_ID = 'en_US-amy-medium';

export interface TTSServiceOptions {
  modelId?: string;
  speakerId?: number;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export class TTSService {
  private engine: any = null;
  private isInitialized = false;
  private isInitializing = false;
  private modelId: string;
  private speakerId?: number;

  constructor(options: TTSServiceOptions = {}) {
    this.modelId = options.modelId || DEFAULT_MODEL_ID;
    this.speakerId = options.speakerId;
  }

  /**
   * Initialize the TTS engine. Loads the WASM module and voice model.
   * This can take a while on first load (~50-100MB model download).
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.isInitializing) {
      // Wait for ongoing initialization
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
      return;
    }

    this.isInitializing = true;

    try {
      // Dynamic import to avoid SSR issues
      const { PiperWebWorkerEngine, HuggingFaceVoiceProvider } = await import('piper-tts-web');

      const voiceProvider = new HuggingFaceVoiceProvider();

      this.engine = new PiperWebWorkerEngine({
        voiceProvider,
      });

      this.isInitialized = true;
    } catch (error) {
      this.isInitializing = false;
      console.error('[TTSService] Failed to initialize:', error);
      throw new Error(`Failed to initialize TTS engine: ${error}`);
    }
  }

  /**
   * Synthesize text into an audio buffer (WAV format).
   * This is the main public API — all TTS calls go through here.
   */
  async synthesize(text: string): Promise<ArrayBuffer> {
    if (!text.trim()) {
      return new ArrayBuffer(0);
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // generate(text, voice, speaker)
      const result = await this.engine.generate(text.trim(), this.modelId, this.speakerId || 0);

      // result.audio is a Blob, convert to ArrayBuffer
      return await result.audio.arrayBuffer();
    } catch (error) {
      console.error('[TTSService] Synthesis failed:', error);
      throw new Error(`TTS synthesis failed: ${error}`);
    }
  }

  /**
   * Check if the TTS engine is ready for synthesis.
   */
  get ready(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current TTS configuration.
   */
  getConfig(): TTSConfig {
    return {
      modelUrl: this.modelId, // We use modelId as modelUrl for simplicity
      speakerId: this.speakerId,
      chunkSize: 600, // default target
    };
  }

  /**
   * Destroy the TTS engine and free resources.
   */
  destroy(): void {
    if (this.engine) {
      // PiperWebWorkerEngine doesn't have a direct destroy, but we can clear ref
      this.engine = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
  }
}
