import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserCredentials {
  username: string;
  password: string;
}

export const USERS: UserCredentials[] = [
  { username: 'admin', password: 'admin' },
  { username: 'demo', password: 'demo' },
];

export function verifyUser(username: string, password: string): UserCredentials | null {
  const user = USERS.find(u => u.username === username && u.password === password);
  return user || null;
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string };
  } catch {
    return null;
  }
}
