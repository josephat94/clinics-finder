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
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="mx-auto px-4 py-4 2xl:max-w-[1950px]">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-black dark:text-white hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <Image src="/icon.png" alt="Clinics Finder" width={40} height={40} />
            Clinics Finder
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/clinics"
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Clínicas
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Usuarios
                  </Link>
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
