
import { getTranslations } from "next-intl/server";
import { getAllClinics } from "@/lib/clinics";
import { Clinic } from "@/types/clinic";
import { getStatesByCodes } from "@/utils/states";
import { ClinicsPageClient } from "./ClinicsPageClient";

export default async function ClinicsPage() {
  const t = await getTranslations("clinics");
  const common = await getTranslations("common");
  let clinics: Clinic[] = [];
  let error = null;

  try {
    clinics = await getAllClinics();
  } catch (e) {
    error = e instanceof Error ? e.message : common("unknown");
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t("loadTitle")}
          </h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            {t("loadHint")}
          </p>
        </div>
      </div>
    );
  }

  // Obtener códigos de estado únicos de las clínicas
  const stateCodes = clinics.map((clinic) => clinic.state);
  const availableStates = getStatesByCodes(stateCodes);

  return (
    <ClinicsPageClient 
      initialClinics={clinics} 
      availableStates={availableStates} 
    />
  );
}
