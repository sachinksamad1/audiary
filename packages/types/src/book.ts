// Book domain types

export interface Book {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
}

export interface ReadingProgress {
  id: string;
  bookId: string;
  chapterId: string;
  chunkIndex: number;
  playbackPosition: number;
  updatedAt: string;
}

export interface BookWithChapters extends Book {
  chapters: Chapter[];
}

export interface BookWithProgress extends Book {
  progress: ReadingProgress | null;
}
