
import { getAllClinics } from "@/lib/clinics";
import { Clinic } from "@/types/clinic";
import { getStatesByCodes } from "@/utils/states";
import { ClinicsPageClient } from "./ClinicsPageClient";

export default async function ClinicsPage() {
  let clinics: Clinic[] = [];
  let error = null;

  try {
    clinics = await getAllClinics();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error al cargar las clínicas
          </h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Asegúrate de haber configurado las variables de entorno de Supabase
            en tu archivo .env.local
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
