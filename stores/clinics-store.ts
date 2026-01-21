import { create } from 'zustand';
import type { Clinic } from '@/types/clinic';

// Tipo extendido para incluir travelTime
export type ClinicWithTravelTime = Clinic & {
  travelTime?: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    status: string;
  };
  distanceKm: number | null;
  distanceMi: number | null;
};

interface ClinicsState {
  // Clínicas
  initialClinics: Clinic[];
  filteredClinics: ClinicWithTravelTime[];
  isLoading: boolean;

  // Acciones
  setInitialClinics: (clinics: Clinic[]) => void;
  setFilteredClinics: (clinics: ClinicWithTravelTime[]) => void;
  setIsLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

export const useClinicsStore = create<ClinicsState>((set) => ({
  // Estado inicial
  initialClinics: [],
  filteredClinics: [],
  isLoading: false,


  // Acciones
  setInitialClinics: (clinics) =>{

    return(
      set({
        initialClinics: clinics,
        filteredClinics:clinics as ClinicWithTravelTime[],
      })
    )
  }
,

  setFilteredClinics: (clinics) => set({ filteredClinics: clinics }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  resetFilters: () =>
    set((state) => ({
      filteredClinics: state.initialClinics as ClinicWithTravelTime[],
    })),
}));
