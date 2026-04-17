<template>
  <div class="player-page container">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner animate-spin">⏳</div>
      <p>Loading player...</p>
    </div>

    <!-- Player -->
    <template v-else-if="book && currentChapter">
      <!-- Header -->
      <div class="player-header animate-fade-in">
        <NuxtLink :to="`/books/${bookId}`" class="back-link"> ← Back to {{ book.title }} </NuxtLink>
      </div>

      <!-- Now Playing Info -->
      <div class="now-playing animate-fade-in-up">
        <div class="now-playing-cover">
          <div class="cover-art">
            <span class="cover-emoji">🎧</span>
          </div>
          <div class="cover-glow" />
        </div>

        <div class="now-playing-info">
          <h1 class="now-playing-title">{{ currentChapter.title }}</h1>
          <p class="now-playing-book">{{ book.title }}</p>
          <p v-if="book.author" class="now-playing-author">{{ book.author }}</p>
        </div>
      </div>

      <!-- Audio Player -->
      <AudioPlayer
        :player-state="playerState"
        :tts-progress="ttsProgress"
        @play="handlePlay"
        @pause="handlePause"
        @prev="handlePrev"
        @next="handleNext"
        @volume="handleVolume"
      />

      <!-- TTS Status -->
      <div class="tts-status glass-card animate-fade-in-up">
        <div class="status-header">
          <h3 class="status-title">TTS Engine</h3>
          <span class="badge" :class="ttsReady ? 'badge-accent' : ''">
            {{ ttsReady ? 'Ready' : ttsInitializing ? 'Loading...' : 'Not initialized' }}
          </span>
        </div>

        <div v-if="!ttsReady" class="status-action">
          <p class="status-hint">Initialize the TTS engine to start generating audio.</p>
          <button
            class="btn btn-primary"
            id="init-tts-btn"
            :disabled="ttsInitializing"
            @click="initializeTTS"
          >
            {{ ttsInitializing ? 'Loading Model...' : 'Initialize TTS' }}
          </button>
        </div>

        <div v-else class="status-ready">
          <p class="status-hint">
            Text will be split into {{ chunks.length }} chunks and processed progressively.
          </p>
        </div>
      </div>

      <!-- Chapter Navigation -->
      <div v-if="book.chapters && book.chapters.length > 1" class="chapter-nav animate-fade-in-up">
        <h3 class="section-title">Chapters</h3>
        <ChapterList
          :chapters="book.chapters"
          :active-chapter-id="currentChapter.id"
          @play="switchChapter"
          @select="switchChapter"
        />
      </div>
    </template>

    <!-- Error -->
    <div v-else class="error-state glass-card">
      <p class="error-icon">🎧</p>
      <p>Could not load the player.</p>
      <NuxtLink to="/" class="btn btn-secondary">Back to Library</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookWithChapters, Chapter } from '@audiary/types';

const route = useRoute();
const bookId = route.params.id as string;
const chapterIdQuery = route.query.chapter as string | undefined;

const { fetchBook } = useBooks();
const {
  isReady: ttsReady,
  isInitializing: ttsInitializing,
  chunks,
  progress: ttsProgress,
  initialize: initTTS,
  prepareText,
  synthesizeChunk,
} = useTTS();
const { state: playerState, playBuffer, pause, setVolume } = useAudioPlayer();
const { saveProgress } = useProgress();
const offlineStorage = useOfflineStorage();

const book = ref<BookWithChapters | null>(null);
const currentChapter = ref<Chapter | null>(null);
const loading = ref(true);
const currentChunkIndex = ref(0);

useHead({
  title: computed(() =>
    currentChapter.value ? `${currentChapter.value.title} — Audiary Player` : 'Audiary Player',
  ),
});

onMounted(async () => {
  loading.value = true;
  book.value = await fetchBook(bookId);

  if (book.value?.chapters?.length) {
    const target = chapterIdQuery
      ? book.value.chapters.find((c) => c.id === chapterIdQuery)
      : book.value.chapters[0];
    currentChapter.value = target || book.value.chapters[0];

    // Prepare chunks for the current chapter
    if (currentChapter.value) {
      prepareText(currentChapter.value.content);
    }
  }

  loading.value = false;
});

