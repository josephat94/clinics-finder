'use client';

import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Source, Layer, type LayerProps } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ClinicWithTravelTime } from '@/stores';
import type { LatLng } from '@/lib/google';
import { FaUser, FaCrosshairs } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClinicCardContent } from './ClinicCardContent';

// Importación dinámica para evitar problemas de SSR
const Map = dynamic(() => import('react-map-gl/mapbox').then((mod) => mod.default), {
  ssr: false,
});

const Marker = dynamic(() => import('react-map-gl/mapbox').then((mod) => mod.Marker), {
  ssr: false,
});

/** Opaca todos los países excepto Estados Unidos */
const nonUsaMaskLayer: LayerProps = {
  id: 'non-usa-mask',
  type: 'fill',
  source: 'country-boundaries',
  'source-layer': 'country_boundaries',
  filter: [
    'all',
    ['==', ['get', 'disputed'], 'false'],
    [
      'any',
      ['==', 'all', ['get', 'worldview']],
      ['in', 'US', ['get', 'worldview']],
    ],
    ['!=', ['get', 'iso_3166_1'], 'US'],
  ],
  paint: {
    'fill-color': '#0f172a',
    'fill-opacity': 0.55,
  },
};

interface ClinicsMapProps {
  userLocation?: LatLng | null;
  clinics: ClinicWithTravelTime[];
  userAddress?: string;
  selectedClinicId?: string | null;
  showRanking?: boolean;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

const defaultCenter: ViewState = {
  latitude: 39.8283,
  longitude: -98.5795,
  zoom: 4,
};

const rankingLabels = ['1st', '2nd', '3rd'] as const;
const rankingBgColors = ['bg-yellow-500', 'bg-slate-500', 'bg-amber-600'] as const;
const rankingBorderColors = [
  'border-yellow-500',
  'border-slate-500',
  'border-amber-600',
] as const;

interface ClinicMarkerProps {
  clinic: ClinicWithTravelTime;
  index: number;
  isSelected: boolean;
  isPopupOpen: boolean;
  showRanking: boolean;
  onSelect: (clinicId: string) => void;
}

const ClinicMarker = memo(function ClinicMarker({
  clinic,
  index,
  isSelected,
  isPopupOpen,
  showRanking,
  onSelect,
}: ClinicMarkerProps) {
  if (typeof clinic.lat !== 'number' || typeof clinic.lng !== 'number') {
    return null;
  }

  const ranking = showRanking && index < 3 ? rankingLabels[index] : null;
  const markerSize = isSelected ? 'w-14 h-14' : 'w-12 h-12';
  const iconSize = isSelected ? 'w-7 h-7' : 'w-6 h-6';
  const markerBorderColor = isSelected
    ? 'border-blue-500 ring-4 ring-blue-500/30'
    : ranking
    ? rankingBorderColors[index]
    : 'border-white';

  return (
    <Marker longitude={clinic.lng} latitude={clinic.lat} anchor="bottom">
      <button
        type="button"
        className="relative group bg-transparent border-0 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(clinic.id);
        }}
        aria-label={clinic.name}
      >
        {ranking && (
          <div
            className={`absolute -top-2 -right-2 ${rankingBgColors[index]} text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg z-20`}
          >
            {ranking}
          </div>
        )}

        <div
          className={`${markerSize} bg-red-500 rounded-full border-2 ${markerBorderColor} shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-150 ${
            isSelected || isPopupOpen ? 'scale-110' : ''
          }`}
        >
          <svg
            className={`${iconSize} text-white`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg whitespace-nowrap shadow-xl transition-opacity pointer-events-none z-10 max-w-[200px] ${
            isSelected && !isPopupOpen
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="truncate">{clinic.name}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500" />
        </div>
      </button>
    </Marker>
  );
});

export function ClinicsMap({
  userLocation,
  clinics,
  userAddress,
  selectedClinicId,
  showRanking = true,
}: ClinicsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [popupClinicId, setPopupClinicId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const hasFittedBounds = useRef(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasValidUserLocation =
    !!userLocation &&
    typeof userLocation.lat === 'number' &&
    typeof userLocation.lng === 'number' &&
    !isNaN(userLocation.lat) &&
    !isNaN(userLocation.lng);

  const clinicsWithCoords = useMemo(
    () =>
      clinics.filter(
        (c) =>
          typeof c.lat === 'number' &&
          typeof c.lng === 'number' &&
          !isNaN(c.lat) &&
          !isNaN(c.lng)
      ),
    [clinics]
  );

  const initialViewState = useMemo(() => {
    if (clinicsWithCoords.length === 0 && !hasValidUserLocation) {
      return defaultCenter;
    }

    const lats = [
      ...(hasValidUserLocation && userLocation ? [userLocation.lat] : []),
      ...clinicsWithCoords.map((c) => c.lat as number),
    ];
    const lngs = [
      ...(hasValidUserLocation && userLocation ? [userLocation.lng] : []),
      ...clinicsWithCoords.map((c) => c.lng as number),
    ];

    if (lats.length === 0 || lngs.length === 0) {
      return defaultCenter;
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 10;
    if (maxDiff > 0.1) zoom = 9;
    if (maxDiff > 0.2) zoom = 8;
    if (maxDiff > 0.5) zoom = 7;
    if (maxDiff > 1) zoom = 6;
    if (maxDiff > 2) zoom = 5;
    if (maxDiff > 5) zoom = 4;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      zoom,
    };
  }, [userLocation, clinicsWithCoords, hasValidUserLocation]);

  // Ajustar bounds solo una vez al cargar
  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      clinicsWithCoords.length === 0 ||
      hasFittedBounds.current
    ) {
      return;
    }

    const map = mapRef.current.getMap();
    if (!map) return;

    const lats = [
      ...(hasValidUserLocation && userLocation ? [userLocation.lat] : []),
      ...clinicsWithCoords.map((c) => c.lat as number),
    ];
    const lngs = [
      ...(hasValidUserLocation && userLocation ? [userLocation.lng] : []),
      ...clinicsWithCoords.map((c) => c.lng as number),
    ];

    if (lats.length === 0 || lngs.length === 0) return;

    hasFittedBounds.current = true;
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        duration: 800,
      }
    );
  }, [mapLoaded, userLocation, clinicsWithCoords, hasValidUserLocation]);

  const handleFlyToUser = () => {
    if (!mapRef.current || !hasValidUserLocation || !userLocation) return;
    const map = mapRef.current.getMap();
    if (map) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1200,
        essential: true,
      });
    }
  };

  const handleSelectClinic = useCallback((clinicId: string) => {
    setPopupClinicId((current) => (current === clinicId ? null : clinicId));
  }, []);

  const popupClinic = useMemo(
    () => clinicsWithCoords.find((c) => c.id === popupClinicId) ?? null,
    [clinicsWithCoords, popupClinicId]
  );

  const popupIndex = useMemo(
    () =>
      popupClinic
        ? clinicsWithCoords.findIndex((c) => c.id === popupClinic.id)
        : -1,
    [clinicsWithCoords, popupClinic]
  );

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg">
        <p className="text-red-600 dark:text-red-400">
          Error: La API key de Mapbox no está configurada. Agrega
          NEXT_PUBLIC_MAPBOX_API_TOKEN a tus variables de entorno.
        </p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg">
        <p className="text-zinc-600 dark:text-zinc-400">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        onLoad={() => setMapLoaded(true)}
        onClick={() => setPopupClinicId(null)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        reuseMaps
      >
        {mapLoaded && (
          <Source
            id="country-boundaries"
            type="vector"
            url="mapbox://mapbox.country-boundaries-v1"
          >
            <Layer {...nonUsaMaskLayer} />
          </Source>
        )}

        {mapLoaded &&
          clinicsWithCoords.map((clinic, index) => (
            <ClinicMarker
              key={clinic.id}
              clinic={clinic}
              index={index}
              isSelected={selectedClinicId === clinic.id}
              isPopupOpen={popupClinicId === clinic.id}
              showRanking={showRanking}
              onSelect={handleSelectClinic}
            />
          ))}

        {hasValidUserLocation && mapLoaded && userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="bottom"
          >
            <div className="relative group" style={{ zIndex: 1000 }}>
              <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <FaUser />
              </div>
              {userAddress && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {userAddress}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500" />
                </div>
              )}
            </div>
          </Marker>
        )}
      </Map>

      {/* Un solo popup compartido: evita montar 200+ Popovers */}
      {popupClinic && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-20 max-h-[50%] overflow-y-auto rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 sticky top-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex-1">
                {popupClinic.name}
              </h3>
              <button
                type="button"
                onClick={() => setPopupClinicId(null)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm px-2"
                aria-label="Cerrar detalle"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {popupClinic.travelTime?.duration?.text && (
                <Badge
                  variant={
                    popupIndex === 0
                      ? 'primary'
                      : popupIndex === 1
                      ? 'secondary'
                      : popupIndex === 2
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {popupClinic.travelTime.duration.text}
                </Badge>
              )}
              {popupClinic.banned && (
                <Badge variant="danger" size="sm">
                  In BlackList
                </Badge>
              )}
              {!popupClinic.enabled && (
                <Badge variant="warning" size="sm">
                  Deshabilitada
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            <ClinicCardContent clinic={popupClinic} />
          </div>
        </div>
      )}

      {hasValidUserLocation && mapLoaded && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={handleFlyToUser}
            size="lg"
            className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Centrar en mi ubicación"
          >
            <FaCrosshairs className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
