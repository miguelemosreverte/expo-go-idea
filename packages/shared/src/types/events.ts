export interface SSEEvent<T = unknown> {
  type: string;
  data: T;
  id?: string;
  retry?: number;
}

export interface ExecutionStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface AgentTodo {
  id: string;
  content: string;
  completed: boolean;
}
