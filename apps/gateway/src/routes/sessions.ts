import { Hono } from 'hono';
import { API_ROUTES } from '@gaucho/shared';
import { proxyToOpenCode } from '../lib/opencode-proxy.js';

const sessions = new Hono();

// GET /session - list sessions
sessions.get('/', async (c) => {
  return proxyToOpenCode(c, API_ROUTES.SESSIONS);
});

// POST /session - create session
sessions.post('/', async (c) => {
  return proxyToOpenCode(c, API_ROUTES.SESSIONS, { method: 'POST' });
});

// GET /session/:id - get session
sessions.get('/:id', async (c) => {
  const id = c.req.param('id');
  return proxyToOpenCode(c, API_ROUTES.SESSION(id));
});

// POST /session/:id/message - send message
sessions.post('/:id/message', async (c) => {
  const id = c.req.param('id');
  return proxyToOpenCode(c, API_ROUTES.MESSAGES(id), { method: 'POST' });
});

export default sessions;
