import { create } from 'zustand';
import type { PermissionRequest } from '@gaucho/shared';

interface PermissionState {
  pending: PermissionRequest[];
  setPending: (pending: PermissionRequest[]) => void;
  addPending: (request: PermissionRequest) => void;
  removePending: (id: string) => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  pending: [],
  setPending: (pending) => set({ pending }),
  addPending: (request) =>
    set((state) => {
      const exists = state.pending.some((p) => p.id === request.id);
      if (exists) return state;
      return { pending: [...state.pending, request] };
    }),
  removePending: (id) =>
    set((state) => ({ pending: state.pending.filter((p) => p.id !== id) })),
}));
