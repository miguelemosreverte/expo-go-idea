import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const testApp = new Hono();
testApp.get('/api', (c) => c.json({ ok: true }));
testApp.get('/api/health', (c) => c.json({ status: 'ok' }));

export default handle(testApp);
