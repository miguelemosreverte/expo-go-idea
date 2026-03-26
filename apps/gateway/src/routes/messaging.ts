import { Hono } from 'hono';
import type { MessagingStatus, MessagingConversation } from '@gaucho/shared';

const messaging = new Hono();

// In-memory stores
const channels = new Map<string, MessagingStatus>();
const conversations = new Map<string, MessagingConversation[]>();

const VALID_CHANNELS = new Set(['whatsapp', 'telegram']);

// GET /messaging/channels
messaging.get('/channels', async (c) => {
  return c.json([...channels.values()]);
});

// POST /messaging/channels
messaging.post('/channels', async (c) => {
  const body = await c.req.json<MessagingStatus>();

  if (!VALID_CHANNELS.has(body.channel)) {
    return c.json({ error: 'Invalid channel. Must be whatsapp or telegram.' }, 400);
  }

  channels.set(body.channel, body);
  if (!conversations.has(body.channel)) {
    conversations.set(body.channel, []);
  }
  return c.json(body, 201);
});

// GET /messaging/channels/:id/conversations
messaging.get('/channels/:id/conversations', async (c) => {
  const id = c.req.param('id');
  if (!channels.has(id)) {
    return c.json({ error: 'Channel not found' }, 404);
  }
  return c.json(conversations.get(id) ?? []);
});

// POST /messaging/channels/:id/send
messaging.post('/channels/:id/send', async (c) => {
  const id = c.req.param('id');
  if (!channels.has(id)) {
    return c.json({ error: 'Channel not found' }, 404);
  }

  const body = await c.req.json<{ peerId: string; message: string }>();

  // Store as conversation entry
  const convos = conversations.get(id) ?? [];
  const existing = convos.find((conv) => conv.peerId === body.peerId);
  if (existing) {
    existing.lastMessage = body.message;
    existing.lastMessageAt = new Date().toISOString();
  } else {
    convos.push({
      id: `${id}-${body.peerId}`,
      channel: id as MessagingConversation['channel'],
      peerId: body.peerId,
      peerName: body.peerId,
      workspaceId: null,
      lastMessage: body.message,
      lastMessageAt: new Date().toISOString(),
    });
    conversations.set(id, convos);
  }

  return c.json({ sent: true, channel: id, peerId: body.peerId });
});

export default messaging;
