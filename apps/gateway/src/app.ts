import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { GatewayHealth } from '@gaucho/shared';
import { loggerMiddleware } from './middleware/logger.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { OpenCodeManager } from './lib/opencode-manager.js';
import auth from './routes/auth.js';
import sessions from './routes/sessions.js';
import events from './routes/events.js';
import permissions from './routes/permissions.js';
import workspaces from './routes/workspaces.js';
import gatewayConfig from './routes/gateway-config.js';
import push from './routes/push.js';
import browser from './routes/browser.js';
import messaging from './routes/messaging.js';
import skills from './routes/skills.js';
import { plugins } from './routes/skills.js';
import discovery from './routes/discovery.js';

const app = new Hono();

// Process manager
export const openCodeManager = new OpenCodeManager();

// Global error handler
app.onError(errorHandler);

// 1. Request logging (first - captures everything)
app.use('*', loggerMiddleware);

// 2. CORS
const corsOrigins = process.env['CORS_ORIGINS'];
const isProduction = process.env['NODE_ENV'] === 'production';

app.use(
  '*',
  cors({
    origin: corsOrigins
      ? corsOrigins.split(',').map((o) => o.trim())
      : isProduction
        ? []
        : ['*'],
    credentials: true,
  }),
);

// 3. Rate limiting
app.use('*', rateLimitMiddleware);

// Health check (public) - checks OpenCode connectivity
app.get('/health', async (c) => {
  const host = process.env['OPENCODE_HOST'] ?? 'localhost';
  const port = process.env['OPENCODE_PORT'] ?? '4096';
  let opencodeStatus: 'connected' | 'disconnected' = 'disconnected';
  let status: 'ok' | 'degraded' = 'degraded';

  try {
    const res = await fetch(`http://${host}:${port}/global/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      opencodeStatus = 'connected';
      status = 'ok';
    }
  } catch {
    // OpenCode unreachable
  }

  const health: GatewayHealth = {
    status,
    opencode: opencodeStatus,
    timestamp: new Date().toISOString(),
  };

  return c.json(health);
});

// Discovery (public, before auth)
app.route('/discovery', discovery);

// 4. JWT auth middleware (skips /health and /auth/login)
app.use('*', authMiddleware);

// Reload endpoint - restart OpenCode via process manager
app.post('/reload', async (c) => {
  await openCodeManager.restart();
  return c.json({ message: 'OpenCode restarted' });
});

// Routes
app.route('/auth', auth);
app.route('/session', sessions);
app.route('/global', events);
app.route('/permissions', permissions);
app.route('/workspaces', workspaces);
app.route('/gateway/config', gatewayConfig);
app.route('/push', push);
app.route('/browser', browser);
app.route('/messaging', messaging);
app.route('/skills', skills);
app.route('/plugins', plugins);

export default app;
