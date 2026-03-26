import { Hono } from 'hono';
import type { BrowserStatus, BrowserAction } from '@gaucho/shared';
import { randomUUID } from 'node:crypto';

const browser = new Hono();

// In-memory store for browser actions
const actions = new Map<string, BrowserAction>();

const VALID_ACTION_TYPES = new Set(['navigate', 'click', 'type', 'screenshot']);

// GET /browser/status
browser.get('/status', async (c) => {
  const status: BrowserStatus = {
    connected: false,
    currentUrl: null,
    tabCount: 0,
  };
  return c.json(status);
});

// POST /browser/action
browser.post('/action', async (c) => {
  const body = await c.req.json<{ type: string; args: Record<string, unknown> }>();

  if (!VALID_ACTION_TYPES.has(body.type)) {
    return c.json({ error: 'Invalid action type' }, 400);
  }

  const action: BrowserAction = {
    id: randomUUID(),
    type: body.type as BrowserAction['type'],
    args: body.args ?? {},
    status: 'pending',
  };

  actions.set(action.id, action);
  return c.json(action, 201);
});

// GET /browser/screenshot
browser.get('/screenshot', async (c) => {
  return c.json({ message: 'No screenshot available. Browser not connected.' });
});

// POST /browser/action/:id/approve
browser.post('/action/:id/approve', async (c) => {
  const id = c.req.param('id');
  const action = actions.get(id);
  if (!action) {
    return c.json({ error: 'Action not found' }, 404);
  }
  action.status = 'approved';
  return c.json(action);
});

// POST /browser/action/:id/deny
browser.post('/action/:id/deny', async (c) => {
  const id = c.req.param('id');
  const action = actions.get(id);
  if (!action) {
    return c.json({ error: 'Action not found' }, 404);
  }
  action.status = 'denied';
  return c.json(action);
});

export default browser;
