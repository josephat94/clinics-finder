-- Historial de operaciones sobre clínicas (create / update / delete)
-- Ejecutar en Supabase → SQL Editor (proyecto Clinics Finder)

create table if not exists public.clinic_audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete set null,
  clinic_name text,
  action text not null check (action in ('create', 'update', 'delete')),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  created_at timestamptz not null default now()
);

create index if not exists idx_clinic_audit_logs_clinic_created
  on public.clinic_audit_logs (clinic_id, created_at desc);

create index if not exists idx_clinic_audit_logs_actor_created
  on public.clinic_audit_logs (actor_id, created_at desc);

create index if not exists idx_clinic_audit_logs_action_created
  on public.clinic_audit_logs (action, created_at desc);

alter table public.clinic_audit_logs enable row level security;

-- Solo admins autenticados pueden leer el historial
create policy "Admins can read clinic audit logs"
  on public.clinic_audit_logs
  for select
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Inserción: la app usará el cliente con sesión del usuario autenticado
create policy "Authenticated users can insert clinic audit logs"
  on public.clinic_audit_logs
  for insert
  to authenticated
  with check (auth.uid() is not null);

comment on table public.clinic_audit_logs is
  'Auditoría de operaciones CRUD sobre la tabla clinics';
