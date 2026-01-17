import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // UI State
  viewMode: 'grid' | 'list';
  isCreateModalOpen: boolean;

  // Acciones
  setViewMode: (mode: 'grid' | 'list') => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Estado inicial
      viewMode: 'grid',
      isCreateModalOpen: false,

      // Acciones
      setViewMode: (mode) => set({ viewMode: mode }),
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),
    }),
    {
      name: 'ui-storage', // nombre para localStorage
      partialize: (state) => ({ viewMode: state.viewMode }), // solo persistir viewMode
    }
  )
);
