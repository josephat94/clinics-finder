import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiMessage } from '@/i18n/api';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'user' } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: await apiMessage('emailPasswordRequired') },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: await apiMessage('passwordMin') },
        { status: 400 }
      );
    }

    // Verificar que el usuario actual es admin
    const cookieStore = await import('next/headers').then((mod) => mod.cookies());
    const supabase = await createClient(cookieStore);

    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: await apiMessage('unauthorized') },
        { status: 401 }
      );
    }

    // Verificar que el usuario actual es admin
    const currentRole = currentUser.user_metadata?.role;
    if (currentRole !== 'admin') {
      return NextResponse.json(
        { error: await apiMessage('adminsOnlyCreate') },
        { status: 403 }
      );
    }

    // Crear el nuevo usuario usando el servicio de administración
    // Nota: Esto requiere usar el service role key en producción
    // Por ahora, usamos signUp pero con metadata de rol
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role: role || 'user',
        },
        emailRedirectTo: undefined, // No enviar email de confirmación
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: data.user,
      message: await apiMessage('userCreated'),
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: await apiMessage('internalError') },
      { status: 500 }
    );
  }
}
