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

describe('GET /global/event', () => {
  it('returns SSE content type', async () => {
    // Mock a stream that ends immediately
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('event: message\ndata: {"type":"ping"}\n\n'),
        );
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    );

    const res = await app.request('/global/event', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });

  it('streams error event when OpenCode is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 502 }),
    );

    const res = await app.request('/global/event', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('error');
  });

  it('requires authentication', async () => {
    const res = await app.request('/global/event');
    expect(res.status).toBe(401);
  });
});
