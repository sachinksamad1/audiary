/**
 * useAudioPlayer — Web Audio API playback composable
 * Manages a queue of audio chunks with preloading.
 */

export interface PlayerState {
  isPlaying: boolean;
  currentChunkIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
}

export function useAudioPlayer() {
  const state = useState<PlayerState>('audio-player', () => ({
    isPlaying: false,
    currentChunkIndex: -1,
    currentTime: 0,
    duration: 0,
    volume: 1,
  }));

  let audioContext: AudioContext | null = null;
  let currentSource: AudioBufferSourceNode | null = null;
  let gainNode: GainNode | null = null;
  let startTime = 0;
  let offsetTime = 0;
  let updateInterval: ReturnType<typeof setInterval> | null = null;

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext();
      gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
    }
    return audioContext;
  }

  /**
   * Play an audio buffer (WAV ArrayBuffer).
   */
  async function playBuffer(
    buffer: ArrayBuffer,
    chunkIndex: number,
    onEnded?: () => void,
  ): Promise<void> {
    const ctx = getAudioContext();

    // Resume if suspended (required by browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Stop current playback
    stopCurrent();

    try {
      const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
      currentSource = ctx.createBufferSource();
      currentSource.buffer = audioBuffer;
      currentSource.connect(gainNode!);

      state.value = {
        ...state.value,
        isPlaying: true,
        currentChunkIndex: chunkIndex,
        duration: audioBuffer.duration,
        currentTime: 0,
      };

      startTime = ctx.currentTime;
      offsetTime = 0;

      // Update progress
      updateInterval = setInterval(() => {
        if (state.value.isPlaying && audioContext) {
          state.value = {
            ...state.value,
            currentTime: offsetTime + audioContext.currentTime - startTime,
          };
        }
      }, 100);

      currentSource.onended = () => {
        state.value = {
          ...state.value,
          isPlaying: false,
        };
        clearTimer();
        onEnded?.();
      };

      currentSource.start(0);
    } catch (err) {
      console.error('[useAudioPlayer] Playback error:', err);
      state.value = { ...state.value, isPlaying: false };
    }
  }

  function pause(): void {
    if (audioContext && state.value.isPlaying) {
      offsetTime += audioContext.currentTime - startTime;
      currentSource?.stop();
      state.value = { ...state.value, isPlaying: false };
      clearTimer();
    }
  }

  function resume(): void {
    // For simplicity, resume replays from beginning of chunk
    // Full seek support would require buffering
    if (audioContext) {
      audioContext.resume();
    }
  }

  function setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume));
    if (gainNode) {
      gainNode.gain.value = v;
    }
    state.value = { ...state.value, volume: v };
  }

  function stopCurrent(): void {
    try {
      currentSource?.stop();
    } catch {
      // Already stopped
    }
    currentSource = null;
    clearTimer();
  }

  function clearTimer(): void {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }

  function destroy(): void {
    stopCurrent();
    audioContext?.close();
    audioContext = null;
    gainNode = null;
    state.value = {
      isPlaying: false,
      currentChunkIndex: -1,
      currentTime: 0,
      duration: 0,
      volume: 1,
    };
  }

  return {
    state,
    playBuffer,
    pause,
    resume,
    setVolume,
    stop: stopCurrent,
    destroy,
  };
}
