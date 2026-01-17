# Sistema de Autenticación Custom con Supabase

Este proyecto incluye un sistema de autenticación completamente custom usando Supabase, sin librerías de terceros adicionales para evitar costos extra.

## Características

- ✅ Login con email y contraseña
- ✅ Registro de nuevos usuarios
- ✅ Logout
- ✅ Protección de rutas con middleware
- ✅ Estado de autenticación global con Zustand
- ✅ Interfaz de usuario custom

## Estructura

### Stores
- `stores/auth-store.ts` - Store de Zustand para manejar el estado de autenticación

### Hooks
- `hooks/use-auth.ts` - Hook personalizado para usar la autenticación en componentes

### Componentes
- `components/auth/LoginForm.tsx` - Formulario de login
- `components/auth/RegisterForm.tsx` - Formulario de registro
- `components/auth/AuthButton.tsx` - Botón de autenticación para la navbar
- `components/auth/AuthProvider.tsx` - Provider que inicializa la autenticación
- `components/layout/Navbar.tsx` - Barra de navegación con autenticación

### Rutas API
- `app/api/auth/login/route.ts` - Endpoint para login
- `app/api/auth/register/route.ts` - Endpoint para registro
- `app/api/auth/logout/route.ts` - Endpoint para logout
- `app/api/auth/session/route.ts` - Endpoint para verificar sesión

### Middleware
- `middleware.ts` - Middleware de Next.js que protege rutas

### Páginas
- `app/login/page.tsx` - Página de login/registro

## Uso

### En un componente

```tsx
'use client';

import { useAuth } from '@/hooks/use-auth';

export function MyComponent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    return <div>No estás autenticado</div>;
  }

  return (
    <div>
      <p>Hola, {user?.email}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

### Proteger rutas

El middleware protege automáticamente las rutas definidas en `protectedPaths`. Para agregar más rutas protegidas, edita `middleware.ts`:

```typescript
const protectedPaths = ['/clinics', '/dashboard', '/mi-ruta'];
```

### Verificar autenticación en Server Components

```typescript
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function MyPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Contenido protegido</div>;
}
```

## Configuración en Supabase

1. Ve a tu proyecto en Supabase
2. Navega a **Authentication** → **Settings**
3. Asegúrate de que **Email** esté habilitado como método de autenticación
4. Configura las políticas de Row Level Security (RLS) según tus necesidades

## Variables de Entorno

Las mismas variables de entorno que ya tienes configuradas son suficientes:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## Notas

- El sistema usa cookies para mantener la sesión
- Las sesiones se refrescan automáticamente
- No se requiere ninguna librería adicional de autenticación
- Todo está implementado usando las APIs nativas de Supabase
