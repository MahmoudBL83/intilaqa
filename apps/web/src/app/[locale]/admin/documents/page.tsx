import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable } from "@intilaqa/ui";
import { Plus, FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";

type SearchParams = { search?: string; page?: string; created?: string; updated?: string; type?: string; status?: string };

const documentTypes = [
  { key: "COMMERCIAL_REGISTRATION", label: "cr", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "MUNICIPALITY_LICENSE", label: "municipality", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "ZAKAT_CERTIFICATE", label: "zakat", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "IQAMA", label: "iqama", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { key: "PASSPORT", label: "passport", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { key: "WORK_LICENSE", label: "workLicense", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
];

export default async function DocumentsPage({ searchParams, params: localeParams }: { searchParams: Promise<SearchParams>; params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await localeParams;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("documents");
  const sidebarT = await getTranslations("sidebar");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const typeFilter = sp.type || "";
  const statusFilter = sp.status || "";
  const pageSize = 10;

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (typeFilter) where.type = typeFilter;
  if (statusFilter) where.status = statusFilter;

  const [documents, total, statusAgg] = await Promise.all([
    prisma.document.findMany({ where: where as any, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.document.count({ where: where as any }),
    prisma.document.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const validCount = statusAgg.find((s) => s.status === "active")?._count.status || 0;
  const expiredCount = statusAgg.find((s) => s.status === "expired")?._count.status || 0;

  const data = documents.map((d) => ({ id: d.id, name: d.name, type: d.type, status: d.status, expiryDate: d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "—", rawStatus: d.status }));

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: dashboardT("overview"), href: `/${locale}/admin` }, { label: t("title") }]}
        actions={<Link href={`/${locale}/admin/documents/new`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"><Plus className="w-4 h-4" />{t("newDocument")}</Link>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-blue-700/70 mb-1">{t("title")}</p><p className="text-3xl font-bold text-blue-900">{total}</p></div>
            <div className="w-10 h-10 rounded-xl bg-blue-200/50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-700" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-emerald-700/70 mb-1">{t("valid")}</p><p className="text-3xl font-bold text-emerald-900">{validCount}</p></div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-700" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-red-700/70 mb-1">{t("expired")}</p><p className="text-3xl font-bold text-red-900">{expiredCount}</p></div>
            <div className="w-10 h-10 rounded-xl bg-red-200/50 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-700" /></div>
          </div>
        </div>
      </div>

      <form method="GET" className="mb-4">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white/20 rounded-2xl border border-outline-variant/30">
          <input name="search" defaultValue={search} placeholder={commonT("search")} className="flex-1 min-w-[200px] px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex flex-wrap gap-2">
            {documentTypes.map((dt) => {
              const isActive = typeFilter === dt.key;
              return (
                <button key={dt.key} type="submit" name="type" value={isActive ? "" : dt.key} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${isActive ? dt.color : "bg-white/30 border-white/40 text-on-surface-variant/60 hover:bg-white/50"}`}>
                  {t(dt.label)}
                </button>
              );
            })}
          </div>
          <select name="status" defaultValue={statusFilter} className="px-3 py-2 rounded-2xl bg-white/30 border border-outline-variant/60 text-[13px]">
            <option value="">{commonT("all")}</option>
            <option value="active">{t("valid")}</option>
            <option value="expired">{t("expired")}</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-2xl bg-primary text-white text-[13px] font-bold">{commonT("search")}</button>
          {(search || typeFilter || statusFilter) && <a href="?" className="px-4 py-2 rounded-2xl bg-white/30 border border-outline-variant/60 text-on-surface-variant/60 text-[13px] font-medium hover:bg-white/50 transition-all flex items-center">{commonT("clear")}</a>}
        </div>
      </form>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
        <div className="p-6">
          <DataTable
            columns={[
              { key: "name", header: t("name") },
              { key: "type", header: t("type") },
              { key: "rawStatus", header: t("status"), type: "status" },
              { key: "expiryDate", header: t("expiryDate") },
            ]}
            data={data}
            page={page}
            totalPages={Math.ceil(total / pageSize)}
            emptyTitle={t("noDocuments")}
            emptyDescription={t("noDocumentsDesc")}
          />
        </div>
      </div>
    </div>
  );
}
