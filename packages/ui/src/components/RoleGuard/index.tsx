"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@intilaqa/shared";

type RoleGuardProps = {
  roles: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  const userRole = (session?.user as { role?: string })?.role;
  if (!userRole || !roles.includes(userRole as Role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
