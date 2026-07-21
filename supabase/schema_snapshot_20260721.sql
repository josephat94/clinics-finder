-- Snapshot del schema de Clinics Finder antes de cambios (2026-07-21)
-- Proyecto: xllincqcuxbwpxyqqrgl

-- clinics
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  fax text,
  email text,
  address text,
  state character(2),
  zipcode text,
  notes text,
  website text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  lat double precision,
  lng double precision,
  banned boolean DEFAULT false,
  secondary_phone text,
  bilingual boolean NOT NULL DEFAULT false,
  opening_time text,
  closing_time text
);

CREATE INDEX idx_clinics_lat_lng ON public.clinics USING btree (lat, lng);

-- clinic_audit_logs
CREATE TABLE public.clinic_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  clinic_name text,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinic_audit_logs_clinic_created
  ON public.clinic_audit_logs (clinic_id, created_at DESC);
CREATE INDEX idx_clinic_audit_logs_actor_created
  ON public.clinic_audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_clinic_audit_logs_action_created
  ON public.clinic_audit_logs (action, created_at DESC);

ALTER TABLE public.clinic_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read clinic audit logs"
  ON public.clinic_audit_logs
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Authenticated users can insert clinic audit logs"
  ON public.clinic_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

COMMENT ON TABLE public.clinic_audit_logs IS
  'Auditoría de operaciones CRUD sobre la tabla clinics';

-- engine_queue
CREATE TABLE public.engine_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id integer NOT NULL,
  league_id integer NOT NULL,
  league_name text,
  match_name text NOT NULL,
  start_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- prediction_logs
CREATE TABLE public.prediction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id integer NOT NULL,
  league_id integer NOT NULL,
  league_name text,
  match_name text NOT NULL,
  start_time timestamptz NOT NULL,
  market text NOT NULL,
  probability numeric NOT NULL,
  odds numeric NOT NULL,
  edge numeric NOT NULL,
  source text NOT NULL,
  confidence text,
  rationale text,
  predictions_data jsonb,
  odds_data jsonb,
  comparison_goals_percentage numeric,
  win_or_draw boolean,
  advice text,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Backups de datos
-- clinics_backup_20260709: 220 filas (2026-07-09)
-- clinics_backup_20260721: 227 filas (2026-07-21)
