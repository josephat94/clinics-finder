import { NextRequest, NextResponse } from "next/server";
import { getClinicsByState, getAllClinics, createClinic } from "@/lib/clinics";
import { geocodeAddress, getTravelTimes } from "@/lib/google";
import { haversineKm } from "@/lib/distance-algoritms";
import type { ClinicInsert } from "@/lib/clinics";

/**
 * GET /api/clinics
 * Obtiene clínicas, opcionalmente filtradas por estado
 *
 * Query params:
 * - state: código del estado (ej: 'IL', 'NY', 'FL')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state");
    const search = searchParams.get("search");
    const extraFilter = searchParams.get("extraFilter");

    let clinics;

    if (state) {
      // Filtrar por estado si se proporciona
      clinics = await getClinicsByState(state);
    
      if(extraFilter) {
      clinics = clinics.filter(c => c.name?.toLowerCase().includes(extraFilter.toLowerCase()));
      
    }

      if (search && clinics.length > 0) {
        const userCoords = await geocodeAddress(search);

        console.log(":::::: GEOCODE USER ::::::", userCoords);

        if (userCoords?.lat && userCoords?.lng) {
          // 2️⃣ Haversine → prefiltrar
          const clinicsWithDistance = clinics
            .filter((c) => c.lat && c.lng)
            .map((c) => ({
              ...c,
              distanceKm: haversineKm(
                userCoords?.lat,
                userCoords?.lng,
                c.lat ?? 0,
                c.lng ?? 0
              ),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 10);

          console.log(
            ":::::: CLINICS WITH DISTANCE ::::::",
            clinicsWithDistance
          );
          
          // Obtener las 3 clínicas más cercanas para calcular travel times
          const least3Clinics = clinicsWithDistance.slice(0, 3);
          const travelTimes = await getTravelTimes(
            userCoords,
            least3Clinics.map((c) => ({ lat: c.lat ?? 0, lng: c.lng ?? 0 }))
          );

          console.log(":::::: TRAVEL TIMES ::::::", travelTimes);

          // Agregar travel time solo a la respuesta, sin modificar la interfaz original
          // Mapear todas las clínicas y agregar travel time solo a las que lo tienen
          clinics = clinicsWithDistance.map((clinic, index) => {
            // Si esta clínica está en las primeras 3, agregar el travel time
            if (index < 3 && travelTimes[index]) {
              return {
                ...clinic,
                travelTime: travelTimes[index],
              };
            }
            // Para las demás, retornar sin modificar
            return clinic;
          });

        }
      }
    } else {
      // Obtener todas las clínicas si no hay filtro
      clinics = await getAllClinics();
    }

    return NextResponse.json({ clinics }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/clinics
 * Crea una nueva clínica
 *
 * Body:
 * - ClinicInsert object
 */
export async function POST(request: NextRequest) {
  try {
    const body: ClinicInsert = await request.json();

    // Validar que el nombre sea requerido
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la clínica es requerido" },
        { status: 400 }
      );
    }

    // Si hay dirección y estado, intentar geocodificar
    let lat: number | null = null;
    let lng: number | null = null;
    if (body.address && body.state) {
      const fullAddress = `${body.address}, ${body.state}${
        body.zipcode ? ` ${body.zipcode}` : ""
      }`;
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    // Preparar el objeto para insertar usando el tipo de Database
    const clinicToInsert: ClinicInsert & { lat?: number | null; lng?: number | null } = {
      ...body,
      lat,
      lng,
    };

    // Establecer enabled por defecto si no se proporciona
    if (clinicToInsert.enabled === undefined) {
      clinicToInsert.enabled = true;
    }

    const clinic = await createClinic(clinicToInsert);

    return NextResponse.json({ clinic }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
