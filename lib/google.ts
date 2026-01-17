export type LatLng = {
  lat: number;
  lng: number;
};

export async function geocodeAddress(
  address: string
): Promise<LatLng | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results.length) {
    console.warn("Geocode failed:", address, data.status);
    return null;
  }

  console.log(":::::: GEOCODE ADDRESS ::::::", data.results[0].geometry.location);
  return data.results[0].geometry.location;
}

/**
 * Calcula el tiempo de viaje en carro entre un origen y múltiples destinos
 * usando la Google Directions API
 * 
 * @param origin - Coordenadas del punto de origen
 * @param destinations - Array de coordenadas de destinos
 * @returns Array de objetos con información de tiempo de viaje para cada destino
 */
export async function getTravelTimes(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number }[]
): Promise<Array<{
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  status: string;
}>> {
  const results = [];

  // La Directions API solo permite un destino por request
  // Por lo tanto, hacemos múltiples requests en paralelo
  const promises = destinations.map(async (destination) => {
    const originParam = `${origin.lat},${origin.lng}`;
    const destinationParam = `${destination.lat},${destination.lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destinationParam}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log(":::::: DIRECTIONS API RESPONSE ::::::", data);

      if (data.status !== "OK") {
        console.warn(
          `Directions API failed for destination ${destinationParam}:`,
          data.status
        );
        return {
          distance: { text: "N/A", value: 0 },
          duration: { text: "N/A", value: 0 },
          status: data.status,
        };
      }

      // Extraer la primera ruta (la más rápida)
      const route = data.routes[0];
      if (!route || !route.legs || route.legs.length === 0) {
        return {
          distance: { text: "N/A", value: 0 },
          duration: { text: "N/A", value: 0 },
          status: "ZERO_RESULTS",
        };
      }

      const leg = route.legs[0];
      return {
        distance: leg.distance,
        duration: leg.duration,
        status: "OK",
      };
    } catch (error) {
      console.error(
        `Error fetching directions for ${destinationParam}:`,
        error
      );
      return {
        distance: { text: "Error", value: 0 },
        duration: { text: "Error", value: 0 },
        status: "ERROR",
      };
    }
  });

  // Esperar todas las requests en paralelo
  const travelTimes = await Promise.all(promises);
  return travelTimes;
}