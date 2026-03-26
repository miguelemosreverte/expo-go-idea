import { describe, it, expect, vi } from 'vitest';
import { OpenCodeManager } from '../lib/opencode-manager.js';

describe('OpenCodeManager', () => {
  it('spawns and marks as base url', async () => {
    const manager = new OpenCodeManager({ host: 'localhost', port: '9999' });
    await manager.spawn();
    expect(manager.getBaseUrl()).toBe('http://localhost:9999');
  });

  it('stop then spawn via restart', async () => {
    const manager = new OpenCodeManager();
    await manager.spawn();
    await manager.restart();
    // After restart, still has a valid base URL
    expect(manager.getBaseUrl()).toBe('http://localhost:4096');
  });

  it('isRunning returns false when OpenCode is unreachable', async () => {
    const manager = new OpenCodeManager({ host: 'localhost', port: '1' });
    const running = await manager.isRunning();
    expect(running).toBe(false);
  });

  it('calls onCrash callback when health check fails', async () => {
    const onCrash = vi.fn();
    const manager = new OpenCodeManager({ host: 'localhost', port: '1', onCrash });
    await manager.isRunning();
    expect(onCrash).toHaveBeenCalled();
  });

  it('uses env vars as defaults', () => {
    process.env['OPENCODE_HOST'] = 'myhost';
    process.env['OPENCODE_PORT'] = '5555';
    const manager = new OpenCodeManager();
    expect(manager.getBaseUrl()).toBe('http://myhost:5555');
    delete process.env['OPENCODE_HOST'];
    delete process.env['OPENCODE_PORT'];
  });
});
