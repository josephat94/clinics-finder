import { FaAt, FaGlobe, FaMapMarkerAlt, FaPhoneAlt, FaPrint } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import type { ClinicWithTravelTime } from '@/stores';

interface ClinicCardContentProps {
  clinic: ClinicWithTravelTime;
}

export function ClinicCardContent({ clinic }: ClinicCardContentProps) {
  return (
    <>
      <div className="flex items-start justify-between mb-2">
        <h2 className={`text-xl font-semibold ${clinic.banned ? "line-through text-zinc-500 dark:text-zinc-500" : "text-black dark:text-zinc-50"}`}>
          {clinic.name}
        </h2>
      </div>
      
      {clinic.address && (
        <div className="flex items-start gap-1 w-full">
          <FaMapMarkerAlt />
          <p className={`mb-1 text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
            {clinic.address}
            {clinic.state && `, ${clinic.state}`}
            {clinic.zipcode && ` ${clinic.zipcode}`}
          </p>
        </div>
      )}
      
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center justify-between gap-6">
          {clinic.phone && (
            <div className="flex items-start gap-1">
              <FaPhoneAlt />
              <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                Tel: {clinic.phone}
              </p>
            </div>
          )}

          {clinic.fax && (
            <div className="flex items-start gap-1">
              <FaPrint />
              <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                Fax: {clinic.fax}
              </p>
            </div>
          )}
        </div>

        {clinic.email && (
          <div className="flex items-start gap-1">
            <FaAt />
            <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
              {clinic.email}
            </p>
          </div>
        )}
        
        {clinic.website && (
          <div className="flex items-start gap-1">
            <FaGlobe /> 
            <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
              Sitio Web:{" "}
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${clinic.banned ? "text-zinc-500 dark:text-zinc-600 line-through cursor-not-allowed" : "text-blue-600 dark:text-blue-400 hover:underline"}`}
              >
                {clinic.website}
              </a>
            </p>
          </div>
        )}
      </div>
      
      {clinic.notes && (
        <div className="flex items-start gap-1">
          <p className={`text-xs mt-3 pt-3 border-t ${clinic.banned ? "text-zinc-400 dark:text-zinc-600 border-zinc-300 dark:border-zinc-800" : "text-gray-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"}`}>
            *NOTAS:    {clinic.notes}
          </p>
        </div>
      )}

      {clinic.travelTime ? (
        <div className="flex items-center gap-3 mt-4">
          <Badge variant="secondary" size="sm">
            Distancia:  {((clinic.travelTime.distance.value / 1609.34).toFixed(2))} Millas
          </Badge>
        </div>
      ) : clinic.distanceMi ? (
        <div className="flex items-center gap-3 mt-4">
          <Badge variant="secondary" size="sm">
            Distancia:  {clinic.distanceMi.toFixed(2)} Millas
          </Badge>
        </div>
      ) : undefined}
    </>
  );
}
