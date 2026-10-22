'use client';

import { useTranslations } from 'next-intl';
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

const SHORT_DAY_KEY = {
  monday: 'dayShortMonday',
  tuesday: 'dayShortTuesday',
  wednesday: 'dayShortWednesday',
  thursday: 'dayShortThursday',
  friday: 'dayShortFriday',
  saturday: 'dayShortSaturday',
  sunday: 'dayShortSunday',
} as const;

const DAY_KEY = {
  monday: 'dayMonday',
  tuesday: 'dayTuesday',
  wednesday: 'dayWednesday',
  thursday: 'dayThursday',
  friday: 'dayFriday',
  saturday: 'daySaturday',
  sunday: 'daySunday',
} as const;

export function OpenDaysSelector({
  label,
  value,
  onChange,
  disabledDays = [],
  error = false,
  errorText,
  disabled = false,
}: OpenDaysSelectorProps) {
  const t = useTranslations('clinics');
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
          {label ?? t('openDays')}
        </label>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('selectedDays', { count: selectedDays.size })}
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
              <span className="text-sm font-semibold">{t(SHORT_DAY_KEY[day.value])}</span>
              <span className="mt-1 text-[11px] leading-tight opacity-80">
                {t(DAY_KEY[day.value])}
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
