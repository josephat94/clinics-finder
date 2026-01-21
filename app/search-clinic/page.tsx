import { Suspense } from 'react';
import SearchClinicClient from './SearchClinicClient';

export default function SearchClinicPage() {
  return (
    <div className="h-[calc(100vh-4.5rem)] overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 ml-4">Cargando búsqueda...</p>
        </div>
      }>
        <SearchClinicClient />
      </Suspense>
    </div>
  );
}
