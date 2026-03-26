import { create } from 'zustand';
import type { Session, Message, ExecutionStep } from '@gaucho/shared';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  messages: Message[];
  executionSteps: ExecutionStep[];
  loadingSessions: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  assistantTyping: boolean;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  setExecutionSteps: (steps: ExecutionStep[]) => void;
  addExecutionStep: (step: ExecutionStep) => void;
  updateExecutionStep: (id: string, step: Partial<ExecutionStep>) => void;
  setLoadingSessions: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSendingMessage: (sending: boolean) => void;
  setAssistantTyping: (typing: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  executionSteps: [],
  loadingSessions: false,
  loadingMessages: false,
  sendingMessage: false,
  assistantTyping: false,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (message) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === message.id ? message : m,
      ),
    })),
  setExecutionSteps: (executionSteps) => set({ executionSteps }),
  addExecutionStep: (step) =>
    set((state) => ({ executionSteps: [...state.executionSteps, step] })),
  updateExecutionStep: (id, updates) =>
    set((state) => ({
      executionSteps: state.executionSteps.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    })),
  setLoadingSessions: (loadingSessions) => set({ loadingSessions }),
  setLoadingMessages: (loadingMessages) => set({ loadingMessages }),
  setSendingMessage: (sendingMessage) => set({ sendingMessage }),
  setAssistantTyping: (assistantTyping) => set({ assistantTyping }),
}));
