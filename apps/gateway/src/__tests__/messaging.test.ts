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

describe('GET /messaging/channels', () => {
  it('requires auth', async () => {
    const res = await app.request('/messaging/channels');
    expect(res.status).toBe(401);
  });

  it('returns channel list', async () => {
    const res = await app.request('/messaging/channels', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe('POST /messaging/channels', () => {
  it('requires auth', async () => {
    const res = await app.request('/messaging/channels', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('creates a new channel', async () => {
    const res = await app.request('/messaging/channels', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ channel: 'whatsapp', connected: false, pairingRequired: true }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { channel: string };
    expect(body.channel).toBe('whatsapp');
  });

  it('rejects invalid channel type', async () => {
    const res = await app.request('/messaging/channels', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ channel: 'slack', connected: false, pairingRequired: false }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /messaging/channels/:id/conversations', () => {
  it('requires auth', async () => {
    const res = await app.request('/messaging/channels/whatsapp/conversations');
    expect(res.status).toBe(401);
  });

  it('returns conversations for a channel', async () => {
    // Ensure channel exists
    await app.request('/messaging/channels', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ channel: 'telegram', connected: true, pairingRequired: false }),
    });

    const res = await app.request('/messaging/channels/telegram/conversations', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('returns 404 for unknown channel', async () => {
    const res = await app.request('/messaging/channels/unknown/conversations', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(404);
  });
});

describe('POST /messaging/channels/:id/send', () => {
  it('requires auth', async () => {
    const res = await app.request('/messaging/channels/whatsapp/send', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('sends a message through a channel', async () => {
    // Ensure channel exists
    await app.request('/messaging/channels', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ channel: 'whatsapp', connected: true, pairingRequired: false }),
    });

    const res = await app.request('/messaging/channels/whatsapp/send', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ peerId: 'user123', message: 'Hello!' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: boolean };
    expect(body.sent).toBe(true);
  });

  it('returns 404 for unknown channel', async () => {
    const res = await app.request('/messaging/channels/unknown/send', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ peerId: 'user123', message: 'Hello!' }),
    });
    expect(res.status).toBe(404);
  });
});
