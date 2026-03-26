import { Hono } from 'hono';
import type { Skill, Plugin } from '@gaucho/shared';

const skills = new Hono();

// In-memory stores seeded with examples
const skillStore: Skill[] = [
  { name: 'code-review', description: 'Automated code review', path: '/skills/code-review', enabled: true },
  { name: 'test-gen', description: 'Test generation', path: '/skills/test-gen', enabled: true },
  { name: 'doc-gen', description: 'Documentation generation', path: '/skills/doc-gen', enabled: false },
];

const pluginStore: Plugin[] = [
  { name: 'eslint', version: '1.0.0', enabled: true, config: {} },
  { name: 'prettier', version: '2.0.0', enabled: true, config: { semi: true } },
  { name: 'docker', version: '0.5.0', enabled: false, config: {} },
];

// GET /skills
skills.get('/', async (c) => {
  return c.json(skillStore);
});

// POST /skills/:name/toggle
skills.post('/:name/toggle', async (c) => {
  const name = c.req.param('name');
  const skill = skillStore.find((s) => s.name === name);
  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404);
  }
  skill.enabled = !skill.enabled;
  return c.json(skill);
});

// GET /plugins - mounted at /plugins in app.ts
// We export a separate router for plugins
export const plugins = new Hono();

plugins.get('/', async (c) => {
  return c.json(pluginStore);
});

plugins.post('/:name/toggle', async (c) => {
  const name = c.req.param('name');
  const plugin = pluginStore.find((p) => p.name === name);
  if (!plugin) {
    return c.json({ error: 'Plugin not found' }, 404);
  }
  plugin.enabled = !plugin.enabled;
  return c.json(plugin);
});

plugins.put('/:name/config', async (c) => {
  const name = c.req.param('name');
  const plugin = pluginStore.find((p) => p.name === name);
  if (!plugin) {
    return c.json({ error: 'Plugin not found' }, 404);
  }
  const body = await c.req.json<Record<string, unknown>>();
  plugin.config = body;
  return c.json(plugin);
});

export default skills;
