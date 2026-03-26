import { create } from 'zustand';
import type { Workspace } from '@gaucho/shared';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  loading: false,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setLoading: (loading) => set({ loading }),
}));
