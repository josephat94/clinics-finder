# Design System - Componentes UI

Este directorio contiene los componentes base del design system. Todos los componentes extienden los elementos HTML nativos, manteniendo todas sus propiedades y funcionalidades.

## Componentes Disponibles

### Button

Componente de botón que extiende `<button>` nativo.

```tsx
import { Button } from '@/components/ui';

// Uso básico
<Button>Click me</Button>

// Con variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Con tamaños
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Con todas las props nativas de button
<Button 
  onClick={() => console.log('clicked')}
  disabled
  type="submit"
  aria-label="Submit form"
>
  Submit
</Button>
```

#### Props

- `variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` - Estilo del botón
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del botón
- Todas las props nativas de `<button>` HTML

### Input

Componente de input que extiende `<input>` nativo.

### Select

Componente de select que extiende `<select>` nativo.

```tsx
import { Input } from '@/components/ui';

// Uso básico
<Input placeholder="Escribe algo..." />

// Con label y helper text
<Input 
  label="Email"
  type="email"
  placeholder="tu@email.com"
  helperText="Nunca compartiremos tu email"
/>

// Con estado de error
<Input 
  label="Contraseña"
  type="password"
  error
  errorText="La contraseña debe tener al menos 8 caracteres"
/>

// Con todas las props nativas de input
<Input 
  name="username"
  required
  minLength={3}
  maxLength={20}
  pattern="[a-zA-Z0-9]+"
  aria-label="Nombre de usuario"
/>
```

#### Props

- `error?: boolean` - Indica si el input tiene un error
- `label?: string` - Etiqueta del input
- `helperText?: string` - Texto de ayuda
- `errorText?: string` - Mensaje de error (se muestra cuando `error` es `true`)
- Todas las props nativas de `<input>` HTML

```tsx
import { Select } from '@/components/ui';

// Uso básico
<Select placeholder="Selecciona una opción">
  <option value="1">Opción 1</option>
  <option value="2">Opción 2</option>
  <option value="3">Opción 3</option>
</Select>

// Con label y helper text
<Select 
  label="País"
  placeholder="Selecciona un país"
  helperText="Selecciona tu país de residencia"
>
  <option value="mx">México</option>
  <option value="us">Estados Unidos</option>
  <option value="ca">Canadá</option>
</Select>

// Con estado de error
<Select 
  label="Categoría"
  placeholder="Selecciona una categoría"
  error
  errorText="Debes seleccionar una categoría"
>
  <option value="1">Categoría 1</option>
  <option value="2">Categoría 2</option>
</Select>

// Con todas las props nativas de select
<Select 
  name="country"
  required
  multiple
  size={3}
  aria-label="Países"
>
  <option value="mx">México</option>
  <option value="us">Estados Unidos</option>
</Select>
```

#### Props

- `error?: boolean` - Indica si el select tiene un error
- `label?: string` - Etiqueta del select
- `helperText?: string` - Texto de ayuda
- `errorText?: string` - Mensaje de error (se muestra cuando `error` es `true`)
- `placeholder?: string` - Texto placeholder (se muestra como opción deshabilitada)
- `children: React.ReactNode` - Elementos `<option>` del select
- Todas las props nativas de `<select>` HTML

## Características

✅ **Extienden elementos HTML nativos** - Todos los componentes mantienen todas las props y funcionalidades de sus elementos base

✅ **TypeScript completo** - Tipado completo con todas las props nativas

✅ **Accesibilidad** - Incluyen atributos ARIA y soporte para lectores de pantalla

✅ **Dark mode** - Soporte completo para modo oscuro

✅ **Responsive** - Diseñados para funcionar en todos los tamaños de pantalla

✅ **Combinación de clases** - Usa `cn()` para combinar clases de manera segura
