/**
 * useBooks — Book CRUD operations composable
 */
import type { Book, BookWithChapters, CreateBookRequest, UpdateBookRequest } from '@audiary/types';

export function useBooks() {
  const api = useApi();
  const books = useState<Book[]>('books', () => []);
  const loading = useState('books-loading', () => false);
  const error = useState<string | null>('books-error', () => null);

  async function fetchBooks() {
    loading.value = true;
    error.value = null;
    try {
      books.value = await api.get<Book[]>('/books');
    } catch (err: any) {
      error.value = err.message;
      console.error('[useBooks] Failed to fetch books:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchBook(id: string): Promise<BookWithChapters | null> {
    try {
      return await api.get<BookWithChapters>(`/books/${id}`);
    } catch (err: any) {
      error.value = err.message;
      return null;
    }
  }

  async function createBook(data: CreateBookRequest): Promise<Book | null> {
    try {
      const book = await api.post<Book>('/books', data);
      books.value = [...books.value, book];
      return book;
    } catch (err: any) {
      error.value = err.message;
      return null;
    }
  }

  async function updateBook(id: string, data: UpdateBookRequest): Promise<Book | null> {
    try {
      const updated = await api.put<Book>(`/books/${id}`, data);
      books.value = books.value.map((b) => (b.id === id ? updated : b));
      return updated;
    } catch (err: any) {
      error.value = err.message;
      return null;
    }
  }

  async function deleteBook(id: string): Promise<boolean> {
    try {
      await api.delete(`/books/${id}`);
      books.value = books.value.filter((b) => b.id !== id);
      return true;
    } catch (err: any) {
      error.value = err.message;
      return false;
    }
  }

  return {
    books,
    loading,
    error,
    fetchBooks,
    fetchBook,
    createBook,
    updateBook,
    deleteBook,
  };
}
