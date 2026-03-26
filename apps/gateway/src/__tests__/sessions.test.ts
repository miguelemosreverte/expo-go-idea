import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import app from '../app.js';

let token: string;

beforeAll(async () => {
  process.env['JWT_SECRET'] = 'test-secret';
  process.env['GATEWAY_PASSWORD'] = 'test-password';
  process.env['OPENCODE_HOST'] = 'localhost';
  process.env['OPENCODE_PORT'] = '4096';

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

describe('GET /session', () => {
  it('proxies list sessions to OpenCode', async () => {
    const mockSessions = [{ id: 's1', title: 'Test' }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockSessions), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await app.request('/session', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockSessions);
  });
});

describe('POST /session', () => {
  it('proxies create session to OpenCode', async () => {
    const created = { id: 's2', title: 'New' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(created), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await app.request('/session', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title: 'New' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(created);
  });
});

describe('GET /session/:id', () => {
  it('proxies get session to OpenCode', async () => {
    const session = { id: 's1', title: 'Test' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(session), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await app.request('/session/s1', { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(session);
  });
});

describe('POST /session/:id/message', () => {
  it('proxies send message to OpenCode', async () => {
    const message = { id: 'm1', content: 'Hello' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(message), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await app.request('/session/s1/message', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content: 'Hello' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(message);
  });

  it('calls correct OpenCode URL', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await app.request('/session/abc123/message', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content: 'test' }),
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:4096/session/abc123/message',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
