import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request);

    // Refrescar la sesión si es necesario
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Rutas protegidas - requiere autenticación
    const protectedPaths = ['/clinics', '/dashboard', '/admin'];
    const isProtectedPath = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Rutas que requieren rol admin
    const adminPaths = ['/admin'];
    const isAdminPath = adminPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Rutas públicas de autenticación
    const authPaths = ['/login'];
    const isAuthPath = authPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Si intenta acceder a una ruta protegida sin estar autenticado
    if (isProtectedPath && !user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Si intenta acceder a una ruta admin sin ser admin
    if (isAdminPath && user) {
      const userRole = user.user_metadata?.role;
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Si está autenticado e intenta acceder a login, redirigir a home
    if (isAuthPath && user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (error) {
    // Si hay un error, permitir que la solicitud continúe
    console.error('Error en middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
