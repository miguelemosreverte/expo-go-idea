import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';

const PUBLIC_PATHS = ['/health', '/auth/login', '/discovery', '/discovery/info'];

export const authMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.path;

  if (PUBLIC_PATHS.includes(path)) {
    return next();
  }

  const secret = process.env['JWT_SECRET'] ?? 'change-me-in-production';
  const jwtMiddleware = jwt({ secret, alg: 'HS256' });
  return jwtMiddleware(c, next);
});
