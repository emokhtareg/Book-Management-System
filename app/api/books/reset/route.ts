import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { clearAllBooks } from '@/lib/books';

// This endpoint is for testing purposes - clears all books
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    clearAllBooks();
    return NextResponse.json({ message: 'All books cleared' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
