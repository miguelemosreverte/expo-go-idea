import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import('../apps/gateway/src/app.js');
    const { handle } = await import('hono/vercel');
    return handle(app)(req, res);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
