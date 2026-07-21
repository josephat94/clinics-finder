ALTER TABLE public.clinics
  ADD COLUMN open_days text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_open_days_valid
  CHECK (
    open_days <@ ARRAY[
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ]::text[]
  );

COMMENT ON COLUMN public.clinics.open_days IS
  'Días de la semana en que la clínica está abierta';
