import * as esbuild from 'esbuild';
import { mkdirSync, writeFileSync } from 'fs';

// Bundle the API handler into a single file
await esbuild.build({
  entryPoints: ['api/[...path].ts'],
  bundle: true,
  outfile: '.vercel/output/functions/api/[...path].func/index.mjs',
  platform: 'node',
  target: 'node20',
  format: 'esm',
  banner: { js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);' },
});

// Write the function config
writeFileSync('.vercel/output/functions/api/[...path].func/.vc-config.json', JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
}));

// Write the output config
mkdirSync('.vercel/output/static', { recursive: true });
writeFileSync('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/api/[...path]' },
  ],
}));

console.log('Vercel output built successfully');
