# Sistema de Roles y Gestión de Usuarios

Este proyecto implementa un sistema de roles donde solo los administradores pueden crear usuarios. El registro público está deshabilitado.

## Roles Disponibles

- **admin**: Puede crear y gestionar usuarios
- **user**: Usuario estándar con acceso a las funcionalidades básicas

## Configurar el Primer Usuario Admin

Para crear el primer usuario administrador, tienes dos opciones:

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Navega a **Authentication** → **Users**
3. Crea un nuevo usuario manualmente o usa uno existente
4. Haz clic en el usuario y edita sus **User Metadata**
5. Agrega el siguiente JSON:
```json
{
  "role": "admin"
}
```

### Opción 2: Usando SQL en Supabase

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el siguiente SQL (reemplaza `'tu-email@ejemplo.com'` con el email del usuario):

```sql
-- Actualizar metadata del usuario para hacerlo admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'tu-email@ejemplo.com';
```

## Crear Usuarios (Solo Admins)

Una vez que tengas un usuario admin configurado:

1. Inicia sesión con tu cuenta admin
2. Ve a **Usuarios** en la barra de navegación (solo visible para admins)
3. Completa el formulario para crear un nuevo usuario
4. Selecciona el rol (user o admin)

## Protección de Rutas

- Las rutas `/admin/*` están protegidas y solo son accesibles para usuarios con rol `admin`
- El middleware verifica automáticamente el rol antes de permitir el acceso

## Verificar Roles en Componentes

```tsx
'use client';

import { useRole } from '@/hooks/use-role';

export function MyComponent() {
  const { role, isAdmin, hasRole } = useRole();

  if (isAdmin) {
    return <div>Eres administrador</div>;
  }

  return <div>Eres usuario estándar</div>;
}
```

## Notas Importantes

- ⚠️ El registro público está **deshabilitado** por seguridad
- ✅ Solo los admins pueden crear nuevos usuarios
- 🔒 Los roles se almacenan en `user_metadata.role` de Supabase
- 📝 Para cambiar el rol de un usuario, edítalo desde Supabase Dashboard o usa el Admin API
