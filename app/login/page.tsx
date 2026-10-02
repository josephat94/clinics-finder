'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="hub-shell font-body min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-hub-fg mb-2">
              Iniciar sesión
            </h1>
            <p className="text-sm text-hub-muted">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-10 bg-[#fef3c7] rounded-2xl animate-pulse" />
              <div className="h-10 bg-[#fef3c7] rounded-2xl animate-pulse" />
              <div className="h-10 bg-[#fef3c7] rounded-2xl animate-pulse" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
