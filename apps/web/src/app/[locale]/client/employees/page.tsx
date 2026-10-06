import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable, StatCard } from "@intilaqa/ui";
import { Users, UserCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default async function EmployeesPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const client = await prisma.client.findFirst({ where: { userId } });
  if (!client) redirect(`/${locale}/login`);

  const t = await getTranslations("employees");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";

  const where: Record<string, unknown> = { company: { clientId: client.id } };
  if (search) where.user = { name: { contains: search, mode: "insensitive" as const } };

  const [data, total, activeCompanies] = await Promise.all([
    prisma.employee.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        company: { select: { name: true } },
      },
    }),
    prisma.employee.count({ where }),
    prisma.company.count({ where: { clientId: client.id, isActive: true } }),
  ]);

  const rows = data.map((e) => ({
    id: e.id,
    userName: e.user.name || "\u2014",
    userEmail: e.user.email || "\u2014",
    companyName: e.company.name,
    position: e.position || "\u2014",
    employeeId: e.employeeId || "\u2014",
    statusDisplay: e.isActive ? "active" : "inactive",
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const args = new URLSearchParams();
    args.set("page", String(p));
    if (search) args.set("search", search);
    return `?${args.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/client` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard title={t("title")} value={total} icon={Users} variant="primary" />
        <StatCard title={td("activeCompanies")} value={activeCompanies} icon={UserCheck} variant="secondary" />
      </div>

      <form method="GET" className="mb-6 max-w-md">
        <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl h-11 px-4 transition-all">
          <input
            name="search"
            defaultValue={search}
            placeholder={`${tc("search")}...`}
            className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium"
          />
          <button type="submit" className="text-on-surface-variant/40 hover:text-on-surface-variant/70 transition-colors shrink-0">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      <DataTable
        columns={[
          { key: "userName", header: t("name"), type: "avatar", subtitleKey: "userEmail" },
          { key: "companyName", header: t("company") },
          { key: "position", header: t("position") },
          { key: "employeeId", header: t("employeeId") },
          { key: "statusDisplay", header: t("status"), type: "status" },
        ]}
        data={rows}
        emptyTitle={tc("noData")}
        emptyDescription={tc("noResults")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {tc("page")} {page} {tc("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a href={buildUrl(page - 1)} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </span>
            )}
            {page < totalPages ? (
              <a href={buildUrl(page + 1)} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
