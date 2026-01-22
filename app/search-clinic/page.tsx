import { Suspense } from 'react';
import SearchClinicClient from './SearchClinicClient';
import { SearchClinicSkeleton } from './SearchClinicSkeleton';

export default function SearchClinicPage() {
  return (
    <div className="h-[calc(100vh-4.5rem)] overflow-hidden">
      <Suspense fallback={<SearchClinicSkeleton />}>
        <SearchClinicClient />
      </Suspense>
    </div>
  );
}
