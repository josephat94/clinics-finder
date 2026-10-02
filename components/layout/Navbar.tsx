'use client';

import Link from 'next/link';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import Image from 'next/image';

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useRole();

  return (
    <nav className="glass-bar font-body text-hub-fg">
      <div className="mx-auto px-4 py-4 2xl:max-w-[1950px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 font-heading text-xl font-semibold text-hub-fg transition-opacity duration-200 hover:opacity-80"
          >
            <Image src="/icon.png" alt="Clinics Finder" width={40} height={40} />
            Clinics Finder
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {isAuthenticated && (
              <>
                <Link
                  href="/clinics"
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-hub-muted transition-colors duration-200 hover:text-hub-fg"
                >
                  Clínicas
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/history"
                      className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-hub-muted transition-colors duration-200 hover:text-hub-fg"
                    >
                      Historial
                    </Link>
                    <Link
                      href="/admin/users"
                      className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-hub-muted transition-colors duration-200 hover:text-hub-fg"
                    >
                      Usuarios
                    </Link>
                  </>
                )}
              </>
            )}
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
