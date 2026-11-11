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
          <div className="p-3 rounded-lg bg-hub-danger-soft border border-hub-danger/30">
            <p className="text-sm text-hub-danger">{error}</p>
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
                className="h-4 w-4 rounded border-hub-line text-black focus:ring-2 focus:ring-black"
              />
              <label
                htmlFor="enabled"
                className="text-sm font-medium text-hub-fg"
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
                className="h-4 w-4 rounded border-hub-line text-hub-danger focus:ring-2 focus:ring-hub-danger"
              />
              <label
                htmlFor="banned"
                className="text-sm font-medium text-hub-fg"
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
                className="h-4 w-4 rounded border-hub-line text-hub-primary focus:ring-2 focus:ring-hub-primary"
              />
              <label
                htmlFor="bilingual"
                className="text-sm font-medium text-hub-fg"
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
            className="block text-sm font-medium mb-1.5 text-hub-fg"
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
            className="flex w-full rounded-lg border border-hub-line bg-white px-3 py-2 text-base text-black transition-colors placeholder:text-hub-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-hub-line">
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
