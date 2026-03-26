import { describe, it, expect, beforeAll } from 'vitest';
import app from '../app.js';

beforeAll(() => {
  process.env['JWT_SECRET'] = 'test-secret';
  process.env['GATEWAY_PASSWORD'] = 'test-password';
});

describe('POST /auth/login', () => {
  it('returns 400 when password is missing', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Password is required');
  });

  it('returns 401 for invalid password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid password');
  });

  it('returns JWT token for correct password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'test-password' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
  });
});

describe('Auth middleware', () => {
  it('allows /health without auth', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });

  it('blocks protected routes without token', async () => {
    const res = await app.request('/session');
    expect(res.status).toBe(401);
  });

  it('allows protected routes with valid token', async () => {
    // First login to get a token
    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'test-password' }),
    });
    const { token } = (await loginRes.json()) as { token: string };

    // Use token to access a protected route (will fail at proxy level, but auth should pass)
    const res = await app.request('/permissions/pending', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Should not be 401 - permissions/pending returns in-memory data, no proxy needed
    expect(res.status).toBe(200);
  });

  it('rejects invalid token', async () => {
    const res = await app.request('/session', {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(res.status).toBe(401);
  });
});
