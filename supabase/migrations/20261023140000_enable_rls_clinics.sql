-- Cierra el acceso anónimo a clinics y a tablas que la app no usa.
-- Las operaciones de la app siguen con la sesión autenticada (publishable key + JWT).

alter table public.clinics enable row level security;

drop policy if exists "Authenticated users can read clinics" on public.clinics;
create policy "Authenticated users can read clinics"
  on public.clinics
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert clinics" on public.clinics;
create policy "Authenticated users can insert clinics"
  on public.clinics
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update clinics" on public.clinics;
create policy "Authenticated users can update clinics"
  on public.clinics
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete clinics" on public.clinics;
create policy "Authenticated users can delete clinics"
  on public.clinics
  for delete
  to authenticated
  using (true);

revoke all on table public.clinics from anon;
revoke truncate, trigger, references on table public.clinics from authenticated;

-- Copias y tablas ajenas a clinics-finder: sin políticas, anon y authenticated quedan fuera.
-- service_role sigue pudiendo leerlas para mantenimiento.
alter table public.clinics_backup_20260709 enable row level security;
alter table public.clinics_backup_20260721 enable row level security;
alter table public.engine_queue enable row level security;
alter table public.prediction_logs enable row level security;

revoke all on table public.clinics_backup_20260709 from anon, authenticated;
revoke all on table public.clinics_backup_20260721 from anon, authenticated;
revoke all on table public.engine_queue from anon, authenticated;
revoke all on table public.prediction_logs from anon, authenticated;

revoke all on table public.clinic_audit_logs from anon;
revoke update, delete, truncate, trigger, references on table public.clinic_audit_logs from authenticated;
