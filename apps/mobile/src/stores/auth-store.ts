import { create } from 'zustand';
import type { AuthToken } from '@gaucho/shared';
import { secureStorage } from '@/services/secure-storage';

interface AuthState {
  token: AuthToken | null;
  isAuthenticated: boolean;
  login: (token: AuthToken) => void;
  logout: () => void;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  login: (token) => {
    set({ token, isAuthenticated: true });
    void secureStorage.saveToken(token);
  },
  logout: () => {
    set({ token: null, isAuthenticated: false });
    void secureStorage.removeToken();
  },
  restore: async () => {
    const token = await secureStorage.getToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
