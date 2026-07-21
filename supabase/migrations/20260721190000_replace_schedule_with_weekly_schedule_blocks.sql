ALTER TABLE public.clinics
  ADD COLUMN weekly_schedule jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.clinics
SET weekly_schedule = jsonb_build_array(
  jsonb_build_object(
    'days', to_jsonb(open_days),
    'opening_time', opening_time,
    'closing_time', closing_time
  )
)
WHERE cardinality(open_days) > 0
  AND opening_time IS NOT NULL
  AND closing_time IS NOT NULL;

ALTER TABLE public.clinics DROP CONSTRAINT IF EXISTS clinics_open_days_valid;
ALTER TABLE public.clinics DROP COLUMN open_days;
ALTER TABLE public.clinics DROP COLUMN opening_time;
ALTER TABLE public.clinics DROP COLUMN closing_time;

COMMENT ON COLUMN public.clinics.weekly_schedule IS
  'Bloques de horario semanal: [{ days, opening_time, closing_time }]';
