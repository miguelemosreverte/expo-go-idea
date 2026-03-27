import * as esbuild from 'esbuild';
import { mkdirSync, writeFileSync } from 'fs';

// Bundle the API handler into a single file
await esbuild.build({
  stdin: {
    contents: `
      import app from './apps/gateway/src/app.js';

      // Node.js serverless handler for Vercel Build Output API
      export default async function handler(req, res) {
        try {
          const url = new URL(req.url, \`http://\${req.headers.host}\`);
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }

          let body = null;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await new Promise((resolve) => {
              const chunks = [];
              req.on('data', (c) => chunks.push(c));
              req.on('end', () => resolve(Buffer.concat(chunks)));
            });
          }

          const request = new Request(url.toString(), {
            method: req.method,
            headers,
            body,
          });

          const response = await app.fetch(request);

          res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
          const responseBody = await response.arrayBuffer();
          res.end(Buffer.from(responseBody));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(e) }));
        }
      }
    `,
    resolveDir: '.',
    loader: 'ts',
  },
  bundle: true,
  outfile: '.vercel/output/functions/api/catchall.func/index.mjs',
  platform: 'node',
  target: 'node20',
  format: 'esm',
  banner: { js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);' },
});

// Write the function config
writeFileSync('.vercel/output/functions/api/catchall.func/.vc-config.json', JSON.stringify({
  runtime: 'nodejs22.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  shouldAddHelpers: true,
  shouldAddSourcemapSupport: false,
}));

// Write the output config with catch-all routing
mkdirSync('.vercel/output/static', { recursive: true });
writeFileSync('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/api/catchall' },
  ],
}));

console.log('Vercel output built successfully');
