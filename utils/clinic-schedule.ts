export const WEEKDAYS = [
  { value: 'monday', label: 'Lunes', shortLabel: 'Lun' },
  { value: 'tuesday', label: 'Martes', shortLabel: 'Mar' },
  { value: 'wednesday', label: 'Miércoles', shortLabel: 'Mié' },
  { value: 'thursday', label: 'Jueves', shortLabel: 'Jue' },
  { value: 'friday', label: 'Viernes', shortLabel: 'Vie' },
  { value: 'saturday', label: 'Sábado', shortLabel: 'Sáb' },
  { value: 'sunday', label: 'Domingo', shortLabel: 'Dom' },
] as const;

export type WeekdayValue = (typeof WEEKDAYS)[number]['value'];

export interface ClinicScheduleHours {
  opening_time: string;
  closing_time: string;
}

export interface ClinicScheduleBlock {
  days: WeekdayValue[];
  hours: ClinicScheduleHours[];
}

const WEEKDAY_ORDER = WEEKDAYS.map((day) => day.value);

const WEEKDAY_LABEL_BY_VALUE = Object.fromEntries(
  WEEKDAYS.map((day) => [day.value, day.label])
) as Record<WeekdayValue, string>;

const WEEKDAY_SHORT_BY_VALUE = Object.fromEntries(
  WEEKDAYS.map((day) => [day.value, day.shortLabel])
) as Record<WeekdayValue, string>;

const WEEKDAY_INDEX = Object.fromEntries(
  WEEKDAYS.map((day, index) => [day.value, index])
) as Record<WeekdayValue, number>;

export function createEmptyScheduleHours(): ClinicScheduleHours {
  return {
    opening_time: '',
    closing_time: '',
  };
}

export function createEmptyScheduleBlock(): ClinicScheduleBlock {
  return {
    days: [],
    hours: [createEmptyScheduleHours()],
  };
}

export function normalizeOpenDays(days: string[] | null | undefined): WeekdayValue[] {
  if (!days?.length) return [];

  const validDays = new Set(WEEKDAYS.map((day) => day.value));
  return WEEKDAY_ORDER.filter((day) =>
    days.includes(day) && validDays.has(day)
  );
}

function normalizeScheduleHours(value: unknown): ClinicScheduleHours[] {
  if (!Array.isArray(value)) {
    if (value && typeof value === 'object') {
      const legacy = value as Partial<ClinicScheduleHours>;
      if (
        typeof legacy.opening_time === 'string' ||
        typeof legacy.closing_time === 'string'
      ) {
        return [
          {
            opening_time: legacy.opening_time?.trim() ?? '',
            closing_time: legacy.closing_time?.trim() ?? '',
          },
        ];
      }
    }
    return [];
  }

  return value
    .filter(
      (hour): hour is ClinicScheduleHours =>
        !!hour &&
        typeof hour === 'object' &&
        typeof (hour as ClinicScheduleHours).opening_time === 'string' &&
        typeof (hour as ClinicScheduleHours).closing_time === 'string'
    )
    .map((hour) => ({
      opening_time: hour.opening_time.trim(),
      closing_time: hour.closing_time.trim(),
    }));
}

function normalizeScheduleBlock(value: unknown): ClinicScheduleBlock | null {
  if (!value || typeof value !== 'object') return null;

  const block = value as Record<string, unknown>;
  const days = normalizeOpenDays(
    Array.isArray(block.days) ? (block.days as string[]) : []
  );

  let hours = normalizeScheduleHours(block.hours);
  if (!hours.length && (block.opening_time || block.closing_time)) {
    hours = normalizeScheduleHours({
      opening_time: block.opening_time,
      closing_time: block.closing_time,
    });
  }

  if (!days.length && !hours.some((hour) => hour.opening_time || hour.closing_time)) {
    return null;
  }

  return {
    days,
    hours: hours.length ? hours : [createEmptyScheduleHours()],
  };
}

export function normalizeWeeklySchedule(
  schedule: unknown
): ClinicScheduleBlock[] {
  if (!Array.isArray(schedule)) return [];

  return schedule
    .map(normalizeScheduleBlock)
    .filter((block): block is ClinicScheduleBlock => block !== null);
}

export function formatOpenDays(
  days: string[] | null | undefined,
  options?: { short?: boolean }
): string {
  return formatDayRanges(normalizeOpenDays(days), options);
}

export function formatDayRanges(
  days: WeekdayValue[],
  options?: { short?: boolean }
): string {
  const normalized = normalizeOpenDays(days);
  if (!normalized.length) return '';

  const labelFor = (day: WeekdayValue) =>
    options?.short ? WEEKDAY_SHORT_BY_VALUE[day] : WEEKDAY_LABEL_BY_VALUE[day];

  const groups: WeekdayValue[][] = [];
  let currentGroup: WeekdayValue[] = [];

  normalized.forEach((day, index) => {
    const dayIndex = WEEKDAY_INDEX[day];
    const previousIndex =
      index > 0 ? WEEKDAY_INDEX[normalized[index - 1]] : null;

    if (
      index === 0 ||
      previousIndex === null ||
      dayIndex !== previousIndex + 1
    ) {
      if (currentGroup.length) groups.push(currentGroup);
      currentGroup = [day];
      return;
    }

    currentGroup.push(day);
  });

  if (currentGroup.length) groups.push(currentGroup);

  return groups
    .map((group) => {
      if (group.length === 1) return labelFor(group[0]);
      return `${labelFor(group[0])} - ${labelFor(group[group.length - 1])}`;
    })
    .join(', ');
}

