import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import app from '../app.js';

let token: string;

beforeAll(async () => {
  process.env['JWT_SECRET'] = 'test-secret';
  process.env['GATEWAY_PASSWORD'] = 'test-password';

  const res = await app.request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'test-password' }),
  });
  const body = (await res.json()) as { token: string };
  token = body.token;
});

beforeEach(() => {
  vi.restoreAllMocks();
});

const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

describe('GET /browser/status', () => {
  it('requires auth', async () => {
    const res = await app.request('/browser/status');
    expect(res.status).toBe(401);
  });

  it('returns browser status', async () => {
    const res = await app.request('/browser/status', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('connected');
    expect(body).toHaveProperty('currentUrl');
    expect(body).toHaveProperty('tabCount');
  });
});

describe('POST /browser/action', () => {
  it('requires auth', async () => {
    const res = await app.request('/browser/action', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('creates a browser action', async () => {
    const res = await app.request('/browser/action', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ type: 'navigate', args: { url: 'https://example.com' } }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; type: string; status: string };
    expect(body.type).toBe('navigate');
    expect(body.status).toBe('pending');
    expect(body.id).toBeDefined();
  });

  it('rejects invalid action type', async () => {
    const res = await app.request('/browser/action', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ type: 'invalid', args: {} }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /browser/screenshot', () => {
  it('requires auth', async () => {
    const res = await app.request('/browser/screenshot');
    expect(res.status).toBe(401);
  });

  it('returns a placeholder screenshot response', async () => {
    const res = await app.request('/browser/screenshot', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });
});

describe('POST /browser/action/:id/approve', () => {
  it('requires auth', async () => {
    const res = await app.request('/browser/action/abc/approve', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('approves a pending action', async () => {
    // Create an action first
    const createRes = await app.request('/browser/action', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ type: 'click', args: { selector: '#btn' } }),
    });
    const action = (await createRes.json()) as { id: string };

    const res = await app.request(`/browser/action/${action.id}/approve`, {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('approved');
  });

  it('returns 404 for unknown action', async () => {
    const res = await app.request('/browser/action/nonexistent/approve', {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(404);
  });
});

describe('POST /browser/action/:id/deny', () => {
  it('denies a pending action', async () => {
    const createRes = await app.request('/browser/action', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ type: 'type', args: { text: 'hello' } }),
    });
    const action = (await createRes.json()) as { id: string };

    const res = await app.request(`/browser/action/${action.id}/deny`, {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('denied');
  });
});
