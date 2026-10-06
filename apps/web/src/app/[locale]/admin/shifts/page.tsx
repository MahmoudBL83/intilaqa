import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, KPICard } from "@intilaqa/ui";
import { Plus, Clock, ShieldCheck, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { ShiftsContent } from "./shifts-content";

type SearchParams = { search?: string; companyId?: string; type?: string };

export default async function ShiftsPage({ searchParams, params }: { searchParams: Promise<SearchParams>; params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("shifts");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const sp = await searchParams;
  const search = sp.search || "";
  const companyFilter = sp.companyId || "";
  const typeFilter = sp.type || "";

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (companyFilter) where.companyId = companyFilter;
  if (typeFilter) where.type = typeFilter;

  const [shifts, total, totalActive, companies] = await Promise.all([
    prisma.shift.findMany({ where: where as any, orderBy: { name: "asc" }, include: { company: { select: { id: true, name: true } } } }),
    prisma.shift.count({ where: where as any }),
    prisma.shift.count({ where: { ...where, isActive: true } as any }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const companiesWithShifts = new Set(shifts.filter((s) => s.companyId).map((s) => s.companyId)).size;
  const avgWorkingDays = shifts.length > 0 ? Math.round(shifts.reduce((sum, s) => sum + s.workingDays, 0) / shifts.length) : 0;

  const typeNames: Record<string, string> = { fixed: t("fixed"), variable: t("variable"), night: t("night"), seasonal: t("seasonal") };

  const data = shifts.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    startTime: s.startTime,
    endTime: s.endTime,
    workingDays: s.workingDays,
    breakMinutes: s.breakMinutes,
    companyName: s.company?.name || "",
    companyId: s.companyId,
    isActive: s.isActive,
  }));

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: dashboardT("overview"), href: `/${locale}/admin` }, { label: t("title") }]}
        actions={
          <Link
            href={`/${locale}/admin/shifts/new`}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("newShift")}
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KPICard title={t("title")} value={total} icon={<Clock className="w-6 h-6" />} color="blue" />
        <KPICard title={commonT("active")} value={totalActive} icon={<ShieldCheck className="w-6 h-6" />} color="emerald" />
        <KPICard title={commonT("companies")} value={companiesWithShifts} icon={<Building2 className="w-6 h-6" />} color="green" />
        <KPICard title={t("workingDays")} value={avgWorkingDays} icon={<Calendar className="w-6 h-6" />} color="yellow" />
      </div>

      <form method="GET" className="flex gap-2 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder={t("searchPlaceholder")}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] placeholder:text-on-surface-variant/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
        />
        <select
          name="companyId"
          defaultValue={companyFilter}
          className="px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        >
          <option value="">{commonT("allCompanies")}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={typeFilter}
          className="px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        >
          <option value="">{commonT("allTypes")}</option>
          <option value="fixed">{t("fixed")}</option>
          <option value="variable">{t("variable")}</option>
          <option value="night">{t("night")}</option>
          <option value="seasonal">{t("seasonal")}</option>
        </select>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          {commonT("search")}
        </button>
        {search && (
          <a
            href={`/${locale}/admin/shifts`}
            className="px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-bold hover:bg-white/80 transition-all flex items-center"
          >
            {commonT("clear")}
          </a>
        )}
      </form>

      <ShiftsContent
        shifts={data}
        emptyTitle={t("noShifts")}
        emptyDescription={t("noShiftsDesc")}
      />
    </div>
  );
}
