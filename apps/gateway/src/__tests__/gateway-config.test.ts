import { describe, it, expect, beforeAll } from 'vitest';
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

describe('GET /gateway/config', () => {
  it('requires auth', async () => {
    const res = await app.request('/gateway/config');
    expect(res.status).toBe(401);
  });

  it('returns gateway config with defaults', async () => {
    delete process.env['PORT'];
    delete process.env['OPENCODE_HOST'];
    delete process.env['OPENCODE_PORT'];

    const res = await app.request('/gateway/config', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      port: 3100,
      opencodeHost: 'localhost',
      opencodePort: 4096,
    });
  });

  it('returns gateway config from env vars', async () => {
    process.env['PORT'] = '9000';
    process.env['OPENCODE_HOST'] = '10.0.0.1';
    process.env['OPENCODE_PORT'] = '5555';

    const res = await app.request('/gateway/config', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      port: 9000,
      opencodeHost: '10.0.0.1',
      opencodePort: 5555,
    });

    // cleanup
    delete process.env['PORT'];
    delete process.env['OPENCODE_HOST'];
    delete process.env['OPENCODE_PORT'];
  });
});
