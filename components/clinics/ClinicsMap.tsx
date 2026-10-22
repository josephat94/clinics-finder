'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Source, Layer, type LayerProps } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ClinicWithTravelTime } from '@/stores';
import type { LatLng } from '@/lib/google';
import { FaUser, FaCrosshairs } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClinicCardContent } from './ClinicCardContent';
import { StreetViewPreview } from './StreetViewPreview';

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
    'fill-color': '#134e4a',
    'fill-opacity': 0.55,
  },
};

interface ClinicsMapProps {
  userLocation?: LatLng | null;
  clinics: ClinicWithTravelTime[];
  userAddress?: string;
  selectedClinicId?: string | null;
  showRanking?: boolean;
  reuseMaps?: boolean;
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

const pinImages = {
  default: { stroke: '#ffffff', size: 48 },
  active: { stroke: '#0891b2', size: 56 },
  rank0: { stroke: '#eab308', size: 48 },
  rank1: { stroke: '#64748b', size: 48 },
  rank2: { stroke: '#d97706', size: 48 },
} as const;

function drawPin(stroke: string, size: number): ImageData {
  const pixelRatio = 2;
  const canvas = document.createElement('canvas');
  canvas.width = size * pixelRatio;
  canvas.height = size * pixelRatio;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo crear el icono del mapa');
  }

