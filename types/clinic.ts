/**
 * Interfaz para la entidad Clinic
 * Esta interfaz coincide con la estructura de la tabla clinics en Supabase
 */
export interface Clinic {
  id: string;
  name: string;
  phone: string | null;
  fax: string | null;
  email: string | null;
  address: string | null;
  state: string | null;
  zipcode: string | null;
  notes: string | null;
  website: string | null;
  enabled: boolean;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Tipo para crear una nueva clínica (campos opcionales excepto los requeridos)
 */
export type ClinicInsert = Omit<Clinic, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Tipo para actualizar una clínica (todos los campos opcionales)
 */
export type ClinicUpdate = Partial<Omit<Clinic, 'id' | 'created_at'>> & {
  updated_at?: string;
};
