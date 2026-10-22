'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { EditUserForm } from '@/components/auth/EditUserForm';
import { Popover } from '@/components/ui/popover';
import { ListItem } from '@/components/ui/list-item';
import { UsersTableSkeleton } from './UsersTableSkeleton';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/hooks/use-role';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
}

interface UsersTableProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

export function UsersTable({ refreshKey, onRefresh }: UsersTableProps) {
  const { user: currentUser } = useAuth();
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const locale = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('loadUsersError'));
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadUsersError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('never');
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenPopoverId(null);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setOpenPopoverId(null);
  };

  const handleEditSuccess = () => {
    setEditingUser(null);
    fetchUsers();
    onRefresh?.();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/auth/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('deleteUserError'));
      }

      setDeletingUser(null);
      fetchUsers();
      onRefresh?.();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert(err instanceof Error ? err.message : t('deleteUserError'));
    }
  };

  if (loading) {
    return <UsersTableSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            {common('retry')}
          </Button>
        </div>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          {t('emptyUsers')}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {common('name')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {common('email')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {common('role')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('status')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('created')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('lastAccess')}
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {common('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </td>
                <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant={user.role === 'admin' ? 'warning' : 'info'}
                  >
                    {user.role === 'admin' ? common('admin') : common('user')}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant={user.emailConfirmed ? 'success' : 'warning'}
                  >
                    {user.emailConfirmed ? t('confirmed') : t('pending')}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDate(user.lastSignIn)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end">
                    <Popover
                      open={openPopoverId === user.id}
                      onOpenChange={(open) => setOpenPopoverId(open ? user.id : null)}
                      content={
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <ListItem
                            onClick={() => handleEdit(user)}
                            icon={<FaEdit className="w-4 h-4" />}
                          >
                            {common('edit')}
                          </ListItem>
                          {currentUser?.id !== user.id && (
                            <ListItem
                              onClick={() => handleDelete(user)}
                              icon={<FaTrash className="w-4 h-4" />}
                              variant="danger"
                            >
                              {common('delete')}
                            </ListItem>
                          )}
                        </div>
                      }
                      placement="bottom-end"
                      contentClassName="p-2"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={common('options')}
                      >
                        <FaEllipsisV className="w-4 h-4" />
                      </Button>
                    </Popover>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <Modal
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={t('editUser')}
          size="md"
        >
          <EditUserForm
            user={editingUser}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingUser(null)}
          />
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingUser && (
        <ConfirmationModal
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
          title={t('deleteUser')}
          message={t('deleteUserMessage', {
            name: deletingUser.name,
            email: deletingUser.email,
          })}
          confirmText={common('delete')}
          cancelText={common('cancel')}
          variant="danger"
        />
      )}
    </Card>
  );
}
