"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { WeeklyScheduleEditor } from "@/components/ui/weekly-schedule-editor";
import { Button } from "@/components/ui/button";
import { US_STATES } from "@/utils/states";
import {
  normalizeWeeklySchedule,
  serializeWeeklySchedule,
  validateWeeklySchedule,
  type ScheduleValidationError,
} from "@/utils/clinic-schedule";
import type { ClinicInsert, Clinic } from "@/types/clinic";

const EMPTY_CLINIC_FORM: ClinicInsert = {
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
};

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
  const t = useTranslations("clinics");
  const common = useTranslations("common");

  const formatScheduleError = (issue: ScheduleValidationError) => {
    const block = issue.block + 1;
    if (issue.code === "missingDays") return t("scheduleMissingDays", { block });
    if (issue.code === "missingHours") return t("scheduleMissingHours", { block });
    if (issue.code === "overlap") return t("scheduleOverlap", { block });
    if (issue.code === "duplicateDay") {
      const dayKey = {
        monday: "dayMonday",
        tuesday: "dayTuesday",
        wednesday: "dayWednesday",
        thursday: "dayThursday",
        friday: "dayFriday",
        saturday: "daySaturday",
        sunday: "daySunday",
      } as const;
      return t("scheduleDuplicateDay", { block, day: t(dayKey[issue.day]) });
    }
    const range = issue.range + 1;
    if (issue.code === "bothTimes") return t("scheduleBothTimes", { block, range });
    if (issue.code === "incompleteRange") return t("scheduleIncomplete", { block, range });
    return t("scheduleTimeOrder", { block, range });
  };

  const [formData, setFormData] = useState<ClinicInsert>(EMPTY_CLINIC_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<"name" | "email" | "website" | null>(null);
  const [scheduleError, setScheduleError] = useState<ScheduleValidationError | null>(null);

  // Cargar datos de la clínica cuando se abre en modo edición
  useEffect(() => {
    if (open && clinic) {
      setFormData({
        name: clinic.name || "",
        phone: clinic.phone,
        secondary_phone: clinic.secondary_phone,
        fax: clinic.fax,
        email: clinic.email,
        address: clinic.address,
        state: clinic.state,
        zipcode: clinic.zipcode,
        notes: clinic.notes,
        website: clinic.website,
        weekly_schedule: normalizeWeeklySchedule(clinic.weekly_schedule),
        lat: clinic.lat,
        lng: clinic.lng,
        enabled: clinic.enabled ?? true,
        banned: clinic.banned ?? false,
        bilingual: clinic.bilingual ?? false,
      });
    } else if (open && !clinic) {
      // Resetear formulario en modo creación
      setFormData(EMPTY_CLINIC_FORM);
    }
    setError(null);
    setFieldError(null);
    setScheduleError(null);
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
    if (error) {
      setError(null);
      setFieldError(null);
      setScheduleError(null);
    }
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
    setFieldError(null);
    setScheduleError(null);
    setIsSubmitting(true);

    try {
      // Validar que el nombre sea requerido
      if (!formData.name || formData.name.trim() === "") {
        setFieldError("name");
        setError(t("nameRequired"));
        setIsSubmitting(false);
        return;
      }

      // Validar email si se proporciona
      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setFieldError("email");
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
          setFieldError("website");
          setError(t("invalidWebsite"));
          setIsSubmitting(false);
          return;
        }
      }

      const nextScheduleError = validateWeeklySchedule(formData.weekly_schedule);
      if (nextScheduleError) {
        setScheduleError(nextScheduleError);
        setError(formatScheduleError(nextScheduleError));
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        weekly_schedule: serializeWeeklySchedule(formData.weekly_schedule),
      };

      const url = isEditMode ? `/api/clinics/${clinic.id}` : "/api/clinics";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || (isEditMode ? t("updateError") : t("createError"))
        );
      }

      // Limpiar el formulario
      setFormData(EMPTY_CLINIC_FORM);

      // Cerrar el modal y notificar éxito
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : isEditMode
          ? t("unknownUpdate")
          : t("unknownCreate");
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData(EMPTY_CLINIC_FORM);
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditMode ? t("editTitle") : t("addTitle")}
      description={isEditMode ? t("editDescription") : t("addDescription")}
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
            error={fieldError === "name"}
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
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-blue-400 dark:focus:ring-blue-500"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={common("email")}
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder={t("emailPlaceholder")}
          error={fieldError === "email"}
        />

        <Input
          label={t("website")}
          name="website"
          type="url"
          value={formData.website || ""}
          onChange={handleChange}
          placeholder={t("websitePlaceholder")}
          error={fieldError === "website"}
        />
        </div>


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
          />

          <Input
            label={t("zip")}
            name="zipcode"
            value={formData.zipcode || ""}
            onChange={handleChange}
            placeholder="12345"
          />
        </div>

        <WeeklyScheduleEditor
          value={formData.weekly_schedule}
          onChange={(weekly_schedule) => {
            setFormData((prev) => ({
              ...prev,
              weekly_schedule,
            }));
            if (error || scheduleError) {
              setError(null);
              setScheduleError(null);
            }
          }}
          error={scheduleError}
        />

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
            {isSubmitting
              ? isEditMode
                ? t("updating")
                : t("saving")
              : isEditMode
              ? t("updateClinic")
              : t("saveClinic")}
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
