export interface User {
  username: string;
  password: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'create' | 'update' | 'delete';
  timestamp: string;
}
