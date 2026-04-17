<template>
  <div class="chapter-list">
    <div
      v-for="chapter in chapters"
      :key="chapter.id"
      class="chapter-item"
      :class="{ active: activeChapterId === chapter.id }"
      :id="`chapter-${chapter.id}`"
      @click="$emit('select', chapter)"
    >
      <div class="chapter-order">{{ chapter.order + 1 }}</div>
      <div class="chapter-info">
        <h4 class="chapter-title">{{ chapter.title }}</h4>
        <p class="chapter-preview">
          {{ chapter.content.slice(0, 100) }}{{ chapter.content.length > 100 ? '…' : '' }}
        </p>
      </div>
      <div class="chapter-actions" @click.stop>
        <button class="btn btn-ghost btn-icon" title="Play chapter" @click="$emit('play', chapter)">
          ▶️
        </button>
      </div>
    </div>

    <div v-if="chapters.length === 0" class="empty-state">
      <p class="empty-text">No chapters yet</p>
      <p class="empty-hint">Add a chapter to get started</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '@audiary/types';

defineProps<{
  chapters: Chapter[];
  activeChapterId?: string;
}>();

defineEmits<{
  select: [chapter: Chapter];
  play: [chapter: Chapter];
}>();
</script>

<style scoped>
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chapter-item:hover {
  background: var(--color-bg-glass-hover);
  border-color: var(--color-border-hover);
}

.chapter-item.active {
  border-color: var(--color-accent);
  background: rgba(124, 92, 252, 0.08);
}

.chapter-order {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.chapter-item.active .chapter-order {
  background: var(--color-accent);
  color: white;
}

.chapter-info {
  flex: 1;
  min-width: 0;
}

.chapter-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.chapter-preview {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.chapter-item:hover .chapter-actions {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}

.empty-text {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
