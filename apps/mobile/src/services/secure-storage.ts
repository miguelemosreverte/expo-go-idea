import type { AuthToken, ServerConnection } from '@gaucho/shared';

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const memoryStore = new Map<string, string>();

const inMemoryAdapter: StorageAdapter = {
  getItem: async (key) => memoryStore.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
};

function loadAdapter(): StorageAdapter {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store') as {
      getItemAsync: (key: string) => Promise<string | null>;
      setItemAsync: (key: string, value: string) => Promise<void>;
      deleteItemAsync: (key: string) => Promise<void>;
    };
    return {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    };
  } catch {
    return inMemoryAdapter;
  }
}

const adapter = loadAdapter();

const KEYS = {
  TOKEN: 'gaucho_auth_token',
  SERVERS: 'gaucho_servers',
} as const;

export const secureStorage = {
  saveToken: async (token: AuthToken): Promise<void> => {
    await adapter.setItem(KEYS.TOKEN, JSON.stringify(token));
  },

  getToken: async (): Promise<AuthToken | null> => {
    const raw = await adapter.getItem(KEYS.TOKEN);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthToken;
    } catch {
      return null;
    }
  },

  removeToken: async (): Promise<void> => {
    await adapter.removeItem(KEYS.TOKEN);
  },

  saveServers: async (servers: ServerConnection[]): Promise<void> => {
    await adapter.setItem(KEYS.SERVERS, JSON.stringify(servers));
  },

  getServers: async (): Promise<ServerConnection[]> => {
    const raw = await adapter.getItem(KEYS.SERVERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as ServerConnection[];
    } catch {
      return [];
    }
  },
};
