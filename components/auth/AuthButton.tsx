'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function AuthButton() {
  const router = useRouter();
  const t = useTranslations('common');
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        {t('loading')}
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-hub-muted">
          {user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          {t('signOut')}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
      {t('signIn')}
    </Button>
  );
}
