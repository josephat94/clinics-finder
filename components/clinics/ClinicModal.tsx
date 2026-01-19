"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { US_STATES } from "@/utils/states";
import type { ClinicInsert, Clinic } from "@/types/clinic";

export interface ClinicModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clinic?: Clinic | null; // Si se proporciona, es modo edición
}

export function ClinicModal({
  open,
  onClose,
  onSuccess,
  clinic,
}: ClinicModalProps) {
  const isEditMode = !!clinic;

  const [formData, setFormData] = useState<ClinicInsert>({
    name: "",
    phone: null,
    fax: null,
    email: null,
    address: null,
    state: null,
    zipcode: null,
    notes: null,
    website: null,
    enabled: true,
    banned: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de la clínica cuando se abre en modo edición
  useEffect(() => {
    if (open && clinic) {
      setFormData({
        name: clinic.name || "",
        phone: clinic.phone,
        fax: clinic.fax,
        email: clinic.email,
        address: clinic.address,
        state: clinic.state,
        zipcode: clinic.zipcode,
        notes: clinic.notes,
        website: clinic.website,
        enabled: clinic.enabled ?? true,
        banned: clinic.banned ?? false,
      });
    } else if (open && !clinic) {
      // Resetear formulario en modo creación
      setFormData({
        name: "",
        phone: null,
        fax: null,
        email: null,
        address: null,
        state: null,
        zipcode: null,
        notes: null,
        website: null,
        enabled: true,
        banned: false,
      });
    }
    setError(null);
  }, [open, clinic]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validar que el nombre sea requerido
      if (!formData.name || formData.name.trim() === "") {
        setError("El nombre de la clínica es requerido");
        setIsSubmitting(false);
        return;
      }

      // Validar email si se proporciona
      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("El email no es válido");
          setIsSubmitting(false);
          return;
        }
      }

      // Validar URL del website si se proporciona
      if (formData.website && formData.website.trim() !== "") {
        try {
          new URL(formData.website);
        } catch {
          setError("La URL del sitio web no es válida");
          setIsSubmitting(false);
          return;
        }
      }

      const url = isEditMode ? `/api/clinics/${clinic.id}` : "/api/clinics";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Error al ${isEditMode ? "actualizar" : "crear"} la clínica`
        );
      }

      // Limpiar el formulario
      setFormData({
        name: "",
        phone: null,
        fax: null,
        email: null,
        address: null,
        state: null,
        zipcode: null,
        notes: null,
        website: null,
        enabled: true,
        banned: false,
      });

      // Cerrar el modal y notificar éxito
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Error desconocido al ${isEditMode ? "actualizar" : "crear"} la clínica`;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        phone: null,
        fax: null,
        email: null,
        address: null,
        state: null,
        zipcode: null,
        notes: null,
        website: null,
        enabled: true,
        banned: false,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Editar Clínica" : "Agregar Nueva Clínica"}
      description={
        isEditMode
          ? "Modifica la información de la clínica."
          : "Completa el formulario para agregar una nueva clínica al sistema."
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Clínica *"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
            placeholder="Ej: Clínica Central"
            error={error?.includes("nombre")}
          />

          <div className="flex flex-col gap-3 pt-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled ?? true}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-2 focus:ring-black dark:border-zinc-700 dark:text-white dark:focus:ring-white"
              />
              <label
                htmlFor="enabled"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Clínica habilitada
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="banned"
                name="banned"
                checked={formData.banned ?? false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-2 focus:ring-red-500 dark:border-zinc-700 dark:text-red-400 dark:focus:ring-red-500"
              />
              <label
                htmlFor="banned"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Clínica baneada
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />

          <Input
            label="Fax"
            name="fax"
            type="tel"
            value={formData.fax || ""}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="clinica@ejemplo.com"
          error={error?.includes("email")}
        />

        <Input
          label="Sitio Web"
          name="website"
          type="url"
          value={formData.website || ""}
          onChange={handleChange}
          placeholder="https://www.ejemplo.com"
          error={error?.includes("URL")}
        />

        <Input
          label="Dirección"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="Calle Principal 123"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            options={US_STATES.map((state) => ({
              value: state.code,
              label: state.name,
            }))}
            label="Estado"
            name="state"
            value={formData.state || ""}
            onChange={(value) => setFormData({ ...formData, state: value })}
            placeholder="Selecciona un estado"
          />

          <Input
            label="Código Postal"
            name="zipcode"
            value={formData.zipcode || ""}
            onChange={handleChange}
            placeholder="12345"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium mb-1.5 text-zinc-900 dark:text-zinc-100"
          >
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={4}
            placeholder="Notas adicionales sobre la clínica..."
            className="flex w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base text-black dark:text-zinc-100 transition-colors placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting
              ? isEditMode
                ? "Actualizando..."
                : "Guardando..."
              : isEditMode
              ? "Actualizar Clínica"
              : "Guardar Clínica"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
