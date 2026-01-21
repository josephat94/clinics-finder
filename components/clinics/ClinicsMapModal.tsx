'use client';

import { Modal } from '@/components/ui/modal';
import { ClinicsMap } from './ClinicsMap';
import type { ClinicWithTravelTime } from '@/stores';
import type { LatLng } from '@/lib/google';

interface ClinicsMapModalProps {
  open: boolean;
  onClose: () => void;
  userLocation: LatLng;
  clinics: ClinicWithTravelTime[];
  userAddress?: string;
}

export function ClinicsMapModal({
  open,
  onClose,
  userLocation,
  clinics,
  userAddress,
}: ClinicsMapModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Clínicas cercanas"
      description={`Se encontraron ${clinics.length} clínica${clinics.length !== 1 ? 's' : ''} cerca de tu ubicación`}
      size="2xl"
    >
      <div className="h-[600px] w-full rounded-lg overflow-hidden">
        <ClinicsMap
          userLocation={userLocation}
          clinics={clinics}
          userAddress={userAddress}
        />
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Tu ubicación</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Clínicas</span>
        </div>
      </div>
    </Modal>
  );
}
