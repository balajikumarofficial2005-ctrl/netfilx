import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

let server;
let origin;
const credentials = { email: 'demo@example.com', password: 'Demo@123' };

before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

function post(path, body, cookie) {
  return fetch(`${origin}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

async function login() {
  const response = await post('/api/login', credentials);
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}

test('an anonymous user cannot access the current-user endpoint', async () => {
  const response = await fetch(`${origin}/api/me`);
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('missing, empty, and non-string credentials are rejected', async () => {
  for (const body of [{}, { email: '', password: '' }, { email: 'demo@example.com' }, { email: ['demo@example.com'], password: 'Demo@123' }, { email: 'demo@example.com', password: 123 }]) {
    const response = await post('/api/login', body);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, 'Email and password are required.');
  }
});

test('an invalid email format is rejected', async () => {
  const response = await post('/api/login', { ...credentials, email: 'not-an-email' });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /valid email/);
});

test('incorrect email and password return the same generic error', async () => {
  const wrongEmail = await post('/api/login', { ...credentials, email: 'nobody@example.com' });
  const wrongPassword = await post('/api/login', { ...credentials, password: 'wrong' });
  assert.equal(wrongEmail.status, 401);
  assert.equal(wrongPassword.status, 401);
  assert.deepEqual(await wrongEmail.json(), await wrongPassword.json());
  assert.equal(wrongPassword.headers.get('set-cookie'), null);
});

test('successful login sets an HttpOnly session and never returns the password', async () => {
  const response = await post('/api/login', credentials);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: { id: 'demo-1', name: 'Demo Viewer', email: 'demo@example.com' } });
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=3600/);
});

test('email is normalized but passwords remain case-sensitive and untrimmed', async () => {
  const normalized = await post('/api/login', { ...credentials, email: ' DEMO@EXAMPLE.COM ' });
  assert.equal(normalized.status, 200);
  for (const password of ['demo@123', 'Demo@123 ']) {
    assert.equal((await post('/api/login', { ...credentials, password })).status, 401);
  }
});

test('a session identifies the user on subsequent requests', async () => {
  const cookie = await login();
  const response = await fetch(`${origin}/api/me`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user.email, credentials.email);
});

test('a new login rotates and invalidates the previous session', async () => {
  const oldCookie = await login();
  const response = await post('/api/login', credentials, oldCookie);
  const newCookie = response.headers.get('set-cookie').split(';')[0];
  assert.notEqual(oldCookie, newCookie);
  assert.equal((await fetch(`${origin}/api/me`, { headers: { Cookie: oldCookie } })).status, 401);
  assert.equal((await fetch(`${origin}/api/me`, { headers: { Cookie: newCookie } })).status, 200);
});

test('logout clears the cookie and invalidates the server session', async () => {
  const cookie = await login();
  const response = await post('/api/logout', {}, cookie);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  assert.equal((await fetch(`${origin}/api/me`, { headers: { Cookie: cookie } })).status, 401);
  assert.equal((await post('/api/logout', {})).status, 200);
});

test('tampered cookies are treated as anonymous', async () => {
  const response = await fetch(`${origin}/api/me`, { headers: { Cookie: 'login_lab_session=made-up; theme=dark' } });
  assert.equal(response.status, 401);
});

test('malformed JSON and oversized requests return useful JSON errors', async () => {
  const malformed = await fetch(`${origin}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(malformed.status, 400);
  assert.match((await malformed.json()).message, /valid JSON/);
  const oversized = await post('/api/login', { ...credentials, padding: 'x'.repeat(5000) });
  assert.equal(oversized.status, 413);
});

test('unknown API routes return JSON, not the frontend HTML', async () => {
  const response = await fetch(`${origin}/api/unknown`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).message, 'API endpoint not found.');
});
