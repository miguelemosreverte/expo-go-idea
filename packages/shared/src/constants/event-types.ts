export const EVENT_TYPES = {
  SESSION_CREATED: 'session.created',
  SESSION_UPDATED: 'session.updated',
  SESSION_DELETED: 'session.deleted',
  MESSAGE_CREATED: 'message.created',
  MESSAGE_UPDATED: 'message.updated',
  MESSAGE_COMPLETED: 'message.completed',
  TOOL_CALL: 'tool.call',
  TOOL_RESULT: 'tool.result',
  PERMISSION_REQUESTED: 'permission.requested',
  PERMISSION_RESPONDED: 'permission.responded',
  AGENT_TODO_CREATED: 'agent.todo.created',
  AGENT_TODO_UPDATED: 'agent.todo.updated',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
