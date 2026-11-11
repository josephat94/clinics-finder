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
          <span className="text-sm text-hub-muted">
            {formatDateTime(log.created_at, locale)}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-hub-muted">
              {t('clinic')}
            </dt>
            <dd className="mt-1 text-sm text-hub-fg">
              {log.clinic_name || t('deletedClinicName')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-hub-muted">
              {t('user')}
            </dt>
            <dd className="mt-1 text-sm text-hub-fg">
              {log.actor_email || common('unknown')}
            </dd>
          </div>
        </dl>

        {fieldsToShow.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-hub-fg mb-3">
              {log.action === 'create'
                ? t('registeredData')
                : log.action === 'delete'
                  ? t('deletedData')
                  : t('changedFields')}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-hub-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hub-line bg-hub-paper">
                    <th className="text-left py-2.5 px-3 font-medium text-hub-muted">
                      {t('field')}
                    </th>
                    {log.action === 'update' && (
                      <th className="text-left py-2.5 px-3 font-medium text-hub-muted">
                        {t('before')}
                      </th>
                    )}
                    <th className="text-left py-2.5 px-3 font-medium text-hub-muted">
                      {log.action === 'update' ? t('after') : t('value')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fieldsToShow.map((field) => (
                    <tr
                      key={field}
                      className="border-b border-hub-line last:border-0"
                    >
                      <td className="py-2.5 px-3 text-hub-fg">
                        {labelFor(field)}
                      </td>
                      {log.action === 'update' && (
                        <td className="py-2.5 px-3 text-hub-muted">
                          {formatAuditValue(log.old_data?.[field], field, auditLabels)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-hub-fg">
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
          <p className="text-sm text-hub-muted">
            {t('noDetail')}
          </p>
        )}
      </div>
    </Modal>
  );
}