function formatHoursRanges(hours: ClinicScheduleHours[]): string {
  return hours
    .filter((hour) => hour.opening_time && hour.closing_time)
    .map((hour) => `${hour.opening_time} - ${hour.closing_time}`)
    .join(', ');
}

export function formatScheduleBlock(
  block: ClinicScheduleBlock,
  options?: { short?: boolean }
): string {
  const daysText = formatDayRanges(block.days, options);
  const timeText = formatHoursRanges(block.hours);

  if (!daysText) return timeText;
  if (!timeText) return daysText;
  return `${daysText} · ${timeText}`;
}

export function formatWeeklySchedule(
  schedule: ClinicScheduleBlock[] | null | undefined,
  options?: { short?: boolean }
): string[] {
  return normalizeWeeklySchedule(schedule).map((block) =>
    formatScheduleBlock(block, options)
  );
}

export function formatWeeklyScheduleText(
  schedule: ClinicScheduleBlock[] | null | undefined,
  options?: { short?: boolean }
): string | null {
  const lines = formatWeeklySchedule(schedule, options);
  return lines.length ? lines.join(' | ') : null;
}

export function getUsedDaysFromSchedule(
  schedule: ClinicScheduleBlock[],
  excludeIndex?: number
): WeekdayValue[] {
  const used = new Set<WeekdayValue>();

  schedule.forEach((block, index) => {
    if (index === excludeIndex) return;
    block.days.forEach((day) => used.add(day));
  });

  return WEEKDAY_ORDER.filter((day) => used.has(day));
}

function timeToMinutes(time: string): number {
  const [hours, minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function hasOverlappingHours(hours: ClinicScheduleHours[]): boolean {
  const ranges = hours
    .filter((hour) => hour.opening_time && hour.closing_time)
    .map((hour) => ({
      start: timeToMinutes(hour.opening_time),
      end: timeToMinutes(hour.closing_time),
    }))
    .sort((a, b) => a.start - b.start);

  for (let index = 1; index < ranges.length; index += 1) {
    if (ranges[index].start < ranges[index - 1].end) {
      return true;
    }
  }

  return false;
}

export function validateWeeklySchedule(
  schedule: ClinicScheduleBlock[]
): string | null {
  const normalized = normalizeWeeklySchedule(schedule);
  const usedDays = new Set<WeekdayValue>();

  for (const [blockIndex, block] of normalized.entries()) {
    const blockLabel = `Horario ${blockIndex + 1}`;

    if (!block.days.length) {
      return `${blockLabel}: selecciona al menos un día`;
    }

    const filledHours = block.hours.filter(
      (hour) => hour.opening_time || hour.closing_time
    );

    if (!filledHours.length) {
      return `${blockLabel}: agrega al menos un rango horario`;
    }

    for (const [hourIndex, hour] of block.hours.entries()) {
      const hourLabel = `${blockLabel}, rango ${hourIndex + 1}`;
      const hasOpening = !!hour.opening_time;
      const hasClosing = !!hour.closing_time;

      if (hasOpening !== hasClosing) {
        return `${hourLabel}: indica hora de apertura y cierre`;
      }

      if (!hasOpening && !hasClosing) {
        if (block.hours.length > 1) {
          return `${hourLabel}: completa el rango o elimínalo`;
        }
        continue;
      }

      if (timeToMinutes(hour.opening_time) >= timeToMinutes(hour.closing_time)) {
        return `${hourLabel}: la hora de apertura debe ser anterior a la de cierre`;
      }
    }

    if (hasOverlappingHours(block.hours)) {
      return `${blockLabel}: los rangos horarios no pueden traslaparse`;
    }

    for (const day of block.days) {
      if (usedDays.has(day)) {
        return `${blockLabel}: ${WEEKDAY_LABEL_BY_VALUE[day]} ya está asignado a otro horario`;
      }
      usedDays.add(day);
    }
  }

  return null;
}

export function serializeWeeklySchedule(
  schedule: ClinicScheduleBlock[]
): ClinicScheduleBlock[] {
  return normalizeWeeklySchedule(schedule)
    .map((block) => ({
      days: block.days,
      hours: block.hours
        .filter((hour) => hour.opening_time && hour.closing_time)
        .map((hour) => ({
          opening_time: hour.opening_time,
          closing_time: hour.closing_time,
        })),
    }))
    .filter((block) => block.days.length > 0 && block.hours.length > 0);
}
