'use client';

import { useEffect, useState } from 'react';
import { Container, Table, Button, Alert, Modal } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import AppNavbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Book } from '@/types';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        setError('Failed to fetch books');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      const response = await fetch(`/api/books/${bookToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setBookToDelete(null);
        fetchBooks();
      } else {
        setError('Failed to delete book');
        setShowDeleteModal(false);
        setBookToDelete(null);
      }
    } catch (err) {
      setError('An error occurred while deleting the book');
      setShowDeleteModal(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  return (
    <ProtectedRoute>
      <AppNavbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Books List</h1>
          <Button variant="primary" onClick={() => router.push('/books/create')}>
            Add New Book
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Published Year</th>
                <th>Genre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    No books found. Create your first book!
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.publishedYear}</td>
                    <td>{book.genre}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => router.push(`/books/edit/${book.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(book)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {bookToDelete && (
              <>
                <p>Are you sure you want to delete this book?</p>
                <div className="border p-3 rounded bg-light">
                  <p className="mb-1"><strong>Title:</strong> {bookToDelete.title}</p>
                  <p className="mb-1"><strong>Author:</strong> {bookToDelete.author}</p>
                  <p className="mb-0"><strong>ISBN:</strong> {bookToDelete.isbn}</p>
                </div>
                <p className="mt-3 text-danger">
                  <small>This action cannot be undone.</small>
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Book
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
}
