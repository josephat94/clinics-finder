'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClinicHistoryTable } from '@/components/admin/ClinicHistoryTable';
import { ClinicHistoryTableSkeleton } from '@/components/admin/ClinicHistoryTableSkeleton';
import { Container } from '@/components/ui/container/Container';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';

export default function ClinicHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, router]);

  if (authLoading || roleLoading) {
    return (
      <Container className="min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <ClinicHistoryTableSkeleton />
        </div>
      </Container>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Container className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Historial de clínicas
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Registro de creaciones, ediciones y eliminaciones en el inventario
          </p>
        </div>

        <ClinicHistoryTable />
      </div>
    </Container>
  );
}
