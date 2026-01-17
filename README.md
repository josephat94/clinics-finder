This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Configuración de Supabase

Este proyecto está configurado para conectarse a Supabase. Para configurarlo:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Obtén tus credenciales de Supabase desde: https://app.supabase.com/project/_/settings/api
3. Agrega las siguientes variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_clave_publicable_aqui
```

### Estructura de la base de datos

El proyecto espera una tabla llamada `clinics` en Supabase. Asegúrate de que tu tabla tenga al menos los siguientes campos (puedes agregar más según necesites):

- `id` (uuid, primary key)
- `name` (text)
- `address` (text)
- `phone` (text)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Puedes actualizar los tipos en `types/database.ts` para reflejar la estructura exacta de tu tabla.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Uso del cliente de Supabase

El proyecto incluye funciones helper en `lib/clinics.ts` para interactuar con la tabla de clínicas:

```typescript
import { getAllClinics, getClinicById, createClinic } from '@/lib/clinics';

// Obtener todas las clínicas
const clinics = await getAllClinics();

// Obtener una clínica por ID
const clinic = await getClinicById('id-aqui');

// Crear una nueva clínica
const newClinic = await createClinic({
  name: 'Nombre de la clínica',
  address: 'Dirección',
  phone: '123-456-7890',
  email: 'email@example.com'
});
```

También puedes usar el cliente directamente desde `utils/supabase/server.ts` (para Server Components) o `utils/supabase/client.ts` (para Client Components):

```typescript
// En Server Components
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const cookieStore = cookies();
const supabase = createClient(cookieStore);

const { data, error } = await supabase
  .from('clinics')
  .select('*');
```

```typescript
// En Client Components
'use client';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const { data, error } = await supabase
  .from('clinics')
  .select('*');
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
