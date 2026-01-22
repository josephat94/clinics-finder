'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function SearchClinicSkeleton() {
  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      {/* Header Skeleton */}
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex-1">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 md:hidden" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda: Lista de cards skeleton */}
        <div className="hidden md:flex w-full sm:w-1/2 lg:w-2/5 xl:w-1/3 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-0">
          <div className="flex-1 p-4 space-y-8 min-h-0 overflow-y-auto">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="p-6">
                {/* Badge skeleton */}
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>

                {/* Título skeleton */}
                <Skeleton className="h-6 w-3/4 mb-3" />

                {/* Dirección skeleton */}
                <div className="flex items-start gap-1 mb-2">
                  <Skeleton variant="circular" width={12} height={12} className="mt-1" />
                  <Skeleton className="h-4 w-full" />
                </div>

                {/* Teléfono y Fax skeleton */}
                <div className="flex items-center justify-between gap-6 mt-2 mb-2">
                  <div className="flex items-start gap-1 flex-1">
                    <Skeleton variant="circular" width={12} height={12} className="mt-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-start gap-1 flex-1">
                    <Skeleton variant="circular" width={12} height={12} className="mt-1" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>

                {/* Email skeleton */}
                <div className="flex items-start gap-1 mb-2">
                  <Skeleton variant="circular" width={12} height={12} className="mt-1" />
                  <Skeleton className="h-4 w-40" />
                </div>

                {/* Website skeleton */}
                <div className="flex items-start gap-1 mb-3">
                  <Skeleton variant="circular" width={12} height={12} className="mt-1" />
                  <Skeleton className="h-4 w-48" />
                </div>

                {/* Distancia badge skeleton */}
                <Skeleton className="h-6 w-32 mt-4" />
              </Card>
            ))}
          </div>
        </div>

        {/* Columna derecha: Mapa skeleton */}
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 min-h-0 overflow-hidden px-6 rounded-3xl">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
