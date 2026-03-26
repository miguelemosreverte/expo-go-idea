import { Hono } from 'hono';
import type { GatewayConfig } from '@gaucho/shared';

const gatewayConfig = new Hono();

gatewayConfig.get('/', (c) => {
  const config: GatewayConfig = {
    port: Number(process.env['PORT'] ?? 3100),
    opencodeHost: process.env['OPENCODE_HOST'] ?? 'localhost',
    opencodePort: Number(process.env['OPENCODE_PORT'] ?? 4096),
  };
  return c.json(config);
});

export default gatewayConfig;
