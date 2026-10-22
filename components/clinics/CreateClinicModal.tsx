"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { US_STATES } from "@/utils/states";
import type { ClinicInsert } from "@/types/clinic";

export interface CreateClinicModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateClinicModal({
  open,
  onClose,
  onSuccess,
}: CreateClinicModalProps) {
  const t = useTranslations("clinics");
  const common = useTranslations("common");
  const [formData, setFormData] = useState<ClinicInsert>({
    name: "",
    phone: null,
    secondary_phone: null,
    fax: null,
    email: null,
    address: null,
    state: null,
    zipcode: null,
    notes: null,
    website: null,
    weekly_schedule: [],
    lat: null,
    lng: null,
    enabled: true,
    banned: false,
    bilingual: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(t("nameRequired"));
        setIsSubmitting(false);
        return;
      }

      // Validar email si se proporciona
      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError(t("invalidEmail"));
          setIsSubmitting(false);
          return;
        }
      }

      // Validar URL del website si se proporciona
      if (formData.website && formData.website.trim() !== "") {
        try {
          new URL(formData.website);
        } catch {
          setError(t("invalidWebsite"));
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("createError"));
      }

      // Limpiar el formulario
      setFormData({
        name: "",
        phone: null,
        secondary_phone: null,
        fax: null,
        email: null,
        address: null,
        state: null,
        zipcode: null,
        notes: null,
        website: null,
        weekly_schedule: [],
        lat: null,
        lng: null,
        enabled: true,
        banned: false,
        bilingual: false,
      });

      // Cerrar el modal y notificar éxito
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("unknownCreate");
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
        secondary_phone: null,
        fax: null,
        email: null,
        address: null,
        state: null,
        zipcode: null,
        notes: null,
        website: null,
        weekly_schedule: [],
        lat: null,
        lng: null,
        enabled: true,
        banned: false,
        bilingual: false,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("addTitle")}
      description={t("addDescription")}
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
            label={t("clinicName")}
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
            placeholder={t("clinicNamePlaceholder")}
            error={error === t("nameRequired")}
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
                {t("enabled")}
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
                {t("blacklistLabel")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bilingual"
                name="bilingual"
                checked={formData.bilingual ?? false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-zinc-300 text-[#0f766e] focus:ring-2 focus:ring-hub-primary dark:border-zinc-700 dark:text-blue-400 dark:focus:ring-blue-500"
              />
              <label
                htmlFor="bilingual"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                {t("bilingualLabel")}
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("phoneLabel")}
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />

          <Input
            label={t("secondaryPhoneLabel")}
            name="secondary_phone"
            type="tel"
            value={formData.secondary_phone || ""}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          label={common("email")}
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder={t("emailPlaceholder")}
          error={error === t("invalidEmail")}
        />

        <Input
          label={t("website")}
          name="website"
          type="url"
          value={formData.website || ""}
          onChange={handleChange}
          placeholder={t("websitePlaceholder")}
          error={error === t("invalidWebsite")}
        />

        <Input
          label={t("address")}
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder={t("addressPlaceholder")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            options={US_STATES.map((state) => ({
              value: state.code,
              label: state.name,
            }))}
            label={t("state")}
            name="state"
            value={formData.state || ""}
            onChange={(value) => setFormData({ ...formData, state: value })}
            placeholder={t("selectState")}
            popoverZIndex={250}
          >
          </Select>

          <Input
            label={t("zip")}
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
            {t("notesLabel")}
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={4}
            placeholder={t("notesPlaceholder")}
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
            {isSubmitting ? t("saving") : t("saveClinic")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            {common("cancel")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
