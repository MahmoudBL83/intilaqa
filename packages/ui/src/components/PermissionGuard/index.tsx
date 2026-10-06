"use client";

import { PERMISSIONS, type Permission } from "@intilaqa/shared";

type PermissionGuardProps = {
  permission: Permission;
  userPermissions?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGuard({
  permission,
  userPermissions = [],
  fallback = null,
  children,
}: PermissionGuardProps) {
  if (!userPermissions.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
