export type ClinicAuditAction = 'create' | 'update' | 'delete';

export interface ClinicAuditLog {
  id: string;
  clinic_id: string | null;
  clinic_name: string | null;
  action: ClinicAuditAction;
  actor_id: string | null;
  actor_email: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[] | null;
  created_at: string;
}

export interface ClinicAuditLogsResponse {
  logs: ClinicAuditLog[];
  total: number;
}

export const CLINIC_FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  phone: 'Teléfono',
  secondary_phone: 'Teléfono secundario',
  fax: 'Fax',
  email: 'Email',
  address: 'Dirección',
  state: 'Estado',
  zipcode: 'Código postal',
  notes: 'Notas',
  website: 'Sitio web',
  lat: 'Latitud',
  lng: 'Longitud',
  enabled: 'Habilitada',
  banned: 'Lista negra',
  bilingual: 'Bilingüe',
};

export const AUDIT_ACTION_LABELS: Record<ClinicAuditAction, string> = {
  create: 'Creación',
  update: 'Edición',
  delete: 'Eliminación',
};

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

export function getFieldLabel(field: string): string {
  return CLINIC_FIELD_LABELS[field] ?? field;
}
