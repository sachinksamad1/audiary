// TTS-related types

export type TTSChunkStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface TTSChunk {
  index: number;
  text: string;
  audioBuffer?: ArrayBuffer;
  status: TTSChunkStatus;
  error?: string;
}

export interface TTSConfig {
  modelUrl: string;
  speakerId?: number;
  chunkSize: number; // recommended: 300-800 chars
}

export interface TTSModelInfo {
  name: string;
  language: string;
  quality: 'low' | 'medium' | 'high';
  sizeBytes: number;
  url: string;
}

export interface TTSProgress {
  totalChunks: number;
  completedChunks: number;
  currentChunkIndex: number;
  isProcessing: boolean;
}
