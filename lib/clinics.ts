import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { geocodeAddress } from "@/lib/google";
import {
  clinicToAuditData,
  getChangedFields,
  logClinicAudit,
  type AuditActor,
} from "@/lib/clinic-audit";

// Tipos derivados de la base de datos
type Clinic = Database["public"]["Tables"]["clinics"]["Row"];
type ClinicInsert = Database["public"]["Tables"]["clinics"]["Insert"];
type ClinicUpdate = Database["public"]["Tables"]["clinics"]["Update"];

// Re-exportar tipos para facilitar su uso
export type { Clinic, ClinicInsert, ClinicUpdate };

/**
 * Obtiene todas las clínicas de la base de datos
 */
export async function getAllClinics(): Promise<Clinic[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener las clínicas: ${error.message}`);
  }

  return data || [];
}

/**
 * Obtiene una clínica por su ID
 */
export async function getClinicById(id: string): Promise<Clinic | null> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No se encontró la clínica
    }
    throw new Error(`Error al obtener la clínica: ${error.message}`);
  }

  return data;
}

/**
 * Crea una nueva clínica
 */
export async function createClinic(
  clinic: ClinicInsert,
  actor?: AuditActor
): Promise<Clinic> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("clinics")
    .insert(clinic as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear la clínica: ${error.message}`);
  }

  const created = data as Clinic;

  if (actor) {
    await logClinicAudit({
      action: "create",
      actor,
      clinicId: created.id,
      clinicName: created.name,
      newData: clinicToAuditData(created),
    });
  }

  return created;
}

/**
 * Actualiza una clínica existente
 */
export async function updateClinic(
  id: string,
  updates: ClinicUpdate,
  actor?: AuditActor
): Promise<Clinic> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const previous = actor ? await getClinicById(id) : null;

  // Usar una aserción más específica para evitar problemas de tipos
  const clinicsTable = supabase.from("clinics") as any;

  const { data, error } = await clinicsTable
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar la clínica: ${error.message}`);
  }

  const updated = data as Clinic;

  if (actor && previous) {
    await logClinicAudit({
      action: "update",
      actor,
      clinicId: updated.id,
      clinicName: updated.name,
      oldData: clinicToAuditData(previous),
      newData: clinicToAuditData(updated),
      changedFields: getChangedFields(previous, updated),
    });
  }

  return updated;
}

/**
 * Elimina una clínica
 */
export async function deleteClinic(
  id: string,
  actor?: AuditActor
): Promise<void> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const previous = actor ? await getClinicById(id) : null;

  if (actor && previous) {
    await logClinicAudit({
      action: "delete",
      actor,
      clinicId: previous.id,
      clinicName: previous.name,
      oldData: clinicToAuditData(previous),
    });
  }

  const { error } = await supabase.from("clinics").delete().eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar la clínica: ${error.message}`);
  }
}

/**
 * Obtiene clínicas filtradas por estado
 * @param stateCode - Código del estado (ej: 'IL', 'NY', 'FL')
 * @returns Array de clínicas que pertenecen al estado especificado
 */
export async function getClinicsByState(stateCode: string): Promise<Clinic[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("state", stateCode)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Error al obtener las clínicas por estado: ${error.message}`
    );
  }

  return data || [];
}

export async function geocodeClinics(
  clinics: Clinic[]
): Promise<{ updated: number; skipped: number }> {
  let updated = 0;
  let skipped = 0;

  const cookieStore = await cookies();
  
  // Crear un cliente sin tipo genérico para evitar validación de esquema cache
  // Esto permite actualizar campos que pueden no estar en el cache del esquema
  const { createServerClient } = await import("@supabase/ssr");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
  
  const rawSupabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignorar errores en Server Components
        }
      },
    },
  });

  console.log(`\n📍 Iniciando geocodificación de ${clinics.length} clínicas...\n`);

  for (const clinic of clinics) {

    console.log(`🔍 Clínica:`, clinic);
    // ⛔ Saltar si ya tiene coordenadas
    if (clinic.lat && clinic.lng) {
      console.log(`⏭️  Saltada (ya tiene coordenadas): ${clinic.name}`);
      skipped++;
      continue;
    }

    if (!clinic.address || !clinic.state) {
      console.log(`⏭️  Saltada (sin dirección/estado): ${clinic.name}`);
      skipped++;
      continue;
    }

    const fullAddress = `${clinic.address}, ${clinic.state}${
      clinic.zipcode ? ` ${clinic.zipcode}` : ""
    }`;

    console.log(`🔍 Geocodificando: ${clinic.name} - ${fullAddress}`);

    const coords = await geocodeAddress(fullAddress);
    if (!coords) {
      console.log(`❌ No se pudo geocodificar: ${clinic.name}`);
      skipped++;
      continue;
    }

    const lat = coords.lat ?? null;
    const lng = coords.lng ?? null;

    console.log(`📌 Coordenadas obtenidas: ${lat}, ${lng} para ${clinic.name}`);

    // Intentar actualización directa con el cliente raw (sin tipo genérico)
    // Usar Record<string, any> para evitar cualquier validación de tipos
    const updatePayload: Record<string, any> = {
      lat: lat,
      lng: lng,
    };

    // Forzar el update sin validación de esquema usando múltiples niveles de casting
    const table = (rawSupabase as any).from("clinics");
    const result = await (table.update(updatePayload) as any)
      .eq("id", clinic.id)
      .select();

    if (result.error) {
      console.error(`❌ Error al actualizar ${clinic.name}:`, result.error.message);
      console.error(`   Código del error: ${result.error.code}`);
      console.error(`   Detalles completos:`, JSON.stringify(result.error, null, 2));
      
      // Si el error es de schema cache, intentar con updateClinic como fallback
      if (result.error.message?.includes("schema cache")) {
        console.log(`   Intentando fallback con updateClinic...`);
        try {
          await updateClinic(clinic.id, updatePayload as any);
          updated++;
          console.log(`✔ Actualizada (fallback): ${clinic.name} → ${lat}, ${lng}`);
        } catch (fallbackError: any) {
          console.error(`❌ Fallback también falló:`, fallbackError.message);
          skipped++;
        }
      } else {
        skipped++;
      }
      continue;
    }

    // Verificar que realmente se actualizó
    if (result.data && result.data.length > 0) {
      updated++;
      console.log(`✔ Actualizada: ${clinic.name} → ${lat}, ${lng}`);
    } else {
      console.warn(`⚠️  No se encontró fila para actualizar: ${clinic.name} (ID: ${clinic.id})`);
      skipped++;
    }
  }

  console.log(`\n✅ Proceso completado: ${updated} actualizadas, ${skipped} saltadas\n`);

  return { updated, skipped };
}
