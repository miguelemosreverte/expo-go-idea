import type { Context } from 'hono';

function getOpenCodeBaseUrl(): string {
  const host = process.env['OPENCODE_HOST'] ?? 'localhost';
  const port = process.env['OPENCODE_PORT'] ?? '4096';
  return `http://${host}:${port}`;
}

export async function proxyToOpenCode(
  c: Context,
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<Response> {
  const url = `${getOpenCodeBaseUrl()}${path}`;
  const method = options?.method ?? c.req.method;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  } else if (method !== 'GET' && method !== 'HEAD') {
    try {
      const body = await c.req.json();
      fetchOptions.body = JSON.stringify(body);
    } catch {
      // no body
    }
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json();
  return c.json(data as Record<string, unknown>, response.status as 200);
}

export function getOpenCodeStreamUrl(path: string): string {
  return `${getOpenCodeBaseUrl()}${path}`;
}
