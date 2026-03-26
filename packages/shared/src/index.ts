// Types
export type { Session, Message, SessionStatus } from './types/session.js';
export type { ServerConnection, ServerStatus, AuthToken } from './types/server.js';
export type { SSEEvent, ExecutionStep, AgentTodo } from './types/events.js';
export type { Workspace } from './types/workspace.js';
export type { PermissionRequest, PermissionResponse } from './types/permission.js';
export type { Template } from './types/template.js';
export type { GatewayHealth, GatewayConfig } from './types/gateway.js';
export type { BrowserStatus, BrowserAction } from './types/browser.js';
export type {
  MessagingChannel,
  MessagingStatus,
  MessagingConversation,
} from './types/messaging.js';
export type { Skill, Plugin } from './types/skill.js';

// Constants
export { API_ROUTES } from './constants/api-routes.js';
export { EVENT_TYPES } from './constants/event-types.js';
export type { EventType } from './constants/event-types.js';

// OpenCode SDK re-exports
export { createOpencodeClient } from '@opencode-ai/sdk';
