import { auth } from "./auth";
import { ROLES, getDashboardRoute, getRoleLabelKey, type Role, type AllRoles } from "@intilaqa/shared";
import { ROLE_PERMISSIONS, hasPermission, getRolePermissions, type Permission } from "@intilaqa/shared";

type AuthSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
};

export async function getSession(): Promise<AuthSession | null> {
  try {
    const session = await auth();
    return session as AuthSession | null;
  } catch {
    return null;
  }
}

export function hasRole(session: AuthSession | null, allowedRoles: Role[]): boolean {
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role as Role);
}

export function getUserRole(session: AuthSession | null): string | null {
  return session?.user?.role || null;
}

export function getUserPermissions(session: AuthSession | null): readonly Permission[] {
  const role = getUserRole(session);
  if (!role) return [];
  return getRolePermissions(role);
}

export function userHasPermission(session: AuthSession | null, permission: Permission): boolean {
  const role = getUserRole(session);
  if (!role) return false;
  return hasPermission(role, permission);
}

export { getDashboardRoute, getRoleLabelKey } from "@intilaqa/shared";

export { hasPermission, getRolePermissions } from "@intilaqa/shared";

export { ROLES, ROLE_PERMISSIONS } from "@intilaqa/shared";

export type { Role, AllRoles, Permission };
