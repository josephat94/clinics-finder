import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiMessage } from '@/i18n/api';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then((mod) => mod.cookies());
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: await apiMessage('sessionClosed') });
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: await apiMessage('internalError') },
      { status: 500 }
    );
  }
}
