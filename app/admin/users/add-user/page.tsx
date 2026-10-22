'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CreateUserForm } from '@/components/auth/CreateUserForm';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import { Container } from '@/components/ui/container/Container';
import { Card } from '@/components/ui/card';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const t = useTranslations('admin');
  const common = useTranslations('common');

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
        <p>{common('loading')}</p>
      </Container>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Container className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {t('usersTitle')}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t('usersCreateSubtitle')}
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {t('createUserTitle')}
          </h2>
          <CreateUserForm />
        </Card>
      </div>
    </Container>
  );
}
