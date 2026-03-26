import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { errorHandler } from '../middleware/error-handler.js';

function createTestApp() {
  const app = new Hono();
  app.onError(errorHandler);

  app.get('/throw-generic', () => {
    throw new Error('Something broke');
  });

  app.get('/throw-http', () => {
    throw new HTTPException(403, { message: 'Forbidden' });
  });

  app.get('/ok', (c) => c.json({ ok: true }));

  return app;
}

describe('error handler middleware', () => {
  it('returns 500 with consistent JSON for generic errors', async () => {
    const app = createTestApp();
    const res = await app.request('/throw-generic');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'Internal Server Error', status: 500 });
  });

  it('returns correct status for HTTPException', async () => {
    const app = createTestApp();
    const res = await app.request('/throw-http');
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden', status: 403 });
  });

  it('does not interfere with normal responses', async () => {
    const app = createTestApp();
    const res = await app.request('/ok');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });
});
