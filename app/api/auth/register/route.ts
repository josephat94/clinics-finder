import { NextRequest, NextResponse } from 'next/server';
import { apiMessage } from '@/i18n/api';

// Registro público deshabilitado - Solo admins pueden crear usuarios
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: await apiMessage('registrationDisabled') },
    { status: 403 }
  );
}
