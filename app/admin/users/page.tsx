'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateUserForm } from '@/components/auth/CreateUserForm';
import { UsersTable } from '@/components/admin/UsersTable';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import { Container } from '@/components/ui/container/Container';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FaPlus } from 'react-icons/fa';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <Container className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </Container>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Container className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Gestiona los usuarios del sistema
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaPlus className="mr-2" />
            Crear usuario
          </Button>
        </div>

        <UsersTable refreshKey={refreshKey} onRefresh={() => setRefreshKey((prev) => prev + 1)} />

        <Modal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear nuevo usuario"
          size="md"
        >
          <CreateUserForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              setRefreshKey((prev) => prev + 1);
            }}
          />
        </Modal>
      </div>
    </Container>
  );
}
