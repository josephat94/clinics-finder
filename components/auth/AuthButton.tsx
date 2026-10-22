'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useAuth } from '@/hooks/use-auth';

export function AuthButton() {
  const router = useRouter();
  const t = useTranslations('common');
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    const result = await logout();
    if (result.success) {
      router.push('/');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <span
        className="inline-flex size-11 animate-pulse rounded-full bg-hub-border"
        role="status"
        aria-label={t('loading')}
      />
    );
  }

  if (user) {
    const initial = (user.email?.trim().charAt(0) || '?').toUpperCase();

    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottom-end"
        content={
          <div className="flex min-w-56 flex-col gap-3">
            <p className="truncate text-sm text-hub-muted">{user.email}</p>
            <LocaleSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('signOut')}
            </Button>
          </div>
        }
      >
        <button
          type="button"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-hub-fg text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg"
          aria-label={t('userMenu')}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {initial}
        </button>
      </Popover>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
      {t('signIn')}
    </Button>
  );
}
