/**
 * Interfaz para la entidad Clinic
 * Esta interfaz coincide con la estructura de la tabla clinics en Supabase
 */
import type {
  ClinicScheduleBlock,
  ClinicScheduleHours,
} from '@/utils/clinic-schedule';

export type { ClinicScheduleBlock, ClinicScheduleHours };

export interface Clinic {
  id: string;
  name: string;
  phone: string | null;
  secondary_phone: string | null;
  fax: string | null;
  email: string | null;
  address: string | null;
  state: string | null;
  zipcode: string | null;
  notes: string | null;
  website: string | null;
  weekly_schedule: ClinicScheduleBlock[];
  lat: number | null;
  lng: number | null;
  enabled: boolean;
  banned: boolean;
  bilingual: boolean;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Tipo para crear una nueva clínica (campos opcionales excepto los requeridos)
 * lat/lng son opcionales porque suelen calcularse por geocoding en el servidor
 */
export type ClinicInsert = Omit<
  Clinic,
  'id' | 'created_at' | 'updated_at' | 'lat' | 'lng'
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  lat?: number | null;
  lng?: number | null;
};

/**
 * Tipo para actualizar una clínica (todos los campos opcionales)
 */
export type ClinicUpdate = Partial<Omit<Clinic, 'id' | 'created_at'>> & {
  updated_at?: string;
};
