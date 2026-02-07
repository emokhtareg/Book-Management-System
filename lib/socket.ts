// Socket.io helper for emitting events
// This will be used by API routes to emit socket events

let ioInstance: any = null;

export function setSocketInstance(io: any) {
  ioInstance = io;
  // Also set it globally for API routes
  (global as any).io = io;
}

export async function emitBookCreated(book: any) {
  const eventData = {
    message: `Book "${book.title}" has been created`,
    book,
  };
  
  if (ioInstance) {
    // Use io.emit() to broadcast to all connected clients
    ioInstance.emit('book-created', eventData);
    console.log('Emitted book-created event:', eventData);
  } else {
    console.warn('Socket.io instance not available, event not emitted');
  }
}

export async function emitBookUpdated(book: any) {
  const eventData = {
    message: `Book "${book.title}" has been updated`,
    book,
  };
  
  if (ioInstance) {
    // Use io.emit() to broadcast to all connected clients
    ioInstance.emit('book-updated', eventData);
    console.log('Emitted book-updated event:', eventData);
  } else {
    console.warn('Socket.io instance not available, event not emitted');
  }
}

export async function emitBookDeleted(bookId: string) {
  const eventData = {
    message: `Book with ID "${bookId}" has been deleted`,
    bookId,
  };
  
  if (ioInstance) {
    // Use io.emit() to broadcast to all connected clients
    ioInstance.emit('book-deleted', eventData);
    console.log('Emitted book-deleted event:', eventData);
  } else {
    console.warn('Socket.io instance not available, event not emitted');
  }
}
