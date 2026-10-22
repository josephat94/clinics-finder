'use client';

import { FaAt, FaClock, FaGlobe, FaMapMarkerAlt, FaPhoneAlt, FaPrint } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { formatWeeklySchedule, type WeekdayValue } from '@/utils/clinic-schedule';
import type { ClinicWithTravelTime } from '@/stores';

interface ClinicCardContentProps {
  clinic: ClinicWithTravelTime;
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

  return (
    <>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className={`text-xl font-semibold ${clinic.banned ? "line-through text-hub-muted" : "text-hub-fg"}`}>
            {clinic.name}
          </h2>
          {clinic.bilingual && (
            <Badge variant="secondary" size="sm">
              {t('bilingual')}
            </Badge>
          )}
        </div>
      </div>
      
      {clinic.address && (
        <div className="flex items-start gap-1 w-full">
          <FaMapMarkerAlt />
          <p className={`mb-1 text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
            {clinic.address}
            {clinic.state && `, ${clinic.state}`}
            {clinic.zipcode && ` ${clinic.zipcode}`}
          </p>
        </div>
      )}
      
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center justify-between gap-6">
          {clinic.phone && (
            <div className="flex items-start gap-1">
              <FaPhoneAlt />
              <p className={`text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
                {t('phone')}: {clinic.phone}
              </p>
            </div>
          )}

          {clinic.fax && (
            <div className="flex items-start gap-1">
              <FaPrint />
              <p className={`text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
                Fax: {clinic.fax}
              </p>
            </div>
          )}
        </div>

        {clinic.secondary_phone && (
          <div className="flex items-start gap-1">
            <FaPhoneAlt />
            <p className={`text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
                {t('secondaryPhone')}: {clinic.secondary_phone}
            </p>
          </div>
        )}

        {clinic.email && (
          <div className="flex items-start gap-1">
            <FaAt />
            <p className={`text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
              {clinic.email}
            </p>
          </div>
        )}
        
        {clinic.website && (
          <div className="flex items-start gap-1">
            <FaGlobe /> 
            <p className={`text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
              {t('website')}:{" "}
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${clinic.banned ? "text-hub-muted line-through cursor-not-allowed" : "text-[#15803d] hover:underline"}`}
              >
                {clinic.website}
              </a>
            </p>
          </div>
        )}

        {scheduleLines.length > 0 && (
          <div className="flex items-start gap-1">
            <FaClock className="mt-0.5 shrink-0" />
            <div className={`text-sm ${clinic.banned ? "text-hub-muted" : "text-hub-muted"}`}>
              <p>{t('schedule')}</p>
              <ul className="mt-1 space-y-0.5">
                {scheduleLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {clinic.notes && (
        <div className="flex items-start gap-1">
          <p className="text-xs mt-3 pt-3 border-t text-hub-muted border-hub-border">
            {t('notes')}    {clinic.notes}
          </p>
        </div>
      )}

      {clinic.travelTime ? (
        <div className="flex items-center gap-3 mt-4">
          <Badge variant="secondary" size="sm">
            {t('distance', { value: clinic.travelTime.distance.value })}
          </Badge>
        </div>
      ) : clinic.distanceMi ? (
        <div className="flex items-center gap-3 mt-4">
          <Badge variant="secondary" size="sm">
            {t('distance', { value: clinic.distanceMi.toFixed(2) })}
          </Badge>
        </div>
      ) : undefined}
    </>
  );
}
