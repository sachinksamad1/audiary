<template>
  <div class="library-page container">
    <!-- Hero Section -->
    <section class="hero animate-fade-in">
      <div class="hero-content">
        <h1 class="hero-title">
          Your
          <span class="gradient-text">Audiobook</span>
          Library
        </h1>
        <p class="hero-subtitle">
          Convert text into natural-sounding audiobooks, right in your browser. No servers, no cost
          — just words brought to life.
        </p>
      </div>
      <button class="btn btn-primary btn-lg" id="add-book-btn" @click="showAddModal = true">
        <span>➕</span>
        Add Book
      </button>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner animate-spin">⏳</div>
      <p>Loading your library...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <p class="error-icon">⚠️</p>
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-secondary" @click="fetchBooks">Retry</button>
    </div>

    <!-- Empty State -->
    <section v-else-if="books.length === 0" class="empty-state animate-fade-in-up">
      <div class="empty-illustration">📚</div>
      <h2 class="empty-title">No books yet</h2>
      <p class="empty-description">
        Add your first book to start listening. Paste text or upload a file, and Audiary will
        convert it into audio using on-device TTS.
      </p>
      <button class="btn btn-primary btn-lg" @click="showAddModal = true">
        Add Your First Book
      </button>
    </section>

    <!-- Book Grid -->
    <section v-else class="book-grid stagger-children">
      <BookCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        @click="navigateToBook"
        @delete="handleDeleteBook"
      />
    </section>

    <!-- Add Book Modal -->
    <AddBookModal :show="showAddModal" @close="showAddModal = false" @add-book="handleAddBook" />
  </div>
</template>

<script setup lang="ts">
import type { Book } from '@audiary/types';

useHead({
  title: 'Audiary — Your AI Audiobook Library',
  meta: [
    {
      name: 'description',
      content:
        'Convert text into audiobooks using on-device TTS. Privacy-first, offline-capable PWA.',
    },
  ],
});

const router = useRouter();
const { books, loading, error, fetchBooks, createBook, deleteBook } = useBooks();
const showAddModal = ref(false);

onMounted(() => {
  fetchBooks();
});

function navigateToBook(book: Book) {
  router.push(`/books/${book.id}`);
}

async function handleAddBook(data: { title: string; author?: string; initialText?: string }) {
  const api = useApi();
  const book = await createBook({ title: data.title, author: data.author });

  if (book && data.initialText) {
    // Create initial chapter from pasted text
    try {
      await api.post(`/books/${book.id}/chapters`, {
        title: 'Chapter 1',
        content: data.initialText,
        order: 0,
      });
    } catch (err) {
      console.error('Failed to create initial chapter:', err);
    }
  }

  showAddModal.value = false;

  if (book) {
    router.push(`/books/${book.id}`);
  }
}

async function handleDeleteBook(id: string) {
  if (confirm('Are you sure you want to delete this book?')) {
    await deleteBook(id);
  }
}
</script>

<style scoped>
.library-page {
  padding-top: var(--space-8);
  padding-bottom: var(--space-16);
}

/* Hero */
.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: var(--space-4);
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 500px;
  line-height: 1.7;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-16);
  color: var(--color-text-secondary);
}

.loading-spinner {
  font-size: 2rem;
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8);
  text-align: center;
}

.error-icon {
  font-size: 2rem;
}

.error-message {
  color: var(--color-error);
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-16);
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: var(--space-6);
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  max-width: 400px;
  line-height: 1.7;
  margin-bottom: var(--space-8);
}

/* Book Grid */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    gap: var(--space-4);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .book-grid {
    grid-template-columns: 1fr;
  }
}
</style>
