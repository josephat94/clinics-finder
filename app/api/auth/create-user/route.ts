import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { apiMessage } from '@/i18n/api';
import { getUserRole } from '@/lib/user-role';

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

    if (getUserRole(currentUser) !== 'admin') {
      return NextResponse.json(
        { error: await apiMessage('adminsOnlyCreate') },
        { status: 403 }
      );
    }

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

    const assignedRole = role === 'admin' ? 'admin' : 'user';
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0],
      },
      app_metadata: {
        role: assignedRole,
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
