'use client';

import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

export function useAuth() {
  const { user, loading, initialized, setUser, setLoading } = useAuthStore();
  const t = useTranslations('auth');

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('loginError'));
      }

      // Actualizar el usuario desde la sesión
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      setUser(user);
      setLoading(false);
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : t('loginError'),
      };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('registerError'));
      }

      // Actualizar el usuario desde la sesión
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      setUser(user);
      setLoading(false);
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : t('registerError'),
      };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(t('logoutError'));
      }

      useAuthStore.getState().logout();
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : t('logoutError'),
      };
    }
  };

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
