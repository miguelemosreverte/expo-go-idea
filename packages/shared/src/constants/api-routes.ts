export const API_ROUTES = {
  // OpenCode endpoints
  HEALTH: '/global/health',
  EVENTS: '/global/event',
  SESSIONS: '/session',
  SESSION: (id: string) => `/session/${id}` as const,
  MESSAGES: (sessionId: string) => `/session/${sessionId}/message` as const,
  CONFIG: '/config',
  PROVIDERS: '/provider',
  CONFIG_PROVIDERS: '/config/providers',
  PROJECT: '/project',
  PROJECT_CURRENT: '/project/current',
  INSTANCE_DISPOSE: '/instance/dispose',

  // Gateway endpoints
  GATEWAY_HEALTH: '/health',
  GATEWAY_AUTH: '/auth/login',
  GATEWAY_DISCOVERY: '/discovery/info',
  GATEWAY_PUSH: '/push/subscribe',
  GATEWAY_TEMPLATES: '/templates',
  GATEWAY_BROWSER: '/browser',
  GATEWAY_MESSAGING: '/messaging',
  GATEWAY_SKILLS: '/skills',
  GATEWAY_WORKSPACES: '/workspaces',
  GATEWAY_CONFIG: '/gateway/config',
  GATEWAY_LOGS: '/logs',
  GATEWAY_RELOAD: '/reload',
} as const;
