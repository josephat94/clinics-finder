'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/utils/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar la verificación de autenticación
    const initAuth = async () => {
      const supabase = createClient();
      
      // Obtener sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession();

      useAuthStore.getState().setUser(session?.user ?? null);
      useAuthStore.getState().setInitialized(true);
      useAuthStore.getState().setLoading(false);

      // Escuchar cambios en la autenticación
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        useAuthStore.getState().setUser(session?.user ?? null);
      });

      return subscription;
    };

    let subscription: { unsubscribe: () => void } | null = null;
    
    initAuth().then((sub) => {
      subscription = sub;
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
