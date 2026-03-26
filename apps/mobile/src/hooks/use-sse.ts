import { useEffect, useRef, useState, useCallback } from 'react';
import type { SSEEvent } from '@gaucho/shared';
import { useAuthStore } from '@/stores/auth-store';
import { useServerStore } from '@/stores/server-store';
import { useSessionStore } from '@/stores/session-store';
import { usePermissionStore } from '@/stores/permission-store';

const FALLBACK_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

function getBaseUrl(): string {
  return useServerStore.getState().activeServer?.url ?? FALLBACK_URL;
}
const RECONNECT_DELAY = 3000;

interface UseSSEReturn {
  connected: boolean;
  lastEvent: SSEEvent | null;
  error: string | null;
}

function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const blocks = chunk.split('\n\n').filter(Boolean);
  for (const block of blocks) {
    let type = 'message';
    let data = '';
    let id: string | undefined;
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        type = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data += line.slice(5).trim();
      } else if (line.startsWith('id:')) {
        id = line.slice(3).trim();
      }
    }
    if (data) {
      try {
        events.push({ type, data: JSON.parse(data), id });
      } catch {
        events.push({ type, data, id });
      }
    }
  }
  return events;
}

function dispatchEvent(event: SSEEvent): void {
  const sessionStore = useSessionStore.getState();
  const permissionStore = usePermissionStore.getState();

  switch (event.type) {
    case 'message.created': {
      const msg = event.data as import('@gaucho/shared').Message;
      const existing = sessionStore.messages.find((m) => m.id === msg.id);
      if (!existing) {
        sessionStore.addMessage(msg);
      }
      break;
    }
    case 'message.updated': {
      const msg = event.data as import('@gaucho/shared').Message;
      sessionStore.updateMessage(msg);
      break;
    }
    case 'session.updated': {
      const session = event.data as import('@gaucho/shared').Session;
      sessionStore.setSessions(
        sessionStore.sessions.map((s) => (s.id === session.id ? session : s)),
      );
      if (sessionStore.currentSession?.id === session.id) {
        sessionStore.setCurrentSession(session);
      }
      break;
    }
    case 'execution.step': {
      const step = event.data as import('@gaucho/shared').ExecutionStep;
      const existing = sessionStore.executionSteps.find(
        (s) => s.id === step.id,
      );
      if (existing) {
        sessionStore.updateExecutionStep(step.id, step);
      } else {
        sessionStore.addExecutionStep(step);
      }
      break;
    }
    case 'permission.requested': {
      const req = event.data as import('@gaucho/shared').PermissionRequest;
      permissionStore.addPending(req);
      break;
    }
    case 'permission.responded': {
      const res = event.data as { id: string };
      permissionStore.removePending(res.id);
      break;
    }
  }
}

export function useSSE(): UseSSEReturn {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = useAuthStore((s) => s.token);

  const connect = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token.token}`;
    }

    fetch(`${getBaseUrl()}/global/event`, {
      headers,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }
        setConnected(true);
        setError(null);

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No readable stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            if (!part.trim()) continue;
            const events = parseSSEChunk(part + '\n\n');
            for (const event of events) {
              setLastEvent(event);
              dispatchEvent(event);
            }
          }
        }

        // Stream ended, reconnect
        setConnected(false);
        scheduleReconnect();
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setConnected(false);
        setError(err.message);
        scheduleReconnect();
      });
  }, [token]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, RECONNECT_DELAY);
  }, [connect]);

  useEffect(() => {
    if (!token) return;
    connect();
    return () => {
      abortRef.current?.abort();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [token, connect]);

  return { connected, lastEvent, error };
}
