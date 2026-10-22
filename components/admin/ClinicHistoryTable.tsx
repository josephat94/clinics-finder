'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ClinicHistoryDetailModal } from './ClinicHistoryDetailModal';
import { ClinicHistoryTableSkeleton } from './ClinicHistoryTableSkeleton';
import {
  type ClinicAuditAction,
  type ClinicAuditLog,
} from '@/types/clinic-audit';
import { FaEye, FaSearch } from 'react-icons/fa';

function getActionBadgeVariant(action: ClinicAuditAction) {
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FIELD_KEYS = {
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

function fieldLabel(
  field: string,
  t: (key: (typeof FIELD_KEYS)[keyof typeof FIELD_KEYS]) => string
) {
  const key = FIELD_KEYS[field as keyof typeof FIELD_KEYS];
  return key ? t(key) : field;
}

function summarizeChanges(
  log: ClinicAuditLog,
  t: ReturnType<typeof useTranslations<'admin'>>,
  unnamed: string
): string {
  if (log.action === 'create') {
    return t('createdClinic', { name: log.clinic_name || unnamed });
  }

  if (log.action === 'delete') {
    return t('deletedClinic', { name: log.clinic_name || unnamed });
  }

  if (log.changed_fields?.length) {
    const labels = log.changed_fields.slice(0, 3).map((field) => fieldLabel(field, t));
    const suffix =
      log.changed_fields.length > 3
        ? t('moreFields', { count: log.changed_fields.length - 3 })
        : '';
    return `${t('editedFields', { fields: labels.join(', ') })}${suffix}`;
  }

  return t('editWithoutDetail');
}

export function ClinicHistoryTable() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const [logs, setLogs] = useState<ClinicAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<ClinicAuditLog | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const query = params.toString();
      const response = await fetch(
        `/api/clinics/audit${query ? `?${query}` : ''}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('loadHistoryError'));
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadHistoryError'));
    } finally {
      setLoading(false);
    }
  }, [actionFilter, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="space-y-4">
        <HistoryFilters
          actionFilter={actionFilter}
          searchQuery={searchQuery}
          onActionChange={setActionFilter}
          onSearchChange={setSearchQuery}
          disabled
        />
        <ClinicHistoryTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HistoryFilters
        actionFilter={actionFilter}
        searchQuery={searchQuery}
        onActionChange={setActionFilter}
        onSearchChange={setSearchQuery}
      />

      {error ? (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              {common('retry')}
            </Button>
          </div>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">
              {t('emptyHistory')}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('emptyHistoryHint')}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('date')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('action')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('clinic')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('user')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('changes')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('detail')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {formatDateTime(log.created_at, locale)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {t(log.action === 'create' ? 'actionCreate' : log.action === 'update' ? 'actionUpdate' : 'actionDelete')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-900 dark:text-zinc-100">
                      {log.clinic_name || '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {log.actor_email || common('unknown')}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                      {summarizeChanges(log, t, common('unnamed'))}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <FaEye className="mr-2 w-3.5 h-3.5" />
                          {t('view')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ClinicHistoryDetailModal
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

interface HistoryFiltersProps {
  actionFilter: string;
  searchQuery: string;
  onActionChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
}

function HistoryFilters({
  actionFilter,
  searchQuery,
  onActionChange,
  onSearchChange,
  disabled,
}: HistoryFiltersProps) {
  const t = useTranslations('admin');
  const options = [
    { value: 'all', label: t('allActions') },
    { value: 'create', label: t('creates') },
    { value: 'update', label: t('updates') },
    { value: 'delete', label: t('deletes') },
  ];
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          placeholder={t('searchHistory')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>
      <div className="w-full sm:w-56">
        <Select
          options={options}
          value={actionFilter}
          onChange={onActionChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
