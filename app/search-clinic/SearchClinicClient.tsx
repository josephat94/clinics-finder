'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClinicsMap } from '@/components/clinics/ClinicsMap';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClinicWithTravelTime } from '@/stores';
import type { Clinic } from '@/types/clinic';
import type { LatLng } from '@/lib/google';
import { Button } from '@/components/ui';
import { FaArrowLeft } from 'react-icons/fa';
import { ClinicCardContent } from '@/components/clinics/ClinicCardContent';
import { SearchClinicSkeleton } from './SearchClinicSkeleton';

export default function SearchClinicClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const state = searchParams.get('state') || '';
  const search = searchParams.get('search') || '';
  const extraFilter = searchParams.get('extraFilter') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [clinics, setClinics] = useState<ClinicWithTravelTime[]>([]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [hoveredClinicId, setHoveredClinicId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false); // Para móviles

  useEffect(() => {
    const performSearch = async () => {
      if (!state || !search) {
        setError('Faltan parámetros de búsqueda requeridos');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/clinics?state=${state}&search=${search}&extraFilter=${extraFilter}`
        );

        if (!response.ok) {
          throw new Error('Error al buscar clínicas');
        }

        const data = await response.json();
        const clinicsData: Clinic[] = data.clinics || [];
        const userCoords: LatLng | null = data.userCoords || null;

        if (!userCoords) {
          setError('No se pudo obtener la ubicación de la dirección ingresada');
          setIsLoading(false);
          return;
        }

        if (clinicsData.length === 0) {
          setError('No se encontraron clínicas cerca de la dirección ingresada');
          setIsLoading(false);
          return;
        }

        const clinicsWithTravelTime = clinicsData as ClinicWithTravelTime[];
        
        const sortedClinics = clinicsWithTravelTime.sort((a, b) => {
          const aHasTravelTime = a.travelTime?.duration.value !== undefined && a.travelTime?.duration.value !== null;
          const bHasTravelTime = b.travelTime?.duration.value !== undefined && b.travelTime?.duration.value !== null;
          
          if (aHasTravelTime && !bHasTravelTime) return -1;
          if (!aHasTravelTime && bHasTravelTime) return 1;
          
          if (aHasTravelTime && bHasTravelTime) {
            return (a.travelTime!.duration.value) - (b.travelTime!.duration.value);
          }
          
          return 0;
        });

        setClinics(sortedClinics);
        setUserLocation(userCoords);
      } catch (err) {
        console.error('Error al buscar clínicas:', err);
        setError('Error al buscar clínicas. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [state, search, extraFilter]);

  const handleBack = () => {
    router.push('/clinics');
  };

  const handleClinicClick = (clinicId: string) => {
    setSelectedClinicId(clinicId === selectedClinicId ? null : clinicId);
  };

  if (isLoading) {
    return (
      <SearchClinicSkeleton />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error en la búsqueda
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={handleBack} variant="outline" className="w-full">
            <FaArrowLeft className="mr-2" />
            Volver a búsqueda
          </Button>
        </div>
      </div>
    );
  }

  if (!userLocation || clinics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          No se encontraron resultados
        </p>
        <Button onClick={handleBack} variant="outline">
          <FaArrowLeft className="mr-2" />
          Volver a búsqueda
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Clínicas cercanas ({clinics.length})
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {clinics.length} clínica{clinics.length !== 1 ? 's' : ''} cerca de{' '}
            <span className="font-medium">{search}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón para alternar vista en móviles */}
          <Button
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            size="sm"
            className="md:hidden"
          >
            {showMap ? 'Ver lista' : 'Ver mapa'}
          </Button>
          <Button onClick={handleBack} variant="outline" size="sm">
            <FaArrowLeft className="mr-2" />
            Volver
          </Button>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="flex-1 flex overflow-y-auto max-h-[calc(100vh-10rem)]">
        {/* Columna izquierda: Lista de cards */}
        <div className={`${showMap ? 'hidden' : 'flex'} md:flex w-full sm:w-1/2 lg:w-2/5 xl:w-1/3 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-0`}>
          <div className="flex-1 p-4 space-y-8 min-h-0">
            {clinics.map((clinic, index) => {
              const hasTravelTime = clinic.travelTime?.duration.value !== undefined && clinic.travelTime?.duration.value !== null;
              const isSelected = selectedClinicId === clinic.id;
              const isHovered = hoveredClinicId === clinic.id;
              const lat = (clinic as any).lat;
              const lng = (clinic as any).lng;

              return (
                <Card
                variant={index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'normal'}
                  key={clinic.id}
                  
                  onClick={() => handleClinicClick(clinic.id)}
                  onMouseEnter={() => setHoveredClinicId(clinic.id)}
                  onMouseLeave={() => setHoveredClinicId(null)}
                  className={`
                    cursor-pointer transition-all duration-200
                    ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                    ${isHovered ? 'shadow-md scale-[1.02]' : ''}
                    ${clinic.banned ? 'opacity-80 border-red-500 dark:border-red-600 bg-red-50/30 dark:bg-red-950/20' : ''}
                  `}
                  travelTime={clinic.travelTime}
                  
                  floatingBadge={
                    hasTravelTime ? (
                      <Badge variant={index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'warning' : 'default'} size="lg">
                        {clinic.travelTime?.duration.text}
                        
                      </Badge>
                    ) : undefined
                  }
                  badges={
                    <>
                      {clinic.banned && (
                        <Badge variant="danger" size="sm">
                          Baneada
                        </Badge>
                      )}
                      {!clinic.enabled && (
                        <Badge variant="warning" size="sm">
                          Deshabilitada
                        </Badge>
                      )}
                    </>
                  }
                >
                  <ClinicCardContent clinic={clinic} />
                </Card>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: Mapa */}
        <div className={`${showMap ? 'flex' : 'hidden'} sm:flex flex-1 bg-zinc-100 dark:bg-zinc-950 min-h-0 overflow-hidden sticky top-0 px-6 rounded-3xl`}>
          <ClinicsMap
            userLocation={userLocation}
            clinics={clinics}
            userAddress={search}
            selectedClinicId={selectedClinicId || hoveredClinicId}
          />
        </div>
      </div>
    </div>
  );
}
