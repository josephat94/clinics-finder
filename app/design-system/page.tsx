'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ModalExamples } from './ModalExamples';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
          Design System
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-12">
          Componentes base que extienden elementos HTML nativos
        </p>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Botones
          </h2>

          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Variantes
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Tamaños
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Estados
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button type="submit">Submit</Button>
                <Button type="button" onClick={() => alert('Clicked!')}>
                  Con onClick
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Inputs
          </h2>

          <div className="space-y-8">
            {/* Basic Inputs */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Básicos
              </h3>
              <div className="space-y-4 max-w-md">
                <Input placeholder="Input sin label" />
                <Input label="Nombre completo" placeholder="Escribe tu nombre" />
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  helperText="Nunca compartiremos tu email"
                />
              </div>
            </div>

            {/* Input States */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Estados
              </h3>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Contraseña"
                  type="password"
                  error
                  errorText="La contraseña debe tener al menos 8 caracteres"
                />
                <Input
                  label="Usuario"
                  placeholder="username"
                  disabled
                  helperText="Campo deshabilitado"
                />
                <Input
                  label="Búsqueda"
                  type="search"
                  placeholder="Buscar..."
                  required
                />
              </div>
            </div>

            {/* Input Types */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Tipos
              </h3>
              <div className="space-y-4 max-w-md">
                <Input label="Fecha" type="date" />
                <Input label="Hora" type="time" />
                <Input label="Número" type="number" placeholder="0" />
                <Input label="URL" type="url" placeholder="https://..." />
                <Input label="Teléfono" type="tel" placeholder="+1 234 567 8900" />
              </div>
            </div>
          </div>
        </section>

        {/* Selects Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Selects
          </h2>

          <div className="space-y-8">
            {/* Basic Selects */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Básicos
              </h3>
              <div className="space-y-4 max-w-md">
                <Select
                options={[{ value: "1", label: "Opción 1" }, { value: "2", label: "Opción 2" }, { value: "3", label: "Opción 3" }]}
                placeholder="Selecciona una opción"
                />
                <Select
                options={[{ value: "mx", label: "México" }, { value: "us", label: "Estados Unidos" }, { value: "ca", label: "Canadá" }, { value: "es", label: "España" }]}
                label="País"
                placeholder="Selecciona un país"
                />
                <Select
                options={[{ value: "cdmx", label: "Ciudad de México" }, { value: "jal", label: "Jalisco" }, { value: "nl", label: "Nuevo León" }, { value: "yuc", label: "Yucatán" }]}
                  label="Estado"
                  placeholder="Selecciona un estado"
                  helperText="Selecciona el estado donde vives"
                />
              </div>
            </div>

            {/* Select States */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Estados
              </h3>
              <div className="space-y-4 max-w-md">
                <Select
                options={[{ value: "1", label: "Categoría 1" }, { value: "2", label: "Categoría 2" }]}
                  label="Categoría"
                  placeholder="Selecciona una categoría"
                  error
                  errorText="Debes seleccionar una categoría"
                />
                <Select
                options={[{ value: "1", label: "Tipo 1" }, { value: "2", label: "Tipo 2" }]}
                  label="Tipo"
                  placeholder="Selecciona un tipo"
                  disabled
                  helperText="Campo deshabilitado"
                />
                <Select
                options={[{ value: "low", label: "Baja" }, { value: "medium", label: "Media" }, { value: "high", label: "Alta" }]}
                  label="Prioridad"
                  placeholder="Selecciona una prioridad"
                  required
                >
                 
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Modals Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Modals
          </h2>
          <ModalExamples />
        </section>

        {/* Usage Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
            Ejemplo de Uso
          </h2>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Formulario enviado!');
              }}
              className="space-y-4"
            >
              <Input
                label="Nombre"
                name="name"
                required
                placeholder="Tu nombre"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                required
                placeholder="tu@email.com"
              />
              <Select
                options={[{ value: "mx", label: "México" }, { value: "us", label: "Estados Unidos" }, { value: "ca", label: "Canadá" }]}
                label="País"
                name="country"
                required
                placeholder="Selecciona un país"
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary">
                  Enviar
                </Button>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
