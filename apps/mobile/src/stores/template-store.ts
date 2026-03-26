import { create } from 'zustand';
import type { Template } from '@gaucho/shared';

interface TemplateState {
  templates: Template[];
  loading: boolean;
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  loading: false,
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));
