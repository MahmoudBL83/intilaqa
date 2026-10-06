import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { RolesContent } from "./roles-content";

type SearchParams = { search?: string; page?: string; created?: string; updated?: string };

export default async function RolesPage({ searchParams, params }: { searchParams: Promise<SearchParams>, params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");
  const td = await getTranslations("dashboard");
  const rolesT = await getTranslations("roles");
  const commonT = await getTranslations("common");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const created = sp.created === "1";
  const updated = sp.updated === "1";
  const pageSize = 12;

  const [roles, total, totalPermissions] = await Promise.all([
    prisma.role.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { permissions: true } },
      },
    }),
    prisma.role.count(),
    prisma.permission.count(),
  ]);

  const data = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || "—",
    permissionsCount: r._count.permissions,
  }));

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl px-4 py-3 text-[13px] font-semibold text-primary flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {created ? commonT("createdSuccess") : commonT("updatedSuccess")}
        </div>
      )}

      <PageHeader
        title={t("roles")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("roles") },
        ]}
      />

      <RolesContent
        data={data}
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        total={total}
        totalPermissions={totalPermissions}
      />
    </div>
  );
}
