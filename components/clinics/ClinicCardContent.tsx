'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { formatWeeklySchedule, type WeekdayValue } from '@/utils/clinic-schedule';
import type { ClinicWithTravelTime } from '@/stores';

interface ClinicCardContentProps {
  clinic: ClinicWithTravelTime;
}

const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-hub-muted">{label}</dt>
      <dd className="tabular mt-0.5 text-sm [overflow-wrap:anywhere] text-hub-fg">{children}</dd>
    </div>
  );
}

export function ClinicCardContent({ clinic }: ClinicCardContentProps) {
  const t = useTranslations('clinics');
  const dayLabels: Partial<Record<WeekdayValue, string>> = {
    monday: t('dayShortMonday'),
    tuesday: t('dayShortTuesday'),
    wednesday: t('dayShortWednesday'),
    thursday: t('dayShortThursday'),
    friday: t('dayShortFriday'),
    saturday: t('dayShortSaturday'),
    sunday: t('dayShortSunday'),
  };
  const scheduleLines = formatWeeklySchedule(clinic.weekly_schedule, {
    short: true,
    labels: dayLabels,
  });

  // Pegatinas de estado derivadas solo de campos reales de la clínica
  const updatedAt = new Date(clinic.updated_at).getTime();
  const createdAt = new Date(clinic.created_at).getTime();
  const recentlyChanged =
    Number.isFinite(updatedAt) &&
    updatedAt - createdAt > 60_000 &&
    Date.now() - updatedAt < RECENT_MS;

  const stickers: { key: string; variant: 'danger' | 'warning' | 'info' | 'success'; label: string }[] = [];
  if (clinic.banned) stickers.push({ key: 'banned', variant: 'danger', label: t('blacklist') });
  if (!clinic.enabled) stickers.push({ key: 'disabled', variant: 'warning', label: t('disabled') });
  if (clinic.lat == null || clinic.lng == null) stickers.push({ key: 'coords', variant: 'warning', label: t('statusNoCoords') });
  if (recentlyChanged) stickers.push({ key: 'updated', variant: 'info', label: t('statusRecentlyUpdated') });
  if (stickers.length === 0) stickers.push({ key: 'ok', variant: 'success', label: t('statusActive') });

  const strike = clinic.banned ? 'line-through text-hub-muted' : '';
  const distance = clinic.travelTime
    ? t('distance', { value: clinic.travelTime.distance.value })
    : clinic.distanceMi
      ? t('distance', { value: clinic.distanceMi.toFixed(2) })
      : null;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1.5 pr-10">
        {stickers.map((s) => (
          <Badge key={s.key} variant={s.variant} size="sm" className="gap-1.5">
            {s.key === 'updated' && (
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="sticker-ping absolute inline-flex h-full w-full rounded-full bg-current" />
                <span className="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
            )}
            {s.label}
          </Badge>
        ))}
        {clinic.bilingual && (
          <Badge variant="secondary" size="sm">
            {t('bilingual')}
          </Badge>
        )}
      </div>

      <h2 className={`font-heading text-2xl font-bold leading-tight ${clinic.banned ? 'line-through text-hub-muted' : 'text-hub-fg'}`}>
        {clinic.name}
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 border-t border-hub-line pt-4 sm:grid-cols-2">
        {clinic.address && (
          <div className="sm:col-span-2">
            <Cell label={t('fieldAddress')}>
              <span className={strike}>
                {clinic.address}
                {clinic.state && `, ${clinic.state}`}
                {clinic.zipcode && ` ${clinic.zipcode}`}
              </span>
            </Cell>
          </div>
        )}
        {clinic.phone && <Cell label={t('phone')}>{clinic.phone}</Cell>}
        {clinic.secondary_phone && <Cell label={t('secondaryPhone')}>{clinic.secondary_phone}</Cell>}
        {clinic.fax && <Cell label={t('fieldFax')}>{clinic.fax}</Cell>}
        {clinic.email && (
          <div className="sm:col-span-2">
            <Cell label={t('fieldEmail')}>{clinic.email}</Cell>
          </div>
        )}
        {clinic.website && (
          <Cell label={t('website')}>
            <a
              href={clinic.website}
              target="_blank"
              rel="noopener noreferrer"
              className={clinic.banned ? 'cursor-not-allowed line-through text-hub-muted' : 'text-hub-primary underline-offset-2 hover:underline'}
            >
              {clinic.website}
            </a>
          </Cell>
        )}
        {scheduleLines.length > 0 && (
          <div className="sm:col-span-2">
            <Cell label={t('schedule').replace(/:$/, '')}>
              <ul className="space-y-0.5">
                {scheduleLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Cell>
          </div>
        )}
      </dl>

      {clinic.notes && (
        <p className="mt-3 border-t border-hub-line pt-3 text-xs text-hub-muted">
          {t('notes')} {clinic.notes}
        </p>
      )}

      {distance && (
        <p className="tabular mt-auto border-t border-hub-fg pt-3 text-sm font-semibold text-hub-fg">
          {distance}
        </p>
      )}
    </>
  );
}
