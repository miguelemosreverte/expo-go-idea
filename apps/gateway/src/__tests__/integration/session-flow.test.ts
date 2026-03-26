import { describe, it, expect } from 'vitest';
import { app, getAuthToken, authRequest } from './setup.js';

describe('Integration: Session Flow', () => {
  it('requires authentication to access sessions', async () => {
    const res = await app.request('/session');
    expect(res.status).toBe(401);
  });

  it('login -> list sessions (proxy fails gracefully since OpenCode is not running)', async () => {
    // Step 1: Login
    const token = await getAuthToken();
    expect(token).toBeDefined();

    // Step 2: Try to list sessions - will fail at proxy level since OpenCode is not up
    // The gateway should handle the proxy error via the error handler
    const res = await authRequest('/session', { token });
    // Auth passes (not 401), but proxy to OpenCode fails (500 or similar)
    expect(res.status).not.toBe(401);
  });

  it('login -> create session (proxy fails gracefully)', async () => {
    const token = await getAuthToken();

    const res = await authRequest('/session', {
      method: 'POST',
      body: {},
      token,
    });
    // Auth passes, proxy fails
    expect(res.status).not.toBe(401);
  });

  it('login -> send message to session (proxy fails gracefully)', async () => {
    const token = await getAuthToken();

    const res = await authRequest('/session/test-session-id/message', {
      method: 'POST',
      body: { content: 'Hello from integration test' },
      token,
    });
    // Auth passes, proxy fails
    expect(res.status).not.toBe(401);
  });

  it('full flow: login -> access multiple protected endpoints', async () => {
    const token = await getAuthToken();

    // All these should pass auth (not 401) even if proxy fails
    const endpoints = [
      { path: '/session', method: 'GET' },
      { path: '/permissions/pending', method: 'GET' },
      { path: '/gateway/config', method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      const res = await authRequest(endpoint.path, {
        method: endpoint.method,
        token,
      });
      expect(res.status).not.toBe(401);
    }
  });

  it('health endpoint is always accessible without auth', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; opencode: string; timestamp: string };
    expect(body.status).toBeDefined();
    expect(body.opencode).toBe('disconnected'); // No OpenCode running
    expect(body.timestamp).toBeDefined();
  });
});
