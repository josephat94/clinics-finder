-- Backup completo de clinics antes de cambios de schema (2026-07-21)
CREATE TABLE public.clinics_backup_20260721 AS
SELECT * FROM public.clinics;

COMMENT ON TABLE public.clinics_backup_20260721 IS
  'Backup de clinics antes de cambios de schema - 2026-07-21';
