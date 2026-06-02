'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ClinicHistoryTableSkeleton() {
  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {['Fecha', 'Acción', 'Clínica', 'Usuario', 'Cambios', ''].map((header) => (
                <th
                  key={header || 'actions'}
                  className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <tr
                key={index}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-44" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-56" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
