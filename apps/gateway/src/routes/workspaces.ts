import { Hono } from 'hono';
import { API_ROUTES } from '@gaucho/shared';
import { proxyToOpenCode } from '../lib/opencode-proxy.js';

const workspaces = new Hono();

// GET /workspaces - list workspaces (projects)
workspaces.get('/', async (c) => {
  return proxyToOpenCode(c, API_ROUTES.PROJECT);
});

// POST /workspaces/switch - switch active workspace
workspaces.post('/switch', async (c) => {
  return proxyToOpenCode(c, API_ROUTES.PROJECT_CURRENT, { method: 'POST' });
});

export default workspaces;
