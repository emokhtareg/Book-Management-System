import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getBookById, updateBook, deleteBook } from '@/lib/books';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const book = getBookById(id);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Only include properties that are actually provided (not undefined)
    const updateData: Partial<Omit<Book, 'id' | 'createdAt'>> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.isbn !== undefined) updateData.isbn = body.isbn;
    if (body.publishedYear !== undefined) {
      updateData.publishedYear = typeof body.publishedYear === 'string' 
        ? parseInt(body.publishedYear) 
        : body.publishedYear;
    }
    if (body.genre !== undefined) updateData.genre = body.genre;

    const updatedBook = updateBook(id, updateData);

    if (!updatedBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Emit socket event (fire and forget)
    try {
      const io = (global as any).io;
      if (io) {
        io.emit('book-updated', {
          message: `Book "${updatedBook.title}" has been updated`,
          book: updatedBook,
        });
      }
    } catch (err) {
      console.error('Error emitting socket event:', err);
    }

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = deleteBook(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Emit socket event (fire and forget)
    try {
      const io = (global as any).io;
      if (io) {
        io.emit('book-deleted', {
          message: `Book with ID "${id}" has been deleted`,
          bookId: id,
        });
      }
    } catch (err) {
      console.error('Error emitting socket event:', err);
    }

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
