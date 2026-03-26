import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../app.js';

describe('GET /health', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env['OPENCODE_HOST'] = 'localhost';
  });

  it('returns degraded when OpenCode is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Connection refused')),
    );

    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('degraded');
    expect(body.opencode).toBe('disconnected');
    expect(body.timestamp).toBeDefined();
  });

  it('returns ok when OpenCode is reachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 200 })),
    );

    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.opencode).toBe('connected');
    expect(body.timestamp).toBeDefined();
  });

  it('returns degraded when OpenCode returns non-ok status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 500 })),
    );

    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('degraded');
    expect(body.opencode).toBe('disconnected');
  });
});
