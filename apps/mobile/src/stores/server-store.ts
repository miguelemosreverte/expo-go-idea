import { create } from 'zustand';
import type { ServerConnection, ServerStatus } from '@gaucho/shared';
import { secureStorage } from '@/services/secure-storage';

interface ServerState {
  servers: ServerConnection[];
  activeServer: ServerConnection | null;
  addServer: (server: ServerConnection) => void;
  removeServer: (id: string) => void;
  setActiveServer: (server: ServerConnection | null) => void;
  updateServerStatus: (id: string, status: ServerStatus) => void;
  restore: () => Promise<void>;
}

function persistServers(servers: ServerConnection[]) {
  void secureStorage.saveServers(servers);
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServer: null,
  addServer: (server) =>
    set((state) => {
      const next = [...state.servers, server];
      persistServers(next);
      return { servers: next };
    }),
  removeServer: (id) =>
    set((state) => {
      const next = state.servers.filter((s) => s.id !== id);
      persistServers(next);
      return {
        servers: next,
        activeServer: state.activeServer?.id === id ? null : state.activeServer,
      };
    }),
  setActiveServer: (server) => set({ activeServer: server }),
  updateServerStatus: (id, status) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === id ? { ...s, status } : s,
      ),
      activeServer:
        state.activeServer?.id === id
          ? { ...state.activeServer, status }
          : state.activeServer,
    })),
  restore: async () => {
    const servers = await secureStorage.getServers();
    if (servers.length > 0) {
      set({ servers });
    }
  },
}));
