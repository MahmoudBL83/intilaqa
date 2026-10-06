import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { getRoleNavigation, getRolePermissions } from "@intilaqa/shared";
import { AppLayout } from "@intilaqa/ui";
import type { Role } from "@intilaqa/shared";

const ROLE: Role = "client";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role || ROLE;
  const permissions = getRolePermissions(userRole);

  const navConfig = getRoleNavigation(userRole, permissions as string[]);
  const t = await getTranslations("nav");

  const navigations = navConfig.map((group) => ({
    title: t(`groups.${group.groupI18nKey.split(".").pop()}`),
    items: group.items.map((item) => ({
      label: t(`items.${item.i18nKey.split(".").pop()}`),
      href: item.href,
      iconName: item.icon,
    })),
  }));

  return <AppLayout navigations={navigations} basePath="/client">{children}</AppLayout>;
}
