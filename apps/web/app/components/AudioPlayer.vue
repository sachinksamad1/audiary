<template>
  <div class="audio-player glass-card" id="audio-player">
    <!-- Progress Visualization -->
    <div class="player-progress">
      <div class="waveform">
        <div
          v-for="i in 40"
          :key="i"
          class="waveform-bar"
          :class="{ active: isPlaying }"
          :style="{
            height: `${getBarHeight(i)}%`,
            animationDelay: `${i * 50}ms`,
          }"
        />
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }" />
      </div>
    </div>

    <!-- Time Display -->
    <div class="player-time">
      <span class="time-current">{{ formatTime(playerState.currentTime) }}</span>
      <span class="time-separator">/</span>
      <span class="time-duration">{{ formatTime(playerState.duration) }}</span>
    </div>

    <!-- Controls -->
    <div class="player-controls">
      <button
        class="btn btn-ghost btn-icon"
        title="Previous chunk"
        id="player-prev"
        @click="$emit('prev')"
      >
        ⏮
      </button>

      <button
        class="btn btn-primary btn-play"
        :title="isPlaying ? 'Pause' : 'Play'"
        id="player-play-pause"
        @click="$emit(isPlaying ? 'pause' : 'play')"
      >
        {{ isPlaying ? '⏸' : '▶' }}
      </button>

      <button
        class="btn btn-ghost btn-icon"
        title="Next chunk"
        id="player-next"
        @click="$emit('next')"
      >
        ⏭
      </button>
    </div>

    <!-- Volume -->
    <div class="player-volume">
      <span class="volume-icon">{{ playerState.volume > 0 ? '🔊' : '🔇' }}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="playerState.volume"
        class="volume-slider"
        id="player-volume"
        @input="$emit('volume', Number(($event.target as HTMLInputElement).value))"
      />
    </div>

    <!-- Chunk Info -->
    <div v-if="ttsProgress" class="player-chunk-info">
      <span class="badge badge-accent">
        Chunk {{ ttsProgress.currentChunkIndex + 1 }} / {{ ttsProgress.totalChunks }}
      </span>
      <span v-if="ttsProgress.isProcessing" class="processing-indicator">
        <span class="processing-dot animate-pulse" /> Generating...
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TTSProgress } from '@audiary/types';
import type { PlayerState } from '~/composables/useAudioPlayer';

const props = defineProps<{
  playerState: PlayerState;
  ttsProgress?: TTSProgress;
}>();

defineEmits<{
  play: [];
  pause: [];
  prev: [];
  next: [];
  volume: [value: number];
}>();

const isPlaying = computed(() => props.playerState.isPlaying);

const progressPercent = computed(() => {
  if (props.playerState.duration === 0) return 0;
  return (props.playerState.currentTime / props.playerState.duration) * 100;
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getBarHeight(i: number): number {
  // Generate pseudo-random waveform pattern
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  return 20 + (seed - Math.floor(seed)) * 80;
}
</script>

<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
}

/* Waveform */
.waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 60px;
  width: 100%;
  max-width: 400px;
}

.waveform-bar {
  width: 3px;
  min-height: 4px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  opacity: 0.3;
  transition: opacity var(--transition-fast);
}

.waveform-bar.active {
  opacity: 1;
  animation: waveformPulse 1.2s ease-in-out infinite alternate;
}

@keyframes waveformPulse {
  0% {
    transform: scaleY(0.5);
    opacity: 0.4;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Progress */
.player-progress {
  width: 100%;
  max-width: 500px;
}

.progress-bar {
  margin-top: var(--space-3);
}

/* Time */
.player-time {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}

.time-current {
  color: var(--color-text-primary);
  font-weight: 600;
}

.time-separator {
  color: var(--color-text-muted);
}

.time-duration {
  color: var(--color-text-secondary);
}

/* Controls */
.player-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.btn-play {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  font-size: 1.25rem;
  animation: glow 3s ease-in-out infinite;
}

/* Volume */
.player-volume {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  outline: none;
  border: none;
  padding: 0;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  cursor: pointer;
}

/* Chunk info */
.player-chunk-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-secondary);
}

.processing-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-secondary);
}
</style>
