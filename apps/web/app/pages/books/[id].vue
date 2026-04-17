<template>
  <div class="book-detail container">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner animate-spin">⏳</div>
      <p>Loading book...</p>
    </div>

    <!-- Error -->
    <div v-else-if="!book" class="error-state glass-card animate-fade-in">
      <p class="error-icon">📖</p>
      <p>Book not found</p>
      <NuxtLink to="/" class="btn btn-secondary">Back to Library</NuxtLink>
    </div>

    <!-- Book Content -->
    <template v-else>
      <!-- Header -->
      <div class="book-header animate-fade-in">
        <NuxtLink to="/" class="back-link"> ← Back to Library </NuxtLink>

        <div class="book-header-content">
          <div class="book-header-info">
            <h1 class="book-title">{{ book.title }}</h1>
            <p v-if="book.author" class="book-author">by {{ book.author }}</p>
            <div class="book-stats">
              <span class="badge badge-accent"> {{ book.chapters?.length || 0 }} chapters </span>
            </div>
          </div>

          <div class="book-header-actions">
            <button class="btn btn-primary" id="add-chapter-btn" @click="showAddChapter = true">
              ➕ Add Chapter
            </button>
            <button
              v-if="book.chapters?.length"
              class="btn btn-secondary"
              id="play-all-btn"
              @click="playFromStart"
            >
              ▶ Play All
            </button>
          </div>
        </div>
      </div>

      <!-- Chapter List -->
      <div class="chapters-section animate-fade-in-up">
        <h2 class="section-title">Chapters</h2>
        <ChapterList
          :chapters="book.chapters || []"
          :active-chapter-id="activeChapterId"
          @select="handleSelectChapter"
          @play="handlePlayChapter"
        />
      </div>
    </template>

    <!-- Add Chapter Modal -->
    <AddBookModal
      :show="showAddChapter"
      :is-adding-chapter="true"
      :book-id="bookId"
      @close="showAddChapter = false"
      @add-chapter="handleAddChapter"
    />
  </div>
</template>

<script setup lang="ts">
import type { BookWithChapters, Chapter } from '@audiary/types';

const route = useRoute();
const router = useRouter();
const bookId = route.params.id as string;
const { fetchBook } = useBooks();
const api = useApi();

const book = ref<BookWithChapters | null>(null);
const loading = ref(true);
const showAddChapter = ref(false);
const activeChapterId = ref<string | undefined>();

useHead({
  title: computed(() => (book.value ? `${book.value.title} — Audiary` : 'Audiary')),
});

onMounted(async () => {
  loading.value = true;
  book.value = await fetchBook(bookId);
  loading.value = false;
});

function handleSelectChapter(chapter: Chapter) {
  activeChapterId.value = chapter.id;
}

function handlePlayChapter(chapter: Chapter) {
  router.push(`/player/${bookId}?chapter=${chapter.id}`);
}

function playFromStart() {
  const firstChapter = book.value?.chapters?.[0];
  if (firstChapter) {
    router.push(`/player/${bookId}?chapter=${firstChapter.id}`);
  }
}

async function handleAddChapter(data: { title: string; content: string }) {
  try {
    await api.post(`/books/${bookId}/chapters`, {
      title: data.title,
      content: data.content,
    });

    // Refresh book data
    book.value = await fetchBook(bookId);
    showAddChapter.value = false;
  } catch (err) {
    console.error('Failed to add chapter:', err);
  }
}
</script>

<style scoped>
.book-detail {
  padding-top: var(--space-6);
  padding-bottom: var(--space-16);
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

.book-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}

.book-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--space-2);
}

.book-author {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.book-stats {
  display: flex;
  gap: var(--space-2);
}

.book-header-actions {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
}

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
  .book-header-content {
    flex-direction: column;
  }

  .book-header-actions {
    width: 100%;
  }

  .book-header-actions .btn {
    flex: 1;
  }
}
</style>
