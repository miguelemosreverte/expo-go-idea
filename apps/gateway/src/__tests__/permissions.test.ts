import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import app from '../app.js';
import {
  addPendingPermission,
  clearPendingPermissions,
} from '../routes/permissions.js';

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
  clearPendingPermissions();
  vi.restoreAllMocks();
});

const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

describe('GET /permissions/pending', () => {
  it('returns empty array when no pending permissions', async () => {
    const res = await app.request('/permissions/pending', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('returns pending permissions', async () => {
    addPendingPermission({
      id: 'p1',
      sessionId: 's1',
      tool: 'file_write',
      args: { path: '/tmp/test' },
      timestamp: '2024-01-01T00:00:00Z',
    });

    const res = await app.request('/permissions/pending', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('p1');
    expect(body[0].tool).toBe('file_write');
  });
});

describe('POST /permissions/:id/respond', () => {
  it('returns 400 when response is missing', async () => {
    addPendingPermission({
      id: 'p1',
      sessionId: 's1',
      tool: 'file_write',
      args: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    const res = await app.request('/permissions/p1/respond', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown permission', async () => {
    const res = await app.request('/permissions/unknown/respond', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ response: 'allow_once' }),
    });
    expect(res.status).toBe(404);
  });

  it('responds to permission and proxies to OpenCode', async () => {
    addPendingPermission({
      id: 'p1',
      sessionId: 's1',
      tool: 'file_write',
      args: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await app.request('/permissions/p1/respond', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ response: 'allow_once' }),
    });
    expect(res.status).toBe(200);

    // Permission should be removed from pending
    const pendingRes = await app.request('/permissions/pending', {
      headers: authHeaders(),
    });
    const pending = await pendingRes.json();
    expect(pending).toEqual([]);
  });
});
