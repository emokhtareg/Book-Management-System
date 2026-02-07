import { Server } from 'socket.io';
import { createServer } from 'http';
import next from 'next';
import { setSocketInstance } from './lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // Socket.io server - attach to the same HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/',
  });

  // Set socket instance for use in API routes
  setSocketInstance(io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server available at http://${hostname}:${port}/socket.io/`);
  });
});
