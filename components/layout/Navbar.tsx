'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { List, X } from '@phosphor-icons/react';
import { AuthButton } from '@/components/auth/AuthButton';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';

export function Navbar() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isAuthenticated
    ? [
        { href: '/clinics', label: t('navClinics') },
        { href: '/pdf-editor', label: t('navPdf') },
        ...(isAdmin
          ? [
              { href: '/admin/history', label: t('navHistory') },
              { href: '/admin/users', label: t('navUsers') },
            ]
          : []),
      ]
    : [];

  const linkClass = (href: string) =>
    `inline-flex min-h-11 items-center border-b-2 px-1 text-sm font-semibold transition-colors duration-200 ${
      pathname === href || pathname.startsWith(`${href}/`)
        ? 'border-hub-caution text-hub-fg'
        : 'border-transparent text-hub-muted hover:text-hub-fg'
    }`;

  return (
    <nav className="glass-bar font-body text-hub-fg">
      <div className="mx-auto px-4 2xl:max-w-[1950px]">
        <div className="flex items-center justify-between gap-3 py-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 font-heading text-xl font-bold text-hub-fg"
          >
            <Image src="/icon.png" alt="" width={36} height={36} />
            {t('metaTitle')}
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && <LocaleSwitcher />}
            <AuthButton />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <AuthButton />
            {links.length > 0 && (
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={t('menu')}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-hub-line text-hub-fg hover:bg-hub-paper"
              >
                {menuOpen ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>

        {menuOpen && links.length > 0 && (
          <div id="mobile-nav" className="flex flex-col border-t border-hub-line py-2 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`${linkClass(link.href)} w-full border-b-0 px-3`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex justify-end pb-2 md:hidden">
            <LocaleSwitcher />
          </div>
        )}
      </div>
    </nav>
  );
}
