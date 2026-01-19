'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Iniciar sesión
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
