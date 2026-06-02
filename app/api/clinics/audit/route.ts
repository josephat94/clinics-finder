import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-server';
import { getClinicAuditLogs } from '@/lib/clinic-audit';
import type { ClinicAuditAction } from '@/types/clinic-audit';

const VALID_ACTIONS = new Set<ClinicAuditAction>(['create', 'update', 'delete']);

/**
 * GET /api/clinics/audit
 * Historial de operaciones sobre clínicas (solo admin).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminUser();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const actionParam = searchParams.get('action');
    const search = searchParams.get('search')?.trim();

    let action: ClinicAuditAction | undefined;
    if (actionParam && actionParam !== 'all') {
      if (!VALID_ACTIONS.has(actionParam as ClinicAuditAction)) {
        return NextResponse.json(
          { error: 'Acción de filtro no válida' },
          { status: 400 }
        );
      }
      action = actionParam as ClinicAuditAction;
    }

    const response = await getClinicAuditLogs({
      action,
      search: search || undefined,
      limit: 200,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener historial de clínicas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
