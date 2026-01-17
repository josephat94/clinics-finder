import { NextRequest, NextResponse } from 'next/server';

// Registro público deshabilitado - Solo admins pueden crear usuarios
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'El registro público está deshabilitado. Contacta a un administrador para crear una cuenta.' },
    { status: 403 }
  );
}
