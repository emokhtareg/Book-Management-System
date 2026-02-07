'use client';

import { useEffect, useState } from 'react';
import { Container, Card, Table } from 'react-bootstrap';
import AppNavbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Book } from '@/types';

export default function ReportsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byGenre: {} as Record<string, number>,
    byYear: {} as Record<number, number>,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data: Book[] = await response.json();
        setBooks(data);

        // Calculate statistics
        const genreCount: Record<string, number> = {};
        const yearCount: Record<number, number> = {};

        data.forEach(book => {
          genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
          yearCount[book.publishedYear] = (yearCount[book.publishedYear] || 0) + 1;
        });

        setStats({
          total: data.length,
          byGenre: genreCount,
          byYear: yearCount,
        });
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppNavbar />
      <Container className="mt-4">
        <h1 className="mb-4">Reports</h1>

        <div className="row mb-4">
          <div className="col-md-4">
            <Card>
              <Card.Body>
                <Card.Title>Total Books</Card.Title>
                <h2>{stats.total}</h2>
              </Card.Body>
            </Card>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <Card>
              <Card.Body>
                <Card.Title>Books by Genre</Card.Title>
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
                        <th>Genre</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byGenre).map(([genre, count]) => (
                        <tr key={genre}>
                          <td>{genre}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-6">
            <Card>
              <Card.Body>
                <Card.Title>Books by Year</Card.Title>
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
                        <th>Year</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byYear)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .map(([year, count]) => (
                          <tr key={year}>
                            <td>{year}</td>
                            <td>{count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        <Card>
          <Card.Body>
            <Card.Title>All Books</Card.Title>
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
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Published Year</th>
                    <th>Genre</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.publishedYear}</td>
                      <td>{book.genre}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </ProtectedRoute>
  );
}
