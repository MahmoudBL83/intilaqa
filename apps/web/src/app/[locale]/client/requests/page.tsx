import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable, StatCard } from "@intilaqa/ui";
import { FileText, CheckCircle, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default async function RequestsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string; status?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const client = await prisma.client.findFirst({ where: { userId } });
  if (!client) redirect(`/${locale}/login`);

  const t = await getTranslations("requests");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const statusFilter = sp.status || "";
  const typeFilter = sp.type || "";

  const where: Record<string, unknown> = {
    employee: { company: { clientId: client.id } },
  };
  if (search) {
    (where.employee as Record<string, unknown>).user = {
      name: { contains: search, mode: "insensitive" as const },
    };
  }
  if (statusFilter) where.status = statusFilter;
  if (typeFilter) where.type = typeFilter;

  const [data, total, pendingCount, approvedCount] = await Promise.all([
    prisma.employeeRequest.findMany({
      where: where as any,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
            company: { select: { name: true } },
          },
        },
      },
    }),
    prisma.employeeRequest.count({ where: where as any }),
    prisma.employeeRequest.count({ where: { employee: { company: { clientId: client.id } }, status: "pending" } }),
    prisma.employeeRequest.count({ where: { employee: { company: { clientId: client.id } }, status: "approved" } }),
  ]);

  const rows = data.map((r) => ({
    id: r.id,
    employeeName: r.employee.user.name,
    companyName: r.employee.company.name,
    typeDisplay: t(r.type),
    statusDisplay: r.status,
    dateFormatted: new Date(r.createdAt).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }),
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const args = new URLSearchParams();
    args.set("page", String(p));
    if (search) args.set("search", search);
    if (statusFilter) args.set("status", statusFilter);
    if (typeFilter) args.set("type", typeFilter);
    return `?${args.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/client` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title={td("totalEmployees")} value={total} icon={FileText} variant="primary" />
        <StatCard title={t("pending")} value={pendingCount} icon={Clock} variant="secondary" />
        <StatCard title={t("approved")} value={approvedCount} icon={CheckCircle} variant="neutral" />
        <StatCard title={td("status")} value={String(total)} icon={FileText} variant="primary" />
      </div>

      <form method="GET" className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl h-11 px-4 transition-all flex-1 min-w-[200px]">
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
        <select name="status" defaultValue={statusFilter} className="bg-white/40 border border-outline-variant/60 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none font-medium">
          <option value="">{t("status")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="approved">{t("approved")}</option>
          <option value="rejected">{t("rejected")}</option>
        </select>
        <select name="type" defaultValue={typeFilter} className="bg-white/40 border border-outline-variant/60 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none font-medium">
          <option value="">{t("type")}</option>
          <option value="leave">{t("leave")}</option>
          <option value="overtime">{t("overtime")}</option>
          <option value="loan">{t("loan")}</option>
          <option value="document">{t("document")}</option>
          <option value="permission">{t("permission")}</option>
        </select>
        <button type="submit" className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all">{tc("search")}</button>
      </form>

      <DataTable
        columns={[
          { key: "employeeName", header: t("employee"), type: "avatar", subtitleKey: "companyName" },
          { key: "typeDisplay", header: t("type") },
          { key: "dateFormatted", header: t("date") },
          { key: "statusDisplay", header: t("status"), type: "status" },
        ]}
        data={rows}
        emptyTitle={t("noRequests")}
        emptyDescription={t("noRequestsDesc")}
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
