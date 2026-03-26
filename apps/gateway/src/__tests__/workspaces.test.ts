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

describe('GET /workspaces', () => {
  it('requires auth', async () => {
    const res = await app.request('/workspaces');
    expect(res.status).toBe(401);
  });

  it('proxies to OpenCode project list', async () => {
    const mockProjects = [
      { id: 'p1', name: 'Project 1', path: '/tmp/p1', isActive: true },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockProjects), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const res = await app.request('/workspaces', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockProjects);
  });
});

describe('POST /workspaces/switch', () => {
  it('requires auth', async () => {
    const res = await app.request('/workspaces/switch', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('proxies switch request to OpenCode', async () => {
    const mockResponse = { id: 'p2', name: 'Project 2', path: '/tmp/p2', isActive: true };
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', mockFetch);

    const res = await app.request('/workspaces/switch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'p2' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockResponse);

    // Verify it called the correct OpenCode endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/project/current'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
