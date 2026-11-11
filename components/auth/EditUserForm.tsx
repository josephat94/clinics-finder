'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { UserRole } from '@/hooks/use-role';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface EditUserFormProps {
  user: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(user.email);
    setName(user.name);
    setRole(user.role);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('updateUserError'));
      }

      setSuccess(t('userUpdated'));
      
      // Llamar callback de éxito después de un breve delay
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateUserError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          label={t('nameOptional')}
          placeholder={t('userNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <Input
          type="email"
          label={common('email')}
          placeholder={t('userEmailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <Select
          popoverZIndex={250}
          label={common('role')}
          value={role}
          onChange={(value) => setRole(value as UserRole)}
          disabled={loading}
          options={[
            { value: 'user', label: common('user') },
            { value: 'admin', label: common('admin') },
          ]}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-hub-danger-soft border border-hub-danger/30">
          <p className="text-sm text-hub-danger">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-hub-ok-soft border border-hub-ok/30">
          <p className="text-sm text-hub-ok">{success}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-hub-line">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {common('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={loading}
        >
          {loading ? t('updatingUser') : t('updateUser')}
        </Button>
      </div>
    </form>
  );
}
