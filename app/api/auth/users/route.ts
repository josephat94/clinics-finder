import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then((mod) => mod.cookies());
    const supabase = await createClient(cookieStore);

    // Verificar que el usuario actual es admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const currentRole = user.user_metadata?.role;
    if (currentRole !== 'admin') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden ver usuarios' },
        { status: 403 }
      );
    }

    // Usar Admin API para obtener la lista de usuarios
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key no configurada. Agrega SUPABASE_SERVICE_ROLE_KEY a tus variables de entorno.' },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { users }, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Formatear usuarios para la respuesta
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Sin nombre',
      role: user.user_metadata?.role || 'user',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      emailConfirmed: user.email_confirmed_at !== null,
    }));

    return NextResponse.json({
      users: formattedUsers,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
