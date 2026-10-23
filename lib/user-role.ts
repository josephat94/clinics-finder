export type UserRole = 'admin' | 'user';

type RoleSource = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Rol de autorización. La fuente es app_metadata, que el usuario no puede editar.
 * Si el token es anterior a ese cambio y todavía no trae rol, se usa el valor
 * legado hasta que la sesión se renueve.
 */
export function getUserRole(user: RoleSource | null | undefined): UserRole {
  const appRole = user?.app_metadata?.role;
  if (appRole === 'admin' || appRole === 'user') return appRole;
  return user?.user_metadata?.role === 'admin' ? 'admin' : 'user';
}
