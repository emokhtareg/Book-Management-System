'use client';

import { useEffect, useState } from 'react';
import { Container, Card, ListGroup, Badge } from 'react-bootstrap';
import { io, Socket } from 'socket.io-client';
import AppNavbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Notification } from '@/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('book-created', (data: { message: string; book: any }) => {
      console.log('Received book-created event:', data);
      addNotification({
        id: Date.now().toString(),
        message: data.message,
        type: 'create',
        timestamp: new Date().toISOString(),
      });
    });

    newSocket.on('book-updated', (data: { message: string; book: any }) => {
      console.log('Received book-updated event:', data);
      addNotification({
        id: Date.now().toString(),
        message: data.message,
        type: 'update',
        timestamp: new Date().toISOString(),
      });
    });

    newSocket.on('book-deleted', (data: { message: string; bookId: string }) => {
      console.log('Received book-deleted event:', data);
      addNotification({
        id: Date.now().toString(),
        message: data.message,
        type: 'delete',
        timestamp: new Date().toISOString(),
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <ProtectedRoute>
      <AppNavbar />
      <Container className="mt-4">
        <h1 className="mb-4">Notifications</h1>
        <Card>
          <Card.Body>
            <Card.Title>Real-time Notifications</Card.Title>
            <div className="mb-3">
              {isConnected ? (
                <Badge bg="success">Connected</Badge>
              ) : (
                <>
                  <Badge bg="danger" className="me-2">Disconnected</Badge>
                  <small className="text-muted">Make sure the server is running and try refreshing the page.</small>
                </>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted">No notifications yet. Perform CRUD operations to see notifications here.</p>
            ) : (
              <ListGroup>
                {notifications.map((notification) => (
                  <ListGroup.Item key={notification.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <Badge bg={getBadgeVariant(notification.type)} className="me-2">
                          {notification.type.toUpperCase()}
                        </Badge>
                        {notification.message}
                      </div>
                      <small className="text-muted">
                        {new Date(notification.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
    </ProtectedRoute>
  );
}
