import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { apiMessage } from '@/i18n/api';
import { getUserRole } from '@/lib/user-role';

// Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, role, email } = await request.json();
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { error: await apiMessage('userIdRequired') },
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

    if (getUserRole(currentUser) !== 'admin') {
      return NextResponse.json(
        { error: await apiMessage('adminsOnlyEdit') },
        { status: 403 }
      );
    }

    // Usar Admin API para actualizar el usuario
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: await apiMessage('serviceRoleMissing') },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Actualizar metadata del usuario
    const updateData: {
      email?: string;
      user_metadata: { name?: string };
      app_metadata: { role: 'admin' | 'user' };
    } = {
      user_metadata: {
        name: name || undefined,
      },
      app_metadata: {
        role: role === 'admin' ? 'admin' : 'user',
      },
    };

    // Si se cambia el email, actualizarlo también
    if (email) {
      updateData.email = email;
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: data.user,
      message: await apiMessage('userUpdated'),
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: await apiMessage('internalError') },
      { status: 500 }
    );
  }
}

// Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: await apiMessage('userIdRequired') },
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

    if (getUserRole(currentUser) !== 'admin') {
      return NextResponse.json(
        { error: await apiMessage('adminsOnlyDelete') },
        { status: 403 }
      );
    }

    // No permitir que un admin se elimine a sí mismo
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: await apiMessage('cannotDeleteSelf') },
        { status: 400 }
      );
    }

    // Usar Admin API para eliminar el usuario
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: await apiMessage('serviceRoleMissing') },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: await apiMessage('userDeleted'),
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: await apiMessage('internalError') },
      { status: 500 }
    );
  }
}
