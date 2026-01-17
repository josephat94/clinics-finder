# Configuración de Variables de Entorno

Para conectar tu aplicación Next.js con Supabase, necesitas configurar las siguientes variables de entorno.

## Pasos para configurar

1. Crea un archivo `.env.local` en la raíz del proyecto (al mismo nivel que `package.json`)

2. Obtén tus credenciales de Supabase:
   - Ve a tu proyecto en Supabase: https://app.supabase.com
   - Navega a **Settings** → **API**
   - Copia los siguientes valores:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **Publishable Default Key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
     - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Solo para uso en servidor)

3. Agrega las variables a tu archivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_clave_publicable_aqui

# Service Role Key (solo para operaciones de administración en el servidor)
# ⚠️ NUNCA expongas esta clave en el cliente
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## Ejemplo completo

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIzNDU2NywiZXhwIjoxOTYwODEwNTY3fQ.ejemplo

# Service Role Key (para Admin API - solo servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1MjM0NTY3LCJleHAiOjE5NjA4MTA1Njd9.ejemplo
```

## Importante

- ⚠️ **NUNCA** subas el archivo `.env.local` a Git (ya está en `.gitignore`)
- ✅ El prefijo `NEXT_PUBLIC_` es necesario para que las variables estén disponibles en el cliente
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` **NO** debe tener el prefijo `NEXT_PUBLIC_` ya que es solo para uso en servidor
- 🔄 Reinicia el servidor de desarrollo después de agregar/modificar las variables de entorno

## Verificar la conexión

Una vez configurado, puedes verificar que la conexión funciona visitando:
- http://localhost:3000/clinics
- http://localhost:3000/admin/users (requiere ser admin)

Si ves un error, verifica que:
1. Las variables de entorno estén correctamente configuradas
2. Tu tabla `clinics` exista en Supabase
3. Las políticas de Row Level Security (RLS) permitan el acceso necesario
4. Para la gestión de usuarios, necesitas tener configurado `SUPABASE_SERVICE_ROLE_KEY`