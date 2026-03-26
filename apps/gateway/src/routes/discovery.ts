import { Hono } from 'hono';
import os from 'node:os';

function getLanIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const addrs = interfaces[name];
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}

const discovery = new Hono();

discovery.get('/', async (c) => {
  const host = c.req.header('host');
  const proto = c.req.header('x-forwarded-proto') ?? 'http';
  const url = host ? `${proto}://${host}` : `http://${getLanIp()}:${process.env['PORT'] ?? '3000'}`;
  const password = process.env['GATEWAY_PASSWORD'] ?? process.env['JWT_SECRET'] ?? 'change-me-in-production';
  const payload = JSON.stringify({ url, name: 'GauchoCowork' });

  const QRCode = await import('qrcode');
  const qrSvg = await QRCode.default.toString(payload, { type: 'svg', width: 300 });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GauchoCowork - Discovery</title></head>
<body style="margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a2e;color:#fff;font-family:system-ui,sans-serif">
  <h1 style="margin-bottom:8px">GauchoCowork</h1>
  <p style="margin:0 0 24px;opacity:0.7">Escaneá este código con la app</p>
  <div style="background:#fff;padding:16px;border-radius:12px">${qrSvg}</div>
  <p style="margin:24px 0 4px;font-size:14px;opacity:0.6">Servidor</p>
  <p style="margin:0;font-size:18px;font-family:monospace">${url}</p>
  <p style="margin:16px 0 4px;font-size:14px;opacity:0.6">Contraseña</p>
  <p style="margin:0;font-size:18px;font-family:monospace">${password}</p>
</body>
</html>`;

  return c.html(html);
});

discovery.get('/info', (c) => {
  const host = c.req.header('host');
  const proto = c.req.header('x-forwarded-proto') ?? 'http';
  const url = host ? `${proto}://${host}` : `http://${getLanIp()}:${process.env['PORT'] ?? '3000'}`;
  const password = process.env['GATEWAY_PASSWORD'] ?? process.env['JWT_SECRET'] ?? 'change-me-in-production';

  return c.json({ url, name: 'GauchoCowork', password });
});

export { getLanIp };
export default discovery;
