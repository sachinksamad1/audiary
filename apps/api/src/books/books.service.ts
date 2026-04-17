import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../config/database.module';
import { books, type Book, type NewBook } from '@audiary/database';

@Injectable()
export class BooksService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async findAll(): Promise<Book[]> {
    return this.db.select().from(books).orderBy(books.createdAt);
  }

  async findOne(id: string): Promise<Book> {
    const results = await this.db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    return results[0];
  }

  async findOneWithChapters(id: string) {
    const book = await this.findOne(id);

    const { chapters } = await import('@audiary/database');
    const chapterList = await this.db
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, id))
      .orderBy(chapters.order);

    return { ...book, chapters: chapterList };
  }

  async create(data: Omit<NewBook, 'id'>): Promise<Book> {
    const results = await this.db.insert(books).values(data).returning();
    return results[0];
  }

  async update(id: string, data: Partial<NewBook>): Promise<Book> {
    await this.findOne(id); // ensure exists
    const results = await this.db
      .update(books)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return results[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // ensure exists
    await this.db.delete(books).where(eq(books.id, id));
  }
}
