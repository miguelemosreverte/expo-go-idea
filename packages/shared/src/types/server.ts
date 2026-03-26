export interface ServerConnection {
  id: string;
  name: string;
  url: string;
  status: ServerStatus;
  lastSeen: string | null;
}

export type ServerStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface AuthToken {
  token: string;
  expiresAt: string;
}
