import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../config/database.module';
import {
  chapters,
  books,
  type Chapter,
  type NewChapter,
} from '@audiary/database';

@Injectable()
export class ChaptersService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findByBook(bookId: string): Promise<Chapter[]> {
    return this.db
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(chapters.order);
  }

  async findOne(id: string): Promise<Chapter> {
    const results = await this.db
      .select()
      .from(chapters)
      .where(eq(chapters.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundException(`Chapter with id "${id}" not found`);
    }

    return results[0];
  }

  async create(
    bookId: string,
    data: Omit<NewChapter, 'id' | 'bookId'>,
  ): Promise<Chapter> {
    // Auto-assign order if not provided
    if (data.order === undefined) {
      const existing = await this.findByBook(bookId);
      data.order = existing.length;
    }

    const results = await this.db
      .insert(chapters)
      .values({ ...data, bookId })
      .returning();

    // Update total chapters count on the book
    const allChapters = await this.findByBook(bookId);
    await this.db
      .update(books)
      .set({ totalChapters: allChapters.length, updatedAt: new Date() })
      .where(eq(books.id, bookId));

    return results[0];
  }

  async update(id: string, data: Partial<NewChapter>): Promise<Chapter> {
    await this.findOne(id); // ensure exists
    const results = await this.db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, id))
      .returning();
    return results[0];
  }

  async remove(id: string): Promise<void> {
    const chapter = await this.findOne(id);
    await this.db.delete(chapters).where(eq(chapters.id, id));

    // Update total chapters count
    const remaining = await this.findByBook(chapter.bookId);
    await this.db
      .update(books)
      .set({ totalChapters: remaining.length, updatedAt: new Date() })
      .where(eq(books.id, chapter.bookId));
  }
}
