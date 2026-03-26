import { Hono } from 'hono';
import { sign } from 'hono/jwt';

const auth = new Hono();

auth.post('/login', async (c) => {
  const body = await c.req.json<{ password?: string }>();

  if (!body.password) {
    return c.json({ error: 'Password is required' }, 400);
  }

  const gatewayPassword = process.env['GATEWAY_PASSWORD'] ?? 'gaucho';

  if (body.password !== gatewayPassword) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  const secret = process.env['JWT_SECRET'] ?? 'change-me-in-production';
  const token = await sign(
    { sub: 'gateway-user', iat: Math.floor(Date.now() / 1000) },
    secret,
    'HS256',
  );

  return c.json({ token });
});

export default auth;
