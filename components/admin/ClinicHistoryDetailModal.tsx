'use client';

import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  AUDIT_ACTION_LABELS,
  formatAuditValue,
  getFieldLabel,
  type ClinicAuditLog,
} from '@/types/clinic-audit';

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

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('es-ES', {
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
  if (!log) return null;

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
      title="Detalle de operación"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={getActionBadgeVariant(log.action)}>
            {AUDIT_ACTION_LABELS[log.action]}
          </Badge>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDateTime(log.created_at)}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Clínica
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {log.clinic_name || 'Clínica eliminada'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Usuario
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {log.actor_email || 'Desconocido'}
            </dd>
          </div>
        </dl>

        {fieldsToShow.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              {log.action === 'create'
                ? 'Datos registrados'
                : log.action === 'delete'
                  ? 'Datos eliminados'
                  : 'Campos modificados'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <th className="text-left py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300">
                      Campo
                    </th>
                    {log.action === 'update' && (
                      <th className="text-left py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300">
                        Antes
                      </th>
                    )}
                    <th className="text-left py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300">
                      {log.action === 'update' ? 'Después' : 'Valor'}
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
                        {getFieldLabel(field)}
                      </td>
                      {log.action === 'update' && (
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                          {formatAuditValue(log.old_data?.[field], field)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-100">
                        {formatAuditValue(
                          log.action === 'delete'
                            ? log.old_data?.[field]
                            : log.new_data?.[field],
                          field
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
            No hay detalle de campos disponible para esta operación.
          </p>
        )}
      </div>
    </Modal>
  );
}
