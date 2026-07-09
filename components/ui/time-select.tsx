'use client';

import { Select, type SelectProps, type SelectOption } from './select';

/** Horarios de 00:00 a 24:00 en saltos de 1 hora */
export const HOUR_OPTIONS: SelectOption[] = Array.from({ length: 25 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { value, label: value };
});

/** Convierte "HH:MM" a minutos desde medianoche */
export function timeToMinutes(time: string): number {
  const [hours, minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

/** true si apertura < cierre (ambos definidos) */
export function isValidTimeRange(
  openingTime: string | null | undefined,
  closingTime: string | null | undefined
): boolean {
  if (!openingTime || !closingTime) return true;
  return timeToMinutes(openingTime) < timeToMinutes(closingTime);
}

export type TimeSelectProps = Omit<SelectProps, 'options'> & {
  /** Deshabilita opciones menores o iguales a esta hora */
  minExclusive?: string | null;
  /** Deshabilita opciones mayores o iguales a esta hora */
  maxExclusive?: string | null;
};

export function TimeSelect({
  placeholder = 'Selecciona una hora',
  minExclusive,
  maxExclusive,
  ...props
}: TimeSelectProps) {
  const options = HOUR_OPTIONS.map((option) => {
    const minutes = timeToMinutes(option.value);
    const disabledByMin =
      !!minExclusive && minutes <= timeToMinutes(minExclusive);
    const disabledByMax =
      !!maxExclusive && minutes >= timeToMinutes(maxExclusive);

    return {
      ...option,
      disabled: disabledByMin || disabledByMax,
    };
  });

  return (
    <Select
      options={options}
      placeholder={placeholder}
      {...props}
    />
  );
}
