import type {
  AuthToken,
  Session,
  Message,
  PermissionRequest,
  PermissionResponse,
  Workspace,
  BrowserStatus,
  BrowserAction,
  Skill,
  Plugin,
  GatewayHealth,
  Template,
} from '@gaucho/shared';
import { useAuthStore } from '@/stores/auth-store';
import { useServerStore } from '@/stores/server-store';

const FALLBACK_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

function getBaseUrl(): string {
  const activeServer = useServerStore.getState().activeServer;
  return activeServer?.url ?? FALLBACK_URL;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token.token}`;
  }
  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (password: string) =>
    request<AuthToken>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getSessions: () => request<Session[]>('/session'),

  createSession: (title?: string) =>
    request<Session>('/session', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  getSession: (id: string) => request<Session>(`/session/${id}`),

  getMessages: (sessionId: string) =>
    request<Message[]>(`/session/${sessionId}/message`),

  sendMessage: (sessionId: string, content: string) =>
    request<Message>(`/session/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getPendingPermissions: () =>
    request<PermissionRequest[]>('/permissions/pending'),

  respondPermission: (id: string, response: PermissionResponse) =>
    request<void>(`/permissions/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    }),

  getWorkspaces: () => request<Workspace[]>('/workspaces'),

  switchWorkspace: (id: string) =>
    request<void>(`/workspaces/${id}/activate`, {
      method: 'POST',
    }),

  // Browser
  getBrowserStatus: () => request<BrowserStatus>('/browser/status'),

  getBrowserScreenshot: () =>
    request<{ uri: string }>('/browser/screenshot'),

  getPendingBrowserActions: () =>
    request<BrowserAction[]>('/browser/actions?status=pending'),

  submitBrowserAction: (action: Omit<BrowserAction, 'id' | 'status'>) =>
    request<BrowserAction>('/browser/actions', {
      method: 'POST',
      body: JSON.stringify(action),
    }),

  approveBrowserAction: (id: string) =>
    request<void>(`/browser/actions/${id}/approve`, { method: 'POST' }),

  denyBrowserAction: (id: string) =>
    request<void>(`/browser/actions/${id}/deny`, { method: 'POST' }),

  // Skills & Plugins
  getSkills: () => request<Skill[]>('/skills'),

  toggleSkill: (name: string) =>
    request<void>(`/skills/${name}/toggle`, { method: 'POST' }),

  getPlugins: () => request<Plugin[]>('/plugins'),

  togglePlugin: (name: string) =>
    request<void>(`/plugins/${name}/toggle`, { method: 'POST' }),

  updatePluginConfig: (name: string, config: Record<string, unknown>) =>
    request<void>(`/plugins/${name}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  // Templates
  getTemplates: () =>
    request<Template[]>('/templates').catch(() => [] as Template[]),

  syncTemplates: (local: Template[], remote: Template[]): Template[] => {
    const seen = new Set<string>();
    const merged: Template[] = [];
    for (const t of local) {
      seen.add(t.id);
      merged.push(t);
    }
    for (const t of remote) {
      if (!seen.has(t.id)) {
        merged.push(t);
      }
    }
    return merged;
  },

  // Push notifications
  subscribeToPush: (token: string) =>
    request<{ ok: boolean }>('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Gateway
  getHealth: () => request<GatewayHealth>('/health'),
};
