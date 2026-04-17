<template>
  <div class="book-card glass-card" :id="`book-card-${book.id}`" @click="$emit('click', book)">
    <!-- Cover Image -->
    <div class="book-cover">
      <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" class="cover-image" />
      <div v-else class="cover-placeholder">
        <span class="cover-icon">📖</span>
        <span class="cover-initial">{{ book.title.charAt(0).toUpperCase() }}</span>
      </div>
    </div>

    <!-- Book Info -->
    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p v-if="book.author" class="book-author">{{ book.author }}</p>
      <div class="book-meta">
        <span class="badge badge-accent">
          {{ book.totalChapters }} {{ book.totalChapters === 1 ? 'chapter' : 'chapters' }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="book-actions" @click.stop>
      <button
        class="btn btn-ghost btn-icon"
        title="Delete book"
        @click="$emit('delete', book.id)"
        :id="`delete-book-${book.id}`"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '@audiary/types';

defineProps<{
  book: Book;
}>();

defineEmits<{
  click: [book: Book];
  delete: [id: string];
}>();
</script>

<style scoped>
.book-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  position: relative;
}

.book-cover {
  flex-shrink: 0;
  width: 64px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-accent-dark), var(--color-secondary-dark));
  gap: var(--space-1);
}

.cover-icon {
  font-size: 1.25rem;
  opacity: 0.7;
}

.cover-initial {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: white;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--space-1);
}

.book-author {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.book-meta {
  display: flex;
  gap: var(--space-2);
}

.book-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.book-card:hover .book-actions {
  opacity: 1;
}
</style>
