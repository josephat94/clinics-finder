import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Database, Json } from '@/types/database';
import type {
  ClinicAuditAction,
  ClinicAuditLog,
  ClinicAuditLogsResponse,
} from '@/types/clinic-audit';

export interface AuditActor {
  id: string;
  email: string | null;
}

type Clinic = Database['public']['Tables']['clinics']['Row'];

type AuditLogInsert =
  Database['public']['Tables']['clinic_audit_logs']['Insert'];

const AUDIT_IGNORE_FIELDS = new Set(['id', 'created_at', 'updated_at']);

export function clinicToAuditData(clinic: Clinic): Record<string, unknown> {
  return { ...clinic };
}

export function getChangedFields(before: Clinic, after: Clinic): string[] {
  const fields = new Set([
    ...Object.keys(before),
    ...Object.keys(after),
  ] as (keyof Clinic)[]);

  return [...fields].filter((key) => {
    if (AUDIT_IGNORE_FIELDS.has(key)) return false;
    return (
      JSON.stringify(before[key]) !== JSON.stringify(after[key])
    );
  });
}

export async function logClinicAudit(params: {
  action: ClinicAuditAction;
  actor: AuditActor;
  clinicId?: string | null;
  clinicName?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  changedFields?: string[] | null;
}): Promise<void> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const entry: AuditLogInsert = {
    clinic_id: params.clinicId ?? null,
    clinic_name: params.clinicName ?? null,
    action: params.action,
    actor_id: params.actor.id,
    actor_email: params.actor.email,
    old_data: (params.oldData ?? null) as Json | null,
    new_data: (params.newData ?? null) as Json | null,
    changed_fields: params.changedFields ?? null,
  };

  const { error } = await supabase
    .from('clinic_audit_logs')
    .insert(entry as any);

  if (error) {
    throw new Error(`Error al registrar auditoría: ${error.message}`);
  }
}

export async function getClinicAuditLogs(filters?: {
  action?: ClinicAuditAction;
  search?: string;
  limit?: number;
}): Promise<ClinicAuditLogsResponse> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  let query = supabase
    .from('clinic_audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.action) {
    query = query.eq('action', filters.action);
  }

  if (filters?.search) {
    const term = filters.search.replace(/[%_]/g, '\\$&');
    query = query.or(
      `clinic_name.ilike.%${term}%,actor_email.ilike.%${term}%`
    );
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error al obtener historial: ${error.message}`);
  }

  return {
    logs: (data ?? []) as ClinicAuditLog[],
    total: count ?? 0,
  };
}
