import { Book } from '@/types';

// In-memory storage (replace with database in production)
let books: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    publishedYear: 1925,
    genre: 'Fiction',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    publishedYear: 1960,
    genre: 'Fiction',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getAllBooks(): Book[] {
  return books;
}

export function getBookById(id: string): Book | undefined {
  return books.find(book => book.id === id);
}

export function createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
  const newBook: Book = {
    ...bookData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  books.push(newBook);
  return newBook;
}

export function updateBook(id: string, bookData: Partial<Omit<Book, 'id' | 'createdAt'>>): Book | null {
  const index = books.findIndex(book => book.id === id);
  if (index === -1) return null;
  
  books[index] = {
    ...books[index],
    ...bookData,
    updatedAt: new Date().toISOString(),
  };
  return books[index];
}

export function deleteBook(id: string): boolean {
  const index = books.findIndex(book => book.id === id);
  if (index === -1) return false;
  books.splice(index, 1);
  return true;
}

// Reset books to initial state (useful for testing)
export function resetBooks(): void {
  books = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      publishedYear: 1925,
      genre: 'Fiction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      publishedYear: 1960,
      genre: 'Fiction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Clear all books (useful for testing)
export function clearAllBooks(): void {
  books = [];
}
