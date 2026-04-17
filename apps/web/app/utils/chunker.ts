/**
 * Text Chunker — splits text into TTS-friendly chunks
 *
 * Rules:
 * - Chunk size: 300-800 characters
 * - Respects sentence boundaries (splits at . ! ?)
 * - Never splits mid-word
 */

const MIN_CHUNK_SIZE = 300;
const MAX_CHUNK_SIZE = 800;
const SENTENCE_ENDINGS = /[.!?]\s+/g;

export interface TextChunk {
  index: number;
  text: string;
  startOffset: number;
  endOffset: number;
}

/**
 * Split text into chunks suitable for TTS processing.
 * Prefers splitting at sentence boundaries within the 300-800 char range.
 */
export function chunkText(text: string): TextChunk[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const chunks: TextChunk[] = [];
  let offset = 0;
  let remaining = trimmed;

  while (remaining.length > 0) {
    let chunkEnd: number;

    if (remaining.length <= MAX_CHUNK_SIZE) {
      // Last chunk — take everything
      chunkEnd = remaining.length;
    } else {
      // Find the best sentence boundary within range
      chunkEnd = findBestBreakPoint(remaining);
    }

    const chunkText = remaining.slice(0, chunkEnd).trim();
    if (chunkText.length > 0) {
      chunks.push({
        index: chunks.length,
        text: chunkText,
        startOffset: offset,
        endOffset: offset + chunkEnd,
      });
    }

    offset += chunkEnd;
    remaining = remaining.slice(chunkEnd).trim();
  }

  return chunks;
}

/**
 * Find the best position to break the text.
 * Prefers sentence endings, falls back to word boundaries.
 */
function findBestBreakPoint(text: string): number {
  // Look for sentence boundaries in the preferred range
  const searchRange = text.slice(MIN_CHUNK_SIZE, MAX_CHUNK_SIZE);
  const sentenceBreaks: number[] = [];

  let match: RegExpExecArray | null;
  const regex = new RegExp(SENTENCE_ENDINGS.source, 'g');

  while ((match = regex.exec(searchRange)) !== null) {
    sentenceBreaks.push(MIN_CHUNK_SIZE + match.index + match[0].length);
  }

  // Use the last sentence boundary found (maximize chunk size)
  if (sentenceBreaks.length > 0) {
    return sentenceBreaks[sentenceBreaks.length - 1];
  }

  // No sentence boundary — find last space before MAX_CHUNK_SIZE
  const lastSpace = text.lastIndexOf(' ', MAX_CHUNK_SIZE);
  if (lastSpace > MIN_CHUNK_SIZE) {
    return lastSpace + 1;
  }

  // Fallback: hard break at MAX_CHUNK_SIZE
  return MAX_CHUNK_SIZE;
}

/**
 * Estimate total TTS processing time based on text length.
 * Rough estimate: ~50 chars/second processing speed.
 */
export function estimateProcessingTime(text: string): number {
  const charCount = text.length;
  return Math.ceil(charCount / 50); // seconds
}

/**
 * Estimate audio duration from text.
 * Average speaking rate: ~150 words/minute = ~2.5 words/second
 * Average word length: ~5 chars
 */
export function estimateAudioDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 2.5); // seconds
}
