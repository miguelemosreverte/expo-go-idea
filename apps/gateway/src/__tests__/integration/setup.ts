import app from '../../app.js';

// Set test environment variables
process.env['JWT_SECRET'] = 'integration-test-secret';
process.env['GATEWAY_PASSWORD'] = 'integration-test-password';
process.env['OPENCODE_HOST'] = 'localhost';
process.env['OPENCODE_PORT'] = '19876'; // Non-existent port so proxy calls fail predictably

/**
 * Helper to perform a login and return a valid JWT token.
 */
export async function getAuthToken(): Promise<string> {
  const res = await app.request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'integration-test-password' }),
  });

  if (res.status !== 200) {
    throw new Error(`Login failed with status ${res.status}`);
  }

  const body = (await res.json()) as { token: string };
  return body.token;
}

/**
 * Helper to make an authenticated request against the Hono app.
 */
export async function authRequest(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<Response> {
  const token = options.token ?? (await getAuthToken());
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  return app.request(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export { app };
