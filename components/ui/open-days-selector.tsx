'use client';

import { cn } from '@/lib/utils';
import {
  WEEKDAYS,
  normalizeOpenDays,
  type WeekdayValue,
} from '@/utils/clinic-schedule';

export interface OpenDaysSelectorProps {
  label?: string;
  value: string[];
  onChange: (days: WeekdayValue[]) => void;
  disabledDays?: WeekdayValue[];
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
}

export function OpenDaysSelector({
  label = 'Días de apertura',
  value,
  onChange,
  disabledDays = [],
  error = false,
  errorText,
  disabled = false,
}: OpenDaysSelectorProps) {
  const selectedDays = new Set(normalizeOpenDays(value));
  const lockedDays = new Set(disabledDays);

  const toggleDay = (day: WeekdayValue) => {
    if (disabled || lockedDays.has(day)) return;

    const next = new Set(selectedDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }

    onChange(WEEKDAYS.map((item) => item.value).filter((item) => next.has(item)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </label>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {selectedDays.size} seleccionado{selectedDays.size === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.has(day.value);
          const isLocked = lockedDays.has(day.value);

          return (
            <button
              key={day.value}
              type="button"
              disabled={disabled || isLocked}
              aria-pressed={isSelected}
              onClick={() => toggleDay(day.value)}
              className={cn(
                'flex min-h-[72px] flex-col items-center justify-center rounded-lg border px-2 py-3 text-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:focus-visible:ring-white',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : isLocked
                  ? 'border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-600'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800',
                error && !isSelected && !isLocked && 'border-red-300 dark:border-red-800'
              )}
            >
              <span className="text-sm font-semibold">{day.shortLabel}</span>
              <span className="mt-1 text-[11px] leading-tight opacity-80">
                {day.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && errorText && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorText}</p>
      )}
    </div>
  );
}
