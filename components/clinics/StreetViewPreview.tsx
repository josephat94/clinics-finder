'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaStreetView } from 'react-icons/fa';

interface StreetViewPreviewProps {
  lat: number;
  lng: number;
}

export function StreetViewPreview({ lat, lng }: StreetViewPreviewProps) {
  const t = useTranslations('clinics');
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [outdoorView, setOutdoorView] = useState<{ panoId: string; heading: number } | null>(null);
  const mapsUrl = outdoorView
    ? `https://www.google.com/maps/@?api=1&map_action=pano&pano=${encodeURIComponent(outdoorView.panoId)}&heading=${outdoorView.heading}&pitch=0&fov=80`
    : null;

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    setStatus('loading');
    setImageUrl(null);
    setOutdoorView(null);

    fetch(`/api/streetview?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const panoId = response.headers.get('X-Streetview-Pano');
        const heading = Number(response.headers.get('X-Streetview-Heading'));
        if (panoId) {
          setOutdoorView({
            panoId,
            heading: Number.isFinite(heading) ? heading : 0,
          });
        }
        if (response.status === 404) {
          setStatus('missing');
          return;
        }
        if (!response.ok) {
          setStatus('error');
          return;
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lat, lng]);

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-hub-border">
      <div className="relative h-40 bg-zinc-100 dark:bg-zinc-950">
        {status === 'loading' && (
          <p className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-hub-muted">
            {t('loadingStreetView')}
          </p>
        )}
        {status === 'missing' && (
          <p className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-hub-muted">
            {t('streetViewUnavailable')}
          </p>
        )}
        {status === 'error' && (
          <p className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm text-hub-muted">
            {t('streetViewError')}
          </p>
        )}
        {status === 'ready' && imageUrl && (
          <img src={imageUrl} alt={t('streetView')} className="h-40 w-full object-cover" />
        )}
      </div>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#e8f1f6] px-3 py-2 text-sm font-medium text-hub-fg hover:underline"
        >
          <FaStreetView aria-hidden="true" />
          {t('openStreetView')}
        </a>
      )}
    </div>
  );
}
