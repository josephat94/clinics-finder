'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function AuthButton() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/login');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Cargando...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
      Iniciar sesión
    </Button>
  );
}
