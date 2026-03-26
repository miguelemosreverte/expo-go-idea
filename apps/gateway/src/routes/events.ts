import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { API_ROUTES } from '@gaucho/shared';
import { getOpenCodeStreamUrl } from '../lib/opencode-proxy.js';

const events = new Hono();

// GET /global/event - SSE proxy
events.get('/event', async (c) => {
  const url = getOpenCodeStreamUrl(API_ROUTES.EVENTS);

  return streamSSE(c, async (stream) => {
    try {
      const response = await fetch(url);

      if (!response.ok || !response.body) {
        await stream.writeSSE({ event: 'error', data: 'Failed to connect to OpenCode' });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        // Forward raw SSE chunks - they are already formatted
        const lines = text.split('\n');
        let event = 'message';
        let data = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            data = line.slice(5).trim();
          } else if (line === '' && data) {
            await stream.writeSSE({ event, data });
            event = 'message';
            data = '';
          }
        }
      }
    } catch {
      await stream.writeSSE({ event: 'error', data: 'Connection to OpenCode lost' });
    }
  });
});

export default events;