async function initializeTTS() {
  await initTTS();
}

async function handlePlay() {
  if (!currentChapter.value) return;

  // Check if we have a cached chunk first
  const cached = await offlineStorage.getAudioChunk(
    bookId,
    currentChapter.value.id,
    currentChunkIndex.value,
  );

  if (cached) {
    playChunkBuffer(cached, currentChunkIndex.value);
    return;
  }

  // Synthesize the current chunk
  if (ttsReady.value) {
    const buffer = await synthesizeChunk(currentChunkIndex.value);
    if (buffer) {
      // Cache for offline use
      await offlineStorage.saveAudioChunk(
        bookId,
        currentChapter.value.id,
        currentChunkIndex.value,
        buffer,
      );
      playChunkBuffer(buffer, currentChunkIndex.value);

      // Pre-generate next chunk in background
      preloadNextChunk();
    }
  }
}

function playChunkBuffer(buffer: ArrayBuffer, index: number) {
  playBuffer(buffer, index, () => {
    // Auto-advance to next chunk
    handleNext();
  });
}

function handlePause() {
  pause();
  saveCurrentProgress();
}

async function handleNext() {
  if (currentChunkIndex.value < chunks.value.length - 1) {
    currentChunkIndex.value++;
    await handlePlay();
  }
}

async function handlePrev() {
  if (currentChunkIndex.value > 0) {
    currentChunkIndex.value--;
    await handlePlay();
  }
}

function handleVolume(v: number) {
  setVolume(v);
}

async function preloadNextChunk() {
  if (!currentChapter.value) return;
  const nextIndex = currentChunkIndex.value + 1;
  if (nextIndex >= chunks.value.length) return;

  const cached = await offlineStorage.hasAudioChunk(bookId, currentChapter.value.id, nextIndex);
  if (cached) return;

  const buffer = await synthesizeChunk(nextIndex);
  if (buffer && currentChapter.value) {
    await offlineStorage.saveAudioChunk(bookId, currentChapter.value.id, nextIndex, buffer);
  }
}

function switchChapter(chapter: Chapter) {
  currentChapter.value = chapter;
  currentChunkIndex.value = 0;
  prepareText(chapter.content);
  saveCurrentProgress();
}

function saveCurrentProgress() {
  if (!currentChapter.value) return;
  saveProgress(bookId, {
    chapterId: currentChapter.value.id,
    chunkIndex: currentChunkIndex.value,
    playbackPosition: playerState.value.currentTime,
  });
}

onBeforeUnmount(() => {
  saveCurrentProgress();
});
</script>

<style scoped>
.player-page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-16);
  max-width: 700px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-6);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-text-primary);
}

/* Now Playing */
.now-playing {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: var(--space-8);
}

.now-playing-cover {
  position: relative;
  margin-bottom: var(--space-6);
}

.cover-art {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-2xl);
  background: linear-gradient(135deg, var(--color-accent-dark), var(--color-secondary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 1;
}

.cover-emoji {
  font-size: 4rem;
}

.cover-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(124, 92, 252, 0.3) 0%, transparent 70%);
  z-index: 0;
  animation: glow 4s ease-in-out infinite;
}

.now-playing-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.now-playing-book {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.now-playing-author {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* TTS Status */
.tts-status {
  margin-top: var(--space-6);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.status-title {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.status-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.status-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.status-ready {
  text-align: center;
}

/* Chapter Navigation */
.chapter-nav {
  margin-top: var(--space-8);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--space-4);
}

/* States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-16);
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner {
  font-size: 2rem;
}

.error-icon {
  font-size: 3rem;
}

@media (max-width: 768px) {
  .cover-art {
    width: 160px;
    height: 160px;
  }

  .cover-emoji {
    font-size: 3rem;
  }
}
</style>
