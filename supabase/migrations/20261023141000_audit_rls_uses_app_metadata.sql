-- El rol de admin pasa a app_metadata. El usuario no puede editarlo.
-- La política lee auth.users, así que no depende de un JWT viejo.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', coalesce(raw_user_meta_data->>'role', 'user'))
where coalesce(raw_app_meta_data->>'role', '')
  is distinct from coalesce(raw_user_meta_data->>'role', 'user');

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and raw_app_meta_data->>'role' = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Admins can read clinic audit logs" on public.clinic_audit_logs;
create policy "Admins can read clinic audit logs"
  on public.clinic_audit_logs
  for select
  to authenticated
  using (private.is_admin());
