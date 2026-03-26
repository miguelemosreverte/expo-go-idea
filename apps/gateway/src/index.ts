import { serve } from '@hono/node-server';
import app from './app.js';
import { getLanIp } from './routes/discovery.js';

const port = parseInt(process.env['PORT'] ?? '3000', 10);

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, async (info) => {
  const lanIp = getLanIp();
  const url = `http://${lanIp}:${info.port}`;
  const password = process.env['GATEWAY_PASSWORD'] ?? process.env['JWT_SECRET'] ?? 'change-me-in-production';
  const payload = JSON.stringify({ url, name: 'GauchoCowork' });

  console.log(`Gateway listening on port ${info.port}`);
  console.log('');

  try {
    // @ts-expect-error optional dep for local dev
    const QRCode = await import('qrcode');
    const qr = await QRCode.default.toString(payload, { type: 'terminal', small: true });
    console.log(qr);
  } catch {
    console.log('(Install qrcode package for terminal QR: pnpm add qrcode)');
  }

  console.log(`  URL:      ${url}`);
  console.log(`  Password: ${password}`);
  console.log(`  Discovery page: ${url}/discovery`);
  console.log('');
});
