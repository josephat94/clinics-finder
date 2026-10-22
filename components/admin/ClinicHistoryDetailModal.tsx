'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  formatAuditValue,
  type ClinicAuditLog,
} from '@/types/clinic-audit';
import type { WeekdayValue } from '@/utils/clinic-schedule';

interface ClinicHistoryDetailModalProps {
  log: ClinicAuditLog | null;
  open: boolean;
  onClose: () => void;
}

function getActionBadgeVariant(action: ClinicAuditLog['action']) {
  switch (action) {
    case 'create':
      return 'success' as const;
    case 'update':
      return 'info' as const;
    case 'delete':
      return 'danger' as const;
  }
}

function formatDateTime(dateString: string, locale: string) {
  return new Date(dateString).toLocaleString(locale === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ClinicHistoryDetailModal({
  log,
  open,
  onClose,
}: ClinicHistoryDetailModalProps) {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const clinics = useTranslations('clinics');
  const locale = useLocale();
  if (!log) return null;

  const dayLabels: Partial<Record<WeekdayValue, string>> = {
    monday: clinics('dayShortMonday'),
    tuesday: clinics('dayShortTuesday'),
    wednesday: clinics('dayShortWednesday'),
    thursday: clinics('dayShortThursday'),
    friday: clinics('dayShortFriday'),
    saturday: clinics('dayShortSaturday'),
    sunday: clinics('dayShortSunday'),
  };
  const auditLabels = { yes: common('yes'), no: common('no'), dayLabels };
  const labelFor = (field: string) => {
    const key = {
      name: 'fieldName',
      phone: 'fieldPhone',
      secondary_phone: 'fieldSecondaryPhone',
      fax: 'fieldFax',
      email: 'fieldEmail',
      address: 'fieldAddress',
      state: 'fieldState',
      zipcode: 'fieldZip',
      notes: 'fieldNotes',
      website: 'fieldWebsite',
      weekly_schedule: 'fieldSchedule',
      lat: 'fieldLat',
      lng: 'fieldLng',
      enabled: 'fieldEnabled',
      banned: 'fieldBanned',
      bilingual: 'fieldBilingual',
    } as const;
    const messageKey = key[field as keyof typeof key];
    return messageKey ? t(messageKey) : field;
  };

  const fieldsToShow =
    log.action === 'update' && log.changed_fields?.length
      ? log.changed_fields
      : log.action === 'create' && log.new_data
        ? Object.keys(log.new_data)
        : log.action === 'delete' && log.old_data
          ? Object.keys(log.old_data)
          : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('operationDetail')}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={getActionBadgeVariant(log.action)}>
            {t(log.action === 'create' ? 'actionCreate' : log.action === 'update' ? 'actionUpdate' : 'actionDelete')}
          </Badge>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDateTime(log.created_at, locale)}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t('clinic')}
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {log.clinic_name || t('deletedClinicName')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t('user')}
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {log.actor_email || common('unknown')}
            </dd>
          </div>
        </dl>

        {fieldsToShow.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              {log.action === 'create'
                ? t('registeredData')
                : log.action === 'delete'
                  ? t('deletedData')
                  : t('changedFields')}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <th className="text-left py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300">
                      {t('field')}
                    </th>
                    {log.action === 'update' && (
                      <th className="text-left py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300">
                        {t('before')}
                      </th>
                    )}
                    <th className="text-left py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300">
                      {log.action === 'update' ? t('after') : t('value')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fieldsToShow.map((field) => (
                    <tr
                      key={field}
                      className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-100">
                        {labelFor(field)}
                      </td>
                      {log.action === 'update' && (
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                          {formatAuditValue(log.old_data?.[field], field, auditLabels)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-100">
                        {formatAuditValue(
                          log.action === 'delete'
                            ? log.old_data?.[field]
                            : log.new_data?.[field],
                          field,
                          auditLabels
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('noDetail')}
          </p>
        )}
      </div>
    </Modal>
  );
}
