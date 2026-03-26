import { Hono } from 'hono';
import type { PermissionRequest, PermissionResponse } from '@gaucho/shared';
import { proxyToOpenCode } from '../lib/opencode-proxy.js';

// In-memory store for pending permission requests
const pendingPermissions = new Map<string, PermissionRequest>();

export function addPendingPermission(request: PermissionRequest): void {
  pendingPermissions.set(request.id, request);
}

export function getPendingPermissions(): PermissionRequest[] {
  return Array.from(pendingPermissions.values());
}

export function clearPendingPermissions(): void {
  pendingPermissions.clear();
}

const permissions = new Hono();

// GET /permissions/pending - list pending permission requests
permissions.get('/pending', (c) => {
  return c.json(getPendingPermissions());
});

// POST /permissions/:id/respond - respond to a permission request
permissions.post('/:id/respond', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ response?: PermissionResponse }>();

  if (!body.response) {
    return c.json({ error: 'Response is required' }, 400);
  }

  const permission = pendingPermissions.get(id);
  if (!permission) {
    return c.json({ error: 'Permission request not found' }, 404);
  }

  // Remove from pending
  pendingPermissions.delete(id);

  // Proxy to OpenCode
  return proxyToOpenCode(c, `/permissions/${id}/respond`, {
    method: 'POST',
    body: { response: body.response },
  });
});

export default permissions;
