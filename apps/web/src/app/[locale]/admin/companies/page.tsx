import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Plus, Download } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { CompaniesContent } from "./companies-content";

const PAGE_SIZE = 10;

export default async function CompaniesPage({ 
  searchParams,
  params
}: { 
  searchParams: Promise<{ search?: string; page?: string; client?: string; created?: string; updated?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("companies");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const clientFilter = sp.client || "";

  const [clients] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" as const };
  if (clientFilter) where.clientId = clientFilter;

  const [data, total, totalEmployees] = await Promise.all([
    prisma.company.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { employees: true } },
      },
    }),
    prisma.company.count({ where }),
    prisma.employee.count({ where: clientFilter ? { company: { clientId: clientFilter } } : {} }),
  ]);

  const rows = data.map((item) => ({
    id: item.id,
    name: item.name,
    industry: (item.industry as string) || "",
    clientName: (item.client as { name: string })?.name || "—",
    employeesCount: String((item._count as { employees: number })?.employees ?? 0),
    statusDisplay: item.isActive ? "active" : "inactive",
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (clientFilter) queryParts.push(`client=${encodeURIComponent(clientFilter)}`);
  const queryString = queryParts.join("&");

  const created = sp.created === "1";
  const updated = sp.updated === "1";

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? tc("createdSuccess", { fallback: tc("save") }) : tc("updatedSuccess", { fallback: tc("save") })}
        </div>
      )}

      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("title") },
        ]}
        actions={
          <>
            <button className="px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-on-surface text-[14px] font-bold hover:bg-white/60 hover:scale-[1.02] transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              {td("exportData")}
            </button>
            <Link
              href={`/${locale}/admin/companies/new`}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("addCompany")}
            </Link>
          </>
        }
      />

      <AdminFilterBar clients={clients} companies={[]} currentClient={clientFilter} locale={locale} />

      <CompaniesContent
        companies={rows}
        total={total}
        totalEmployees={totalEmployees}
        activeCount={data.filter((c) => c.isActive).length}
        locale={locale}
        page={page}
        totalPages={totalPages}
        queryString={queryString}
        emptyTitle={tc("noData")}
        emptyDescription={tc("noResults")}
      />
    </div>
  );
}
