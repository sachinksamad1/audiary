import { pgTable, text, uuid, integer, timestamp, real, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Books ───────────────────────────────────────────────

export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  author: text('author'),
  coverUrl: text('cover_url'),
  totalChapters: integer('total_chapters').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const booksRelations = relations(books, ({ many }) => ({
  chapters: many(chapters),
  progress: many(readingProgress),
}));

// ─── Chapters ────────────────────────────────────────────

export const chapters = pgTable('chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: uuid('book_id')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const chaptersRelations = relations(chapters, ({ one }) => ({
  book: one(books, {
    fields: [chapters.bookId],
    references: [books.id],
  }),
}));

// ─── Reading Progress ────────────────────────────────────

export const readingProgress = pgTable(
  'reading_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull().default(0),
    playbackPosition: real('playback_position').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueBookProgress: uniqueIndex('unique_book_progress').on(table.bookId),
  }),
);

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  book: one(books, {
    fields: [readingProgress.bookId],
    references: [books.id],
  }),
  chapter: one(chapters, {
    fields: [readingProgress.chapterId],
    references: [chapters.id],
  }),
}));

// ─── Type Inference ──────────────────────────────────────

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type NewReadingProgress = typeof readingProgress.$inferInsert;
