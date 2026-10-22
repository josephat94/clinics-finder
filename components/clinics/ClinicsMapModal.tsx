'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  title,
  description,
  showRanking = false,
}: ClinicsMapModalProps) {
  const t = useTranslations('clinics');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setMapReady(false);
      return;
    }
    const id = window.setTimeout(() => setMapReady(true), 350);
    return () => window.clearTimeout(id);
  }, [open]);

  const clinicsWithCoords = clinics.filter(
    (clinic) => typeof clinic.lat === 'number' && typeof clinic.lng === 'number'
  );

  const resolvedDescription =
    description ??
    (clinicsWithCoords.length > 0
      ? t('showingOnMap', { count: clinicsWithCoords.length })
      : t('noneOnMap'));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? t('mapTitle')}
      description={resolvedDescription}
      size="full"
    >
      <div className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col gap-4">
        <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-lg">
          {clinicsWithCoords.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <p className="text-zinc-600 dark:text-zinc-400 text-center px-4">
                {t('noneWithCoords')}
              </p>
            </div>
          ) : mapReady ? (
            <ClinicsMap
              userLocation={userLocation}
              clinics={clinicsWithCoords}
              userAddress={userAddress}
              showRanking={showRanking}
              reuseMaps={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">{t('loadingMap')}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 flex-shrink-0">
          {userLocation && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-hub-primary rounded-full"></div>
              <span>{t('yourLocation')}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>{t('clinicsLegend')}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
