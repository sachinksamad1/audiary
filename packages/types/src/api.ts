// API request/response types

// --- Books ---

export interface CreateBookRequest {
  title: string;
  author?: string;
  coverUrl?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  coverUrl?: string;
}

// --- Chapters ---

export interface CreateChapterRequest {
  title: string;
  content: string;
  order?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  order?: number;
}

// --- Progress ---

export interface UpsertProgressRequest {
  chapterId: string;
  chunkIndex: number;
  playbackPosition: number;
}

// --- Generic API Response ---

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
