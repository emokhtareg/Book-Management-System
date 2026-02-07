'use client';

import { useRouter } from 'next/navigation';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

export default function AppNavbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/books">Book Management</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/books">Books</Nav.Link>
          <Nav.Link href="/books/create">Create Book</Nav.Link>
          <Nav.Link href="/reports">Reports</Nav.Link>
          <Nav.Link href="/notifications">Notifications</Nav.Link>
        </Nav>
        <Nav>
          {username && (
            <Navbar.Text className="me-3">Welcome, {username}</Navbar.Text>
          )}
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
