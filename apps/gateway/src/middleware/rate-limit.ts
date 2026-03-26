import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export interface RateLimitConfig {
  rpm: number;
  loginRpm: number;
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    rpm: parseInt(process.env['RATE_LIMIT_RPM'] ?? '100', 10),
    loginRpm: parseInt(process.env['RATE_LIMIT_LOGIN_RPM'] ?? '5', 10),
  };
}

export class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    const defaults = getRateLimitConfig();
    this.config = { ...defaults, ...config };
  }

  /** Returns true if the request is allowed, false if rate limited. */
  consume(key: string, isLogin: boolean): boolean {
    const limit = isLogin ? this.config.loginRpm : this.config.rpm;
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket) {
      this.buckets.set(key, { tokens: limit - 1, lastRefill: now });
      return true;
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const refill = Math.floor((elapsed / 60_000) * limit);
    if (refill > 0) {
      bucket.tokens = Math.min(limit, bucket.tokens + refill);
      bucket.lastRefill = now;
    }

    if (bucket.tokens <= 0) {
      return false;
    }

    bucket.tokens--;
    return true;
  }

  /** Reset all buckets (useful for testing). */
  reset(): void {
    this.buckets.clear();
  }
}

const globalLimiter = new RateLimiter();

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? '127.0.0.1';
  const isLogin = c.req.path === '/auth/login';
  const key = isLogin ? `login:${ip}` : `general:${ip}`;

  if (!globalLimiter.consume(key, isLogin)) {
    throw new HTTPException(429, { message: 'Too Many Requests' });
  }

  await next();
});

export { globalLimiter };
