'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ClinicWithTravelTime } from '@/stores';
import type { LatLng } from '@/lib/google';
import { FaUser, FaCrosshairs } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

// Importación dinámica para evitar problemas de SSR
// En react-map-gl v8, necesitamos importar desde 'react-map-gl/mapbox'
const Map = dynamic(() => import('react-map-gl/mapbox').then((mod) => mod.default), {
  ssr: false,
});

const Marker = dynamic(() => import('react-map-gl/mapbox').then((mod) => mod.Marker), {
  ssr: false,
});

interface ClinicsMapProps {
  userLocation: LatLng;
  clinics: ClinicWithTravelTime[];
  userAddress?: string;
  selectedClinicId?: string | null;
  showRanking?: boolean; // Para mostrar 1st, 2nd, 3rd
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

export function ClinicsMap({ userLocation, clinics, userAddress, selectedClinicId, showRanking = true }: ClinicsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  const mapRef = useRef<any>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      // Pequeño delay para asegurar que el mapa esté completamente renderizado
      const timer = setTimeout(() => {
        setMarkersReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

    // Verificar que userLocation tenga valores válidos
    const hasValidUserLocation = userLocation &&
        typeof userLocation.lat === 'number' &&
        typeof userLocation.lng === 'number' &&
        !isNaN(userLocation.lat) &&
        !isNaN(userLocation.lng);

    // Efecto para ajustar el zoom a todos los resultados cuando se cargan
    useEffect(() => {
        if (!mapLoaded || !markersReady || !mapRef.current || !hasValidUserLocation || clinics.length === 0) {
            return;
        }

        const map = mapRef.current.getMap();
        if (!map) return;

        // Calcular bounds para incluir todas las ubicaciones
        const lats = [
            userLocation.lat,
            ...clinics
                .map((c) => (c as any).lat)
                .filter((lat): lat is number => typeof lat === 'number' && !isNaN(lat)),
        ];
        const lngs = [
            userLocation.lng,
            ...clinics
                .map((c) => (c as any).lng)
                .filter((lng): lng is number => typeof lng === 'number' && !isNaN(lng)),
        ];

        if (lats.length === 0 || lngs.length === 0) return;

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Usar fitBounds para ajustar el mapa a todos los markers
        map.fitBounds(
            [
                [minLng, minLat], // southwest corner
                [maxLng, maxLat], // northeast corner
            ],
            {
                padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Padding en píxeles
                maxZoom: 15, // Zoom máximo para evitar acercarse demasiado
                duration: 1000, // Duración de la animación en ms
            }
        );
    }, [mapLoaded, markersReady, userLocation, clinics, hasValidUserLocation]);

  const handleFlyToUser = () => {
    if (!mapRef.current || !userLocation) return;
    
    const map = mapRef.current.getMap();
    if (map) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1500,
        essential: true,
      });
    }
  };

  // Calcular el viewport inicial para mostrar todas las ubicaciones
  const initialViewState = useMemo(() => {
    if (!userLocation || clinics.length === 0) {
      return defaultCenter;
    }

    // Calcular bounds para incluir todas las ubicaciones
    const lats = [
      userLocation.lat,
      ...clinics
        .map((c) => (c as any).lat)
        .filter((lat): lat is number => typeof lat === 'number'),
    ];
    const lngs = [
      userLocation.lng,
      ...clinics
        .map((c) => (c as any).lng)
        .filter((lng): lng is number => typeof lng === 'number'),
    ];

    if (lats.length === 0 || lngs.length === 0) {
      return defaultCenter;
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calcular zoom basado en la distancia
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 10;
    if (maxDiff > 0.1) zoom = 9;
    if (maxDiff > 0.2) zoom = 8;
    if (maxDiff > 0.5) zoom = 7;
    if (maxDiff > 1) zoom = 6;
    if (maxDiff > 2) zoom = 5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      zoom,
    };
  }, [userLocation, clinics]);

  const [viewState, setViewState] = useState<ViewState>(initialViewState);

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg">
        <p className="text-red-600 dark:text-red-400">
          Error: La API key de Mapbox no está configurada. Agrega NEXT_PUBLIC_MAPBOX_API_TOKEN a tus variables de entorno.
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
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        {...viewState}
        onMove={(evt: { viewState: ViewState }) => setViewState(evt.viewState)}
        onLoad={() => {
          setMapLoaded(true);
          // Debug: verificar que userLocation esté disponible
          if (hasValidUserLocation) {
            console.log('Map loaded, userLocation:', userLocation);
          }
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
  

      {/* Pines de las clínicas */}
      {isMounted && markersReady && clinics.map((clinic, index) => {
        const lat = (clinic as any).lat;
        const lng = (clinic as any).lng;
        
        if (!lat || !lng) return null;

        const isSelected = selectedClinicId === clinic.id;
        const markerSize = isSelected ? 'w-14 h-14' : 'w-12 h-12';
        const iconSize = isSelected ? 'w-7 h-7' : 'w-6 h-6';
        const borderColor = isSelected ? 'border-blue-500 ring-4 ring-blue-500/30' : 'border-white';
        
        // Determinar el ranking (1st, 2nd, 3rd)
        const ranking = index < 3 ? ['1st', '2nd', '3rd'][index] : null;
        const rankingBgColors = [
          'bg-yellow-500', // 1st
          'bg-slate-500',  // 2nd
          'bg-amber-600',   // 3rd
        ];
        const rankingBorderColors = [
          'border-yellow-500', // 1st
          'border-slate-500',  // 2nd
          'border-amber-600',   // 3rd
        ];
        const markerBgColor = 'bg-red-500';
        const markerRankingBgColor = ranking ? rankingBgColors[index] : 'bg-red-500';
        const markerBorderColor = isSelected ? 'border-blue-500 ring-4 ring-blue-500/30' : ranking ? rankingBorderColors[index] : 'border-white';
        const tooltipBgColor ='bg-red-500';
        // Para el tooltip arrow, necesitamos el color en formato RGB
        const tooltipArrowColor = ranking 
          ? (index === 0 ? '#eab308' : index === 1 ? '#64748b' : '#d97706') // yellow-500, slate-500, amber-600
          : '#ef4444'; // red-500

        return (
          <Marker
            key={clinic.id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
          >
            <div className="relative group">
              {/* Badge de ranking */}
              {showRanking && ranking && (
                <div className={`absolute -top-2 -right-2 ${markerRankingBgColor} text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg z-20`}>
                  {ranking}
                </div>
              )}
              
              <div className={`${markerSize} ${markerBgColor} rounded-full border-2 ${markerBorderColor} shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}>
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
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 ${tooltipBgColor} text-white text-sm rounded-lg whitespace-nowrap shadow-xl transition-opacity pointer-events-none z-10 max-w-[200px] ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="truncate">{clinic.name}</div>
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                  style={{ borderTopColor: tooltipArrowColor }}
                ></div>
              </div>
            </div>
          </Marker>
        );
      })}

          {/* Pin del usuario */}
          {hasValidUserLocation && isMounted && markersReady && (
        <Marker
          longitude={userLocation.lng}
          latitude={userLocation.lat}
          anchor="bottom"
        >
          <div className="relative group" style={{ zIndex: 1000 }}>
            <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <FaUser/>
            </div>
            {userAddress && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {userAddress}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>
              </div>
            )}
           </div>
         </Marker>
       )}
      </Map>
      
      {/* Botón flotante para volver a la ubicación del usuario */}
      {hasValidUserLocation && isMounted && markersReady && (
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
