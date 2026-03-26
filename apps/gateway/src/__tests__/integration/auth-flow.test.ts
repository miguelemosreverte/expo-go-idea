import { describe, it, expect } from 'vitest';
import { sign } from 'hono/jwt';
import { app, getAuthToken, authRequest } from './setup.js';

describe('Integration: Auth Flow', () => {
  it('rejects login with wrong password and returns 401', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid password');
  });

  it('returns a token for correct password', async () => {
    const token = await getAuthToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('grants access to protected route with valid token', async () => {
    const res = await authRequest('/permissions/pending');
    // permissions/pending is in-memory, no proxy needed
    expect(res.status).toBe(200);
  });

  it('rejects protected route with no token', async () => {
    const res = await app.request('/permissions/pending');
    expect(res.status).toBe(401);
  });

  it('rejects protected route with invalid token', async () => {
    const res = await app.request('/permissions/pending', {
      headers: { Authorization: 'Bearer not.a.valid.token' },
    });
    expect(res.status).toBe(401);
  });

  it('rejects protected route with token signed by wrong secret', async () => {
    const badToken = await sign(
      { sub: 'gateway-user', iat: Math.floor(Date.now() / 1000) },
      'wrong-secret',
      'HS256',
    );

    const res = await app.request('/permissions/pending', {
      headers: { Authorization: `Bearer ${badToken}` },
    });
    expect(res.status).toBe(401);
  });

  it('rejects login with missing password field', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Password is required');
  });
});
