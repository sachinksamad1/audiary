import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../config/database.module';
import { readingProgress, type ReadingProgress } from '@audiary/database';

@Injectable()
export class ProgressService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findByBook(bookId: string): Promise<ReadingProgress | null> {
    const results = await this.db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.bookId, bookId))
      .limit(1);

    return results[0] || null;
  }

  async upsert(
    bookId: string,
    data: { chapterId: string; chunkIndex: number; playbackPosition: number },
  ): Promise<ReadingProgress> {
    const existing = await this.findByBook(bookId);

    if (existing) {
      const results = await this.db
        .update(readingProgress)
        .set({
          chapterId: data.chapterId,
          chunkIndex: data.chunkIndex,
          playbackPosition: data.playbackPosition,
          updatedAt: new Date(),
        })
        .where(eq(readingProgress.bookId, bookId))
        .returning();
      return results[0];
    }

    const results = await this.db
      .insert(readingProgress)
      .values({ bookId, ...data })
      .returning();
    return results[0];
  }

  async remove(bookId: string): Promise<void> {
    await this.db
      .delete(readingProgress)
      .where(eq(readingProgress.bookId, bookId));
  }
}
