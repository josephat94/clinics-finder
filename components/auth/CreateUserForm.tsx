'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/hooks/use-role';

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { user } = useAuth();
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('createUserError'));
      }

      setSuccess(t('userCreated'));
      setEmail('');
      setPassword('');
      setName('');
      setRole('user');
      
      // Llamar callback de éxito después de un breve delay
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('createUserError'));
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
        <Input
          type="password"
          label={common('password')}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          helperText={t('passwordHint')}
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? t('creatingUser') : t('createUser')}
      </Button>
    </form>
  );
}
