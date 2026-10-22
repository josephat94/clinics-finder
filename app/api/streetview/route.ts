import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-server';

/**
 * Devuelve la foto de Street View de un punto.
 * La clave de Google se queda en el servidor.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const lat = Number(request.nextUrl.searchParams.get('lat'));
  const lng = Number(request.nextUrl.searchParams.get('lng'));
  const coordinatesAreValid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  if (!coordinatesAreValid) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Street View is not configured' }, { status: 500 });
  }

  const location = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const metadataParams = new URLSearchParams({
    location,
    source: 'outdoor',
    key,
  });
  const metadataResponse = await fetch(
    `https://maps.googleapis.com/maps/api/streetview/metadata?${metadataParams}`,
    { cache: 'no-store' }
  );
  const metadata = (await metadataResponse.json()) as {
    status?: string;
    pano_id?: string;
    location?: { lat?: number; lng?: number };
  };

  if (metadata.status !== 'OK' || !metadata.pano_id) {
    return new NextResponse(null, {
      status: metadata.status === 'ZERO_RESULTS' || metadata.status === 'NOT_FOUND' ? 404 : 502,
    });
  }

  const camera = metadata.location;
  const heading =
    typeof camera?.lat === 'number' && typeof camera?.lng === 'number'
      ? headingToward({ lat: camera.lat, lng: camera.lng }, { lat, lng })
      : 0;
  const outdoorHeaders = {
    'X-Streetview-Pano': metadata.pano_id,
    'X-Streetview-Heading': heading.toFixed(1),
  };

  const imageParams = new URLSearchParams({
    size: '640x360',
    pano: metadata.pano_id,
    heading: heading.toFixed(1),
    pitch: '0',
    fov: '80',
    source: 'outdoor',
    return_error_code: 'true',
    key,
  });
  const googleResponse = await fetch(
    `https://maps.googleapis.com/maps/api/streetview?${imageParams}`,
    { cache: 'no-store' }
  );

  if (!googleResponse.ok) {
    return new NextResponse(null, {
      status: googleResponse.status === 404 ? 404 : 502,
      headers: outdoorHeaders,
    });
  }

  const bytes = await googleResponse.arrayBuffer();
  return new NextResponse(bytes, {
    headers: {
      ...outdoorHeaders,
      'Content-Type': googleResponse.headers.get('Content-Type') ?? 'image/jpeg',
      'Cache-Control': 'private, max-age=86400',
    },
  });
}

/** Rumbo desde la cámara de la calle hacia la clínica, en grados. */
function headingToward(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
