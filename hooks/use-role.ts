'use client';

import { getUserRole, type UserRole } from '@/lib/user-role';
import { useAuth } from './use-auth';

export type { UserRole };

export function useRole() {
  const { user, loading } = useAuth();

  const getRole = (): UserRole => getUserRole(user);

  const isAdmin = () => {
    return getRole() === 'admin';
  };

  const hasRole = (role: UserRole) => {
    return getRole() === role;
  };

  return {
    role: getRole(),
    isAdmin: isAdmin(),
    hasRole,
    loading,
  };
}
