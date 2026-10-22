'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const t = useTranslations('auth');
  return (
    <div className="hub-shell font-body min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-hub-fg mb-2">
              {t('loginTitle')}
            </h1>
            <p className="text-sm text-hub-muted">
              {t('loginSubtitle')}
            </p>
          </div>

          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-10 bg-hub-border rounded-xl animate-pulse" />
              <div className="h-10 bg-hub-border rounded-xl animate-pulse" />
              <div className="h-10 bg-hub-border rounded-xl animate-pulse" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
