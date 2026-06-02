'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ClinicHistoryDetailModal } from './ClinicHistoryDetailModal';
import { ClinicHistoryTableSkeleton } from './ClinicHistoryTableSkeleton';
import {
  AUDIT_ACTION_LABELS,
  getFieldLabel,
  type ClinicAuditAction,
  type ClinicAuditLog,
} from '@/types/clinic-audit';
import { FaEye, FaSearch } from 'react-icons/fa';

const ACTION_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'create', label: 'Creaciones' },
  { value: 'update', label: 'Ediciones' },
  { value: 'delete', label: 'Eliminaciones' },
];

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

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function summarizeChanges(log: ClinicAuditLog): string {
  if (log.action === 'create') {
    return `Clínica creada: ${log.clinic_name || 'Sin nombre'}`;
  }

  if (log.action === 'delete') {
    return `Clínica eliminada: ${log.clinic_name || 'Sin nombre'}`;
  }

  if (log.changed_fields?.length) {
    const labels = log.changed_fields.slice(0, 3).map(getFieldLabel);
    const suffix =
      log.changed_fields.length > 3
        ? ` +${log.changed_fields.length - 3} más`
        : '';
    return `Modificó: ${labels.join(', ')}${suffix}`;
  }

  return 'Edición sin detalle de campos';
}

export function ClinicHistoryTable() {
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
        throw new Error(data.error || 'Error al cargar el historial');
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
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
              Reintentar
            </Button>
          </div>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">
              No hay registros en el historial
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Las operaciones de creación, edición y eliminación de clínicas
              aparecerán aquí.
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
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Acción
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Clínica
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Usuario
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Cambios
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Detalle
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
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {AUDIT_ACTION_LABELS[log.action]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-900 dark:text-zinc-100">
                      {log.clinic_name || '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {log.actor_email || 'Desconocido'}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                      {summarizeChanges(log)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <FaEye className="mr-2 w-3.5 h-3.5" />
                          Ver
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
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          placeholder="Buscar por clínica o usuario..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>
      <div className="w-full sm:w-56">
        <Select
          options={ACTION_FILTER_OPTIONS}
          value={actionFilter}
          onChange={onActionChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
