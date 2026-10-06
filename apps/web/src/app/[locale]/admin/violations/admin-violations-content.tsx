"use client";

import { useTranslations, useLocale } from "next-intl";
import { PageHeader, KPICard, Pagination } from "@intilaqa/ui";
import { Shield, AlertTriangle, FileWarning, Building2 } from "lucide-react";

type Stats = { totalCompanies: number; totalPolicies: number; totalViolations: number; pending: number };
type CompanyStat = { id: string; name: string; totalViolations: number; pendingReviews: number };

export function AdminViolationsContent({
  stats, companyStats, currentPage = 1, totalPages = 1,
}: {
  stats: Stats;
  companyStats: CompanyStat[];
  currentPage?: number;
  totalPages?: number;
}) {
  const t = useTranslations("violations");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("title") }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title={t("companies")} value={stats.totalCompanies} icon={<Building2 className="w-6 h-6" />} color="blue" />
        <KPICard title={t("totalPolicies")} value={stats.totalPolicies} icon={<Shield className="w-6 h-6" />} color="blue" />
        <KPICard title={t("totalViolations")} value={stats.totalViolations} icon={<AlertTriangle className="w-6 h-6" />} color="yellow" />
        <KPICard title={t("pendingReview")} value={stats.pending} icon={<FileWarning className="w-6 h-6" />} color="yellow" />
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        <h2 className="text-[18px] font-bold text-on-surface mb-4">{t("companyBreakdown")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("company")}</th>
              <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("totalViolations")}</th>
              <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("pendingReview")}</th>
            </tr></thead>
            <tbody>
              {companyStats.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-3 py-3 text-center font-bold text-gray-700">{c.totalViolations}</td>
                  <td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.pendingReviews > 0 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>{c.pendingReviews}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
