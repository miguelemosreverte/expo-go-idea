import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import app from '../app.js';
import { globalLimiter } from '../middleware/rate-limit.js';

beforeAll(() => {
  process.env['JWT_SECRET'] = 'test-secret';
  process.env['GATEWAY_PASSWORD'] = 'test-password';
});

beforeEach(() => {
  globalLimiter.reset();
});

describe('Logger middleware', () => {
  it('adds x-request-id header to responses', async () => {
    const res = await app.request('/health');
    expect(res.headers.get('x-request-id')).toBeDefined();
    expect(typeof res.headers.get('x-request-id')).toBe('string');
  });

  it('echoes back provided x-request-id', async () => {
    const customId = 'test-request-id-123';
    const res = await app.request('/health', {
      headers: { 'x-request-id': customId },
    });
    expect(res.headers.get('x-request-id')).toBe(customId);
  });

  it('generates a UUID when no x-request-id is provided', async () => {
    const res = await app.request('/health');
    const id = res.headers.get('x-request-id');
    expect(id).toBeTruthy();
    // UUID v4 format
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
