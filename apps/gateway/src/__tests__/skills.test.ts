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

describe('GET /skills', () => {
  it('requires auth', async () => {
    const res = await app.request('/skills');
    expect(res.status).toBe(401);
  });

  it('returns skills list with seed data', async () => {
    const res = await app.request('/skills', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBeGreaterThan(0);
  });
});

describe('POST /skills/:name/toggle', () => {
  it('requires auth', async () => {
    const res = await app.request('/skills/code-review/toggle', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('toggles a skill', async () => {
    // Get initial state
    const listRes = await app.request('/skills', { headers: authHeaders() });
    const skills = (await listRes.json()) as Array<{ name: string; enabled: boolean }>;
    const skill = skills[0]!;
    const initialEnabled = skill.enabled;

    const res = await app.request(`/skills/${skill.name}/toggle`, {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { enabled: boolean };
    expect(body.enabled).toBe(!initialEnabled);
  });

  it('returns 404 for unknown skill', async () => {
    const res = await app.request('/skills/nonexistent/toggle', {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(404);
  });
});

describe('GET /plugins', () => {
  it('requires auth', async () => {
    const res = await app.request('/plugins');
    expect(res.status).toBe(401);
  });

  it('returns plugins list with seed data', async () => {
    const res = await app.request('/plugins', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBeGreaterThan(0);
  });
});

describe('POST /plugins/:name/toggle', () => {
  it('toggles a plugin', async () => {
    const listRes = await app.request('/plugins', { headers: authHeaders() });
    const plugins = (await listRes.json()) as Array<{ name: string; enabled: boolean }>;
    const plugin = plugins[0]!;
    const initialEnabled = plugin.enabled;

    const res = await app.request(`/plugins/${plugin.name}/toggle`, {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { enabled: boolean };
    expect(body.enabled).toBe(!initialEnabled);
  });

  it('returns 404 for unknown plugin', async () => {
    const res = await app.request('/plugins/nonexistent/toggle', {
      method: 'POST',
      headers: authHeaders(),
    });
    expect(res.status).toBe(404);
  });
});

describe('PUT /plugins/:name/config', () => {
  it('updates plugin config', async () => {
    const listRes = await app.request('/plugins', { headers: authHeaders() });
    const plugins = (await listRes.json()) as Array<{ name: string }>;
    const plugin = plugins[0]!;

    const res = await app.request(`/plugins/${plugin.name}/config`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ apiKey: 'new-key', verbose: true }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { config: Record<string, unknown> };
    expect(body.config).toEqual({ apiKey: 'new-key', verbose: true });
  });

  it('returns 404 for unknown plugin', async () => {
    const res = await app.request('/plugins/nonexistent/config', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ key: 'value' }),
    });
    expect(res.status).toBe(404);
  });
});
