"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function ModalExamples() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [withFormOpen, setWithFormOpen] = useState(false);
  const [sizesOpen, setSizesOpen] = useState<{ [key: string]: boolean }>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
  });

  return (
    <div className="space-y-8">
      {/* Basic Modal */}
      <div>
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
          Básico
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setBasicOpen(true)}>
            Abrir Modal Básico
          </Button>
        </div>
        <Modal
          open={basicOpen}
          onClose={() => setBasicOpen(false)}
          title="Modal Básico"
          description="Este es un ejemplo de modal básico con título y descripción."
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            Este es el contenido del modal. Puedes agregar cualquier contenido aquí.
          </p>
        </Modal>
      </div>

      {/* Modal with Form */}
      <div>
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
          Con Formulario
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setWithFormOpen(true)}>
            Abrir Modal con Formulario
          </Button>
        </div>
        <Modal
          open={withFormOpen}
          onClose={() => setWithFormOpen(false)}
          title="Crear Nueva Clínica"
          description="Completa el formulario para agregar una nueva clínica."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Formulario enviado!');
              setWithFormOpen(false);
            }}
            className="space-y-4"
          >
            <Input
              label="Nombre de la Clínica"
              placeholder="Ej: Clínica Central"
              required
            />
            <Input
              label="Dirección"
              placeholder="Ej: Calle Principal 123"
              required
            />
            <Select label="Estado" placeholder="Selecciona un estado" required>
              <option value="il">Illinois</option>
              <option value="ny">New York</option>
              <option value="fl">Florida</option>
            </Select>
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+1 234 567 8900"
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary">
                Guardar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setWithFormOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      {/* Modal Sizes */}
      <div>
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
          Tamaños
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setSizesOpen({ ...sizesOpen, sm: true })}>
            Small
          </Button>
          <Button onClick={() => setSizesOpen({ ...sizesOpen, md: true })}>
            Medium
          </Button>
          <Button onClick={() => setSizesOpen({ ...sizesOpen, lg: true })}>
            Large
          </Button>
          <Button onClick={() => setSizesOpen({ ...sizesOpen, xl: true })}>
            Extra Large
          </Button>
        </div>

        <Modal
          open={sizesOpen.sm}
          onClose={() => setSizesOpen({ ...sizesOpen, sm: false })}
          title="Modal Small"
          size="sm"
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            Este es un modal pequeño (max-w-md).
          </p>
        </Modal>

        <Modal
          open={sizesOpen.md}
          onClose={() => setSizesOpen({ ...sizesOpen, md: false })}
          title="Modal Medium"
          size="md"
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            Este es un modal mediano (max-w-lg). Este es el tamaño por defecto.
          </p>
        </Modal>

        <Modal
          open={sizesOpen.lg}
          onClose={() => setSizesOpen({ ...sizesOpen, lg: false })}
          title="Modal Large"
          size="lg"
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            Este es un modal grande (max-w-2xl). Perfecto para contenido más extenso.
          </p>
        </Modal>

        <Modal
          open={sizesOpen.xl}
          onClose={() => setSizesOpen({ ...sizesOpen, xl: false })}
          title="Modal Extra Large"
          size="xl"
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            Este es un modal extra grande (max-w-4xl). Ideal para tablas o contenido muy amplio.
          </p>
        </Modal>
      </div>

      {/* Modal Options */}
      <div>
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
          Opciones
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              • Cerrar con tecla Escape
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              • Cerrar haciendo click en el overlay (configurable)
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              • Botón de cerrar opcional
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              • Previene scroll del body cuando está abierto
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              • Soporte completo para dark mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
