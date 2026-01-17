'use client';

import { useAuth } from './use-auth';

export type UserRole = 'admin' | 'user';

export function useRole() {
  const { user, loading } = useAuth();

  const getRole = (): UserRole => {
    if (!user) return 'user';
    // El rol se almacena en user_metadata.role
    const role = user.user_metadata?.role as UserRole;
    return role || 'user';
  };

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