  ctx.scale(pixelRatio, pixelRatio);
  const center = size / 2;
  ctx.beginPath();
  ctx.arc(center, center, center - 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  ctx.save();
  ctx.translate(center, center);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -3, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 9);
  ctx.lineTo(-5, 1);
  ctx.lineTo(5, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function ensurePinImages(map: {
  hasImage: (id: string) => boolean;
  addImage: (id: string, data: ImageData, options?: { pixelRatio?: number }) => void;
}) {
  (Object.entries(pinImages) as [string, { stroke: string; size: number }][]).forEach(
    ([id, config]) => {
      const imageId = `clinic-pin-${id}`;
      if (map.hasImage(imageId)) return;
      map.addImage(imageId, drawPin(config.stroke, config.size), { pixelRatio: 2 });
    }
  );
}

const clinicPinLayer: LayerProps = {
  id: 'clinic-pins',
  type: 'symbol',
  layout: {
    'icon-image': [
      'case',
      ['==', ['get', 'active'], 1],
      'clinic-pin-active',
      ['==', ['get', 'rank'], 0],
      'clinic-pin-rank0',
      ['==', ['get', 'rank'], 1],
      'clinic-pin-rank1',
      ['==', ['get', 'rank'], 2],
      'clinic-pin-rank2',
      'clinic-pin-default',
    ],
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
    'icon-anchor': 'center',
    'icon-padding': 0,
  },
};

const clinicRankLayer: LayerProps = {
  id: 'clinic-ranks',
  type: 'symbol',
  filter: ['!=', ['get', 'rankLabel'], ''],
  layout: {
    'text-field': ['get', 'rankLabel'],
    'text-size': 11,
    'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
    'text-offset': [1.15, -1.15],
    'text-anchor': 'center',
    'text-allow-overlap': true,
    'text-ignore-placement': true,
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#134e4a',
    'text-halo-width': 1.5,
  },
};

type MapPointerEvent = {
  features?: Array<{
    properties?: Record<string, unknown> | null;
    geometry?: { type?: string; coordinates?: unknown };
  }>;
};

function readLngLat(coordinates: unknown): [number, number] | null {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const lng = coordinates[0];
  const lat = coordinates[1];
  if (typeof lng !== 'number' || typeof lat !== 'number') return null;
  return [lng, lat];
}

export function ClinicsMap({
  userLocation,
  clinics,
  userAddress,
  selectedClinicId,
  showRanking = true,
  reuseMaps = true,
}: ClinicsMapProps) {
  const t = useTranslations('clinics');
  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [popupClinicId, setPopupClinicId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const hasFittedBounds = useRef(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap?.();
    if (!map) return;
    ensurePinImages(map);

    const resize = () => map.resize();
    resize();
    const container = map.getContainer();
    const observer = new ResizeObserver(resize);
    observer.observe(container.parentElement ?? container);
    const timers = [50, 300, 700].map((delay) => window.setTimeout(resize, delay));

    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [mapLoaded]);

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

  const clinicGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: clinicsWithCoords.map((clinic, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [clinic.lng as number, clinic.lat as number] as [number, number],
        },
        properties: {
          id: clinic.id,
          name: clinic.name,
          rank: showRanking && index < 3 ? index : -1,
          rankLabel: showRanking && index < 3 ? rankingLabels[index] : '',
          active: clinic.id === selectedClinicId || clinic.id === popupClinicId ? 1 : 0,
        },
      })),
    }),
    [clinicsWithCoords, showRanking, selectedClinicId, popupClinicId]
  );

  const pointerRef = useRef<{
    id: string;
    name: string;
    lng: number;
    lat: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipLabelRef = useRef<HTMLDivElement>(null);

  const paintTooltip = useCallback(() => {
    const tip = tooltipRef.current;
    const label = tooltipLabelRef.current;
    const map = mapRef.current?.getMap?.();
    if (!tip || !label || !map) return;

    const pointer = pointerRef.current;
    const usePointer = pointer && pointer.id !== popupClinicId;
    let anchor = usePointer ? pointer : null;

    if (!anchor && selectedClinicId && selectedClinicId !== popupClinicId) {
      const clinic = clinicsWithCoords.find((item) => item.id === selectedClinicId);
      if (clinic && typeof clinic.lat === 'number' && typeof clinic.lng === 'number') {
        anchor = {
          id: clinic.id,
          name: clinic.name,
          lng: clinic.lng,
          lat: clinic.lat,
        };
      }
    }

    if (!anchor) {
      tip.style.display = 'none';
      return;
    }

    const point = map.project([anchor.lng, anchor.lat]);
    if (label.textContent !== anchor.name) label.textContent = anchor.name;
    tip.style.display = 'block';
    tip.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, calc(-100% - 32px))`;
  }, [popupClinicId, selectedClinicId, clinicsWithCoords]);

  useEffect(() => {
    paintTooltip();
  }, [paintTooltip, mapLoaded]);

  const handleMouseMove = useCallback(
    (event: MapPointerEvent) => {
      const feature = event.features?.[0];
      const id = feature?.properties?.id;
      const name = feature?.properties?.name;
      const point = readLngLat(feature?.geometry?.coordinates);
      const map = mapRef.current?.getMap?.();

      if (typeof id === 'string' && typeof name === 'string' && point) {
        if (pointerRef.current?.id === id) {
          if (map) map.getCanvas().style.cursor = 'pointer';
          return;
        }
        pointerRef.current = {
          id,
          name,
          lng: point[0],
          lat: point[1],
        };
        if (map) map.getCanvas().style.cursor = 'pointer';
      } else {
        pointerRef.current = null;
        if (map) map.getCanvas().style.cursor = '';
      }
      paintTooltip();
    },
    [paintTooltip]
  );

  const handleMouseLeave = useCallback(() => {
    pointerRef.current = null;
    const map = mapRef.current?.getMap?.();
    if (map) map.getCanvas().style.cursor = '';
    paintTooltip();
  }, [paintTooltip]);

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

  const handleMapClick = useCallback((event: MapPointerEvent) => {
    const id = event.features?.[0]?.properties?.id;
    if (typeof id === 'string') {
      pointerRef.current = null;
      setPopupClinicId((current) => (current === id ? null : id));
      return;
    }
    setPopupClinicId(null);
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
          {t('mapboxMissing')}
        </p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg">
        <p className="text-zinc-600 dark:text-zinc-400">{t('loadingMap')}</p>
      </div>
    );
  }

  return (
    <div className="clinics-map relative w-full h-full rounded-3xl overflow-hidden">
      <style>{`
        .clinics-map .mapboxgl-marker:hover,
        .clinics-map .mapboxgl-marker:focus-within {
          z-index: 10000 !important;
        }
      `}</style>
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        onLoad={() => {
          const map = mapRef.current?.getMap?.();
          if (map) ensurePinImages(map);
          setMapLoaded(true);
        }}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMove={paintTooltip}
        interactiveLayerIds={['clinic-pins']}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        reuseMaps={reuseMaps}
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

        {mapLoaded && (
          <Source id="clinics" type="geojson" data={clinicGeoJson}>
            <Layer {...clinicPinLayer} />
            <Layer {...clinicRankLayer} />
          </Source>
        )}

        {hasValidUserLocation && mapLoaded && userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="bottom"
          >
            <div className="relative group" style={{ zIndex: 1000 }}>
              <div className="w-10 h-10 bg-hub-primary text-black rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <FaUser />
              </div>
              {userAddress && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-hub-primary text-black text-sm rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {userAddress}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-hub-primary" />
                </div>
              )}
            </div>
          </Marker>
        )}
      </Map>

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute left-0 top-0 z-30 max-w-[200px] rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white shadow-xl"
        style={{ display: 'none' }}
      >
        <div ref={tooltipLabelRef} className="truncate" />
        <div className="absolute top-full left-1/2 w-0 h-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500" />
      </div>

      {/* Un solo popup compartido: evita montar 200+ Popovers */}
      {popupClinic && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-40 max-h-[70%] overflow-y-auto rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 sticky top-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex-1">
                {popupClinic.name}
              </h3>
              <button
                type="button"
                onClick={() => setPopupClinicId(null)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm px-2"
                aria-label={t('closeDetail')}
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
                  {t('blacklist')}
                </Badge>
              )}
              {!popupClinic.enabled && (
                <Badge variant="warning" size="sm">
                  {t('disabled')}
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            {typeof popupClinic.lat === 'number' && typeof popupClinic.lng === 'number' && (
              <StreetViewPreview
                key={popupClinic.id}
                lat={popupClinic.lat}
                lng={popupClinic.lng}
              />
            )}
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
            aria-label={t('centerOnMe')}
          >
            <FaCrosshairs className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
