import { NextRequest, NextResponse } from 'next/server';
import { getClinicsByState, getAllClinics, geocodeClinics } from '@/lib/clinics';
import { geocodeAddress } from '@/lib/google';
import { apiMessage } from '@/i18n/api';

/**
 * GET /api/clinics
 * Syncroniza las coordenadas de las clínicas
 * 
 */
export async function GET() {
  try {
    const clinics = await getAllClinics();

    if (clinics.length > 0) {
      const { updated, skipped } = await geocodeClinics(clinics);
      console.log(`✔ ${updated} clínicas actualizadas, ${skipped} saltadas`);
    }

    return NextResponse.json({ clinics }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : await apiMessage('unknownError');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
