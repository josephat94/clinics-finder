import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import type { AuditActor } from '@/lib/clinic-audit';

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function toAuditActor(user: User): AuditActor {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function requireAuthenticatedUser(): Promise<
  { user: User; actor: AuditActor } | { error: string; status: 401 }
> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: 'No autorizado', status: 401 };
  }
  return { user, actor: toAuditActor(user) };
}

export async function requireAdminUser(): Promise<
  { user: User; actor: AuditActor } | { error: string; status: 401 | 403 }
> {
  const result = await requireAuthenticatedUser();
  if ('error' in result) {
    return result;
  }

  if (result.user.user_metadata?.role !== 'admin') {
    return {
      error: 'Solo los administradores pueden realizar esta acción',
      status: 403,
    };
  }

  return result;
}
