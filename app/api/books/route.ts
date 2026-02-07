import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllBooks, createBook } from '@/lib/books';
import { Book } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const books = getAllBooks();
    return NextResponse.json(books, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, author, isbn, publishedYear, genre } = body;

    if (!title || !author || !isbn || !publishedYear || !genre) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newBook = createBook({
      title,
      author,
      isbn,
      publishedYear: parseInt(publishedYear),
      genre,
    });

    // Emit socket event (fire and forget)
    try {
      const io = (global as any).io;
      if (io) {
        io.emit('book-created', {
          message: `Book "${newBook.title}" has been created`,
          book: newBook,
        });
      }
    } catch (err) {
      console.error('Error emitting socket event:', err);
    }
    
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
