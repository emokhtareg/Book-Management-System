import { NextRequest, NextResponse } from 'next/server';

// This endpoint is called by API routes to emit socket events
// The actual socket server will handle the emission
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();
    
    // Emit event via the socket instance
    const io = (global as any).io;
    if (io) {
      io.emit(event, data);
      console.log(`Socket event emitted: ${event}`, data);
      return NextResponse.json({ success: true, event, data }, { status: 200 });
    } else {
      console.warn('Socket.io instance not available');
      return NextResponse.json(
        { error: 'Socket.io instance not available' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error emitting socket event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
