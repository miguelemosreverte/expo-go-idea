export interface PermissionRequest {
  id: string;
  sessionId: string;
  tool: string;
  args: Record<string, unknown>;
  timestamp: string;
}

export type PermissionResponse = 'allow_once' | 'always' | 'deny';
