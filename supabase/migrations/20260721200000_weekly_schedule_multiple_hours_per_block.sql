UPDATE public.clinics
SET weekly_schedule = COALESCE(
  (
    SELECT jsonb_agg(
      CASE
        WHEN block ? 'hours' THEN block
        ELSE jsonb_build_object(
          'days', block->'days',
          'hours', jsonb_build_array(
            jsonb_build_object(
              'opening_time', block->'opening_time',
              'closing_time', block->'closing_time'
            )
          )
        )
      END
    )
    FROM jsonb_array_elements(weekly_schedule) AS block
  ),
  '[]'::jsonb
)
WHERE jsonb_array_length(weekly_schedule) > 0;
