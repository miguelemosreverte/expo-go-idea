import { Hono } from 'hono';

interface PushSubscription {
  token: string;
  subscribedAt: string;
}

// In-memory store for push subscriptions
const subscriptions: Map<string, PushSubscription> = new Map();

const push = new Hono();

// POST /push/subscribe - store FCM/Expo push token
push.post('/subscribe', async (c) => {
  const body = await c.req.json<{ token: string }>();

  if (!body.token) {
    return c.json({ error: 'token is required' }, 400);
  }

  subscriptions.set(body.token, {
    token: body.token,
    subscribedAt: new Date().toISOString(),
  });

  console.log(`[push] Registered token: ${body.token.slice(0, 20)}...`);

  return c.json({ ok: true });
});

// POST /push/send - internal endpoint to send push notification (placeholder)
push.post('/send', async (c) => {
  const body = await c.req.json<{
    title: string;
    body: string;
    data?: Record<string, string>;
  }>();

  console.log(`[push] Send requested to ${subscriptions.size} subscribers:`, {
    title: body.title,
    body: body.body,
    data: body.data,
  });

  // Placeholder: log instead of actually sending
  return c.json({
    ok: true,
    sent: subscriptions.size,
  });
});

export default push;
