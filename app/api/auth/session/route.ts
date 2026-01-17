import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then((mod) => mod.cookies());
    const supabase = await createClient(cookieStore);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json(
      { user: null },
      { status: 500 }
    );
  }
}
