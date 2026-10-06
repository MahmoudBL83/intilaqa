import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Search, SlidersHorizontal } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { RequestsContent } from "./requests-content";

export default async function RequestsPage({ searchParams, params: localeParams }: { searchParams?: Promise<{ search?: string; page?: string; type?: string; status?: string; company?: string; updated?: string }>; params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await localeParams;
  if (!session?.user) redirect(`/${locale}/login`);

  const params = searchParams ? await searchParams : {};
  const updated = params.updated === "1";
  const search = typeof params.search === "string" ? params.search : "";
  const rawPage = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const typeFilter = typeof params.type === "string" ? params.type : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";
  const companyFilter = typeof params.company === "string" ? params.company : "";
  const take = 10;
  const skip = (page - 1) * take;

  const t = await getTranslations("requests");
  const dt = await getTranslations("dashboard");
  const ct = await getTranslations("common");

  const [companies] = await Promise.all([
    prisma.company.findMany({ select: { id: true, name: true, client: { select: { id: true, name: true } } }, orderBy: { name: "asc" } }),
  ]);

  const companyList = companies.map((c) => ({ id: c.id, name: c.name, clientName: (c.client as any)?.name ?? "" }));

  const where: Record<string, unknown> = {};
  if (search) where.employee = { user: { name: { contains: search, mode: "insensitive" } } };
  if (companyFilter) where.employee = { ...(where.employee as any || {}), companyId: companyFilter };
  if (typeFilter) where.type = typeFilter;
  if (statusFilter) where.status = statusFilter;

  const [requests, totalRecords] = await Promise.all([
    prisma.employeeRequest.findMany({
      where,
      include: {
        employee: {
          include: { user: { select: { name: true } }, company: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.employeeRequest.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / take));

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (typeFilter) queryParts.push(`type=${encodeURIComponent(typeFilter)}`);
  if (statusFilter) queryParts.push(`status=${encodeURIComponent(statusFilter)}`);
  const queryString = queryParts.join('&');

  const typeMap: Record<string, string> = {
    leave: t("leave"), permission: t("permission"), overtime: t("overtime"),
    expense: t("expense"), loan: t("loan"), salary_letter: t("salaryLetter"),
    document: t("document"), other: t("other"),
  };

  const rows = requests.map((r) => ({
    id: r.id,
    employeeName: (r.employee as { user: { name: string } })?.user?.name || "—",
    companyName: (r.employee as any)?.company?.name || "—",
    requestType: typeMap[r.type] || r.type,
    title: r.title,
    dateFormatted: r.startDate ? new Date(r.startDate).toLocaleDateString() : "—",
    status: r.status,
  }));

  return (
    <div>
      {updated && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {ct("updatedSuccess", { fallback: "Updated successfully" })}
        </div>
      )}

      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: dt("overview"), href: `/${locale}/admin` },
          { label: t("title") },
        ]}
      />

      <form method="GET" className="mb-4">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white/20 rounded-2xl border border-outline-variant/30">
          <SlidersHorizontal className="w-5 h-5 text-on-surface-variant/50 shrink-0" />
          <select name="company" defaultValue={companyFilter} className="bg-white/40 border border-outline-variant/50 rounded-xl px-3 py-2 text-on-surface text-[13px] font-medium outline-none focus:border-primary/30">
            <option value="">{dt("companies")}</option>
            {companyList.map((c) => <option key={c.id} value={c.id}>{c.name}{c.clientName ? ` (${c.clientName})` : ""}</option>)}
          </select>
          <select name="type" defaultValue={typeFilter} className="bg-white/40 border border-outline-variant/50 rounded-xl px-3 py-2 text-on-surface text-[13px] font-medium outline-none focus:border-primary/30">
            <option value="">{t("type")}</option>
            <option value="leave">{t("leave")}</option>
            <option value="expense">{t("expense")}</option>
            <option value="overtime">{t("overtime")}</option>
          </select>
          <select name="status" defaultValue={statusFilter} className="bg-white/40 border border-outline-variant/50 rounded-xl px-3 py-2 text-on-surface text-[13px] font-medium outline-none focus:border-primary/30">
            <option value="">{t("status")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="approved">{t("approved")}</option>
            <option value="rejected">{t("rejected")}</option>
          </select>
          <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-11 px-4 min-w-[200px]">
            <Search className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
            <input type="text" name="search" defaultValue={search} placeholder={`${ct("search")}...`} className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium px-2" />
          </div>
          {(typeFilter || statusFilter || search) && (
            <a href="?" className="px-3 py-2 rounded-xl text-on-surface-variant/60 text-[12px] font-bold hover:text-on-surface transition-colors">{ct("cancel")}</a>
          )}
          <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-bold shadow-sm hover:scale-[1.02] transition-all">{ct("filter")}</button>
        </div>
      </form>

      <RequestsContent
        requests={rows}
        total={totalRecords}
        locale={locale}
        page={page}
        totalPages={totalPages}
        queryString={queryString}
        emptyTitle={ct("noData")}
        emptyDescription={ct("noResults")}
      />
    </div>
  );
}
