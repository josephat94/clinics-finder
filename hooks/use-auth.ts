'use client';

import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/utils/supabase/client';

export function useAuth() {
  const { user, loading, initialized, setUser, setLoading } = useAuthStore();

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
        throw new Error(data.error || 'Error al iniciar sesión');
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
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
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
        throw new Error(data.error || 'Error al registrarse');
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
        error: error instanceof Error ? error.message : 'Error al registrarse',
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
        throw new Error('Error al cerrar sesión');
      }

      useAuthStore.getState().logout();
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión',
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
