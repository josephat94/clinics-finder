import { create } from 'zustand';

interface FiltersState {
  // Filtros
  state: string;
  search: string;
  extraFilter: string;

  // Acciones
  setState: (state: string) => void;
  setSearch: (search: string) => void;
  setExtraFilter: (filter: string) => void;
  clearFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  // Estado inicial
  state: '',
  search: '',
  extraFilter: '',

  // Acciones
  setState: (state) => set({ state }),
  setSearch: (search) => set({ search }),
  setExtraFilter: (extraFilter) => set({ extraFilter }),
  clearFilters: () => set({ state: '', search: '', extraFilter: '' }),
}));
