import { createMiddleware } from 'hono/factory';

function generateId(): string {
  return crypto.randomUUID();
}

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const requestId = c.req.header('x-request-id') ?? generateId();
  c.set('requestId', requestId);

  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  const log = {
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    method,
    path,
    status,
    duration_ms: duration,
    request_id: requestId,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(log));

  c.res.headers.set('x-request-id', requestId);
});
