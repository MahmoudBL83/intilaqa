import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { EmployeesContent } from "./employees-content";

export default async function EmployeesPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string; client?: string; company?: string; created?: string; updated?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("employees");
  const dashboardT = await getTranslations("dashboard");
  const commonT = await getTranslations("common");

  const paramsData = await searchParams;
  const search = paramsData.search ?? "";
  const page = Math.max(1, parseInt(paramsData.page ?? "1", 10) || 1);
  const created = paramsData.created === "1";
  const updated = paramsData.updated === "1";
  const clientFilter = paramsData.client ?? "";
  const companyFilter = paramsData.company ?? "";
  const take = 10;
  const skip = (page - 1) * take;

  const [clients, companiesArr] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.company.findMany({
      select: { id: true, name: true, client: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const companies = companiesArr.map((c) => ({ id: c.id, name: c.name, clientName: c.client?.name ?? "" }));

  const where: Record<string, unknown> = {};
  if (search) where.user = { name: { contains: search, mode: "insensitive" as const } };
  if (companyFilter) where.companyId = companyFilter;
  else if (clientFilter) where.company = { clientId: clientFilter };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        company: { select: { name: true, client: { select: { id: true, name: true } } } },
      },
      take,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  const rows = employees.map((e) => ({
    id: e.id,
    userName: e.user.name,
    userEmail: e.user.email,
    companyName: e.company.name,
    clientName: (e.company as any).client?.name ?? "—",
    position: e.position ?? "—",
    employeeId: e.employeeId ?? "—",
    statusDisplay: e.isActive ? "active" : "inactive",
  }));

  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.filter((e) => !e.isActive).length;
  const companyCount = new Set(employees.map((e) => e.companyId)).size;

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (clientFilter) queryParts.push(`client=${encodeURIComponent(clientFilter)}`);
  if (companyFilter) queryParts.push(`company=${encodeURIComponent(companyFilter)}`);
  const queryString = queryParts.join("&");

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? commonT("createdSuccess", { fallback: "Created successfully" }) : commonT("updatedSuccess", { fallback: "Updated successfully" })}
        </div>
      )}

      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: t("title") },
        ]}
        actions={
          <>
            <button className="px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-on-surface text-[14px] font-bold hover:bg-white/60 hover:scale-[1.02] transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              {commonT("export")}
            </button>
            <Link
              href={`/${locale}/admin/employees/new`}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("addEmployee")}
            </Link>
          </>
        }
      />

      <AdminFilterBar clients={clients} companies={companies} currentClient={clientFilter} currentCompany={companyFilter} locale={locale} />

      <EmployeesContent
        employees={rows}
        total={total}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        companyCount={companyCount}
        locale={locale}
        page={page}
        totalPages={totalPages}
        queryString={queryString}
        emptyTitle={commonT("noData")}
        emptyDescription={commonT("noResults")}
      />
    </div>
  );
}
