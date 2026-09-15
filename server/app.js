import express from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const SESSION_MS = 60 * 60 * 1000;
const COOKIE = 'login_lab_session';
const DEMO_USER = { id: 'demo-1', name: 'Demo Viewer', email: 'demo@example.com' };

export function createApp() {
  const app = express();
  const sessions = new Map();
  app.disable('x-powered-by');

  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    // Expired sessions are removed on requests, without a background timer.
    for (const [token, session] of sessions) {
      if (session.expiresAt <= Date.now()) sessions.delete(token);
    }
    const cookie = req.headers.cookie?.split(';').map(part => part.trim())
      .find(part => part.startsWith(`${COOKIE}=`));
    req.sessionToken = cookie?.slice(COOKIE.length + 1);
    req.session = sessions.get(req.sessionToken);
    next();
  });
  app.use(express.json({ limit: '4kb' }));

  app.post('/api/login', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    // Deliberately static credentials for the assignment. Never use real passwords here.
    if (email !== DEMO_USER.email || password !== 'Demo@123') {
      return res.status(401).json({ message: 'Incorrect email or password. Try the demo credentials below.' });
    }
    if (req.sessionToken) sessions.delete(req.sessionToken);
    const token = randomUUID();
    sessions.set(token, { user: DEMO_USER, expiresAt: Date.now() + SESSION_MS });
    res.cookie(COOKIE, token, {
      httpOnly: true, sameSite: 'lax', secure: req.secure, path: '/', maxAge: SESSION_MS,
    });
    res.json({ user: DEMO_USER });
  });

  app.get('/api/me', (req, res) => {
    if (!req.session) return res.status(401).json({ message: 'Please sign in to continue.' });
    res.json({ user: req.session.user });
  });

  app.post('/api/logout', (req, res) => {
    sessions.delete(req.sessionToken);
    res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: req.secure, path: '/' });
    res.json({ message: 'Signed out successfully.' });
  });

  app.use('/api', (_req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
  app.use(express.static(dist));
  // Express serves the built React app, including direct /dashboard requests.
  app.get('/{*path}', (_req, res, next) => {
    res.sendFile(path.join(dist, 'index.html'), error => { if (error) next(error); });
  });
  app.use((error, _req, res, _next) => {
    const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
    const message = status === 413 ? 'Request is too large.'
      : status === 400 ? 'Request must contain valid JSON.' : 'Something went wrong. Please try again.';
    res.status(status).json({ message });
  });
  return app;
}
