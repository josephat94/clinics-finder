'use client';

import { Modal } from '@/components/ui/modal';
import { ClinicsMap } from './ClinicsMap';
import type { ClinicWithTravelTime } from '@/stores';
import type { LatLng } from '@/lib/google';

interface ClinicsMapModalProps {
  open: boolean;
  onClose: () => void;
  clinics: ClinicWithTravelTime[];
  userLocation?: LatLng | null;
  userAddress?: string;
  title?: string;
  description?: string;
  showRanking?: boolean;
}

export function ClinicsMapModal({
  open,
  onClose,
  clinics,
  userLocation,
  userAddress,
  title = 'Mapa de clínicas',
  description,
  showRanking = false,
}: ClinicsMapModalProps) {
  const clinicsWithCoords = clinics.filter(
    (clinic) => typeof clinic.lat === 'number' && typeof clinic.lng === 'number'
  );

  const resolvedDescription =
    description ??
    (clinicsWithCoords.length > 0
      ? `Mostrando ${clinicsWithCoords.length} clínica${clinicsWithCoords.length !== 1 ? 's' : ''} con ubicación`
      : 'No hay clínicas con coordenadas para mostrar en el mapa');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={resolvedDescription}
      size="full"
    >
      <div className="flex flex-col flex-1 min-h-0 gap-4">
        <div className="flex-1 min-h-0 w-full rounded-lg overflow-hidden">
          {clinicsWithCoords.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-zinc-600 dark:text-zinc-400 text-center px-4">
                No hay clínicas con coordenadas registradas.
              </p>
            </div>
          ) : (
            <ClinicsMap
              userLocation={userLocation}
              clinics={clinicsWithCoords}
              userAddress={userAddress}
              showRanking={showRanking}
            />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 flex-shrink-0">
          {userLocation && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Tu ubicación</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Clínicas</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
