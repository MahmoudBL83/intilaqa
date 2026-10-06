"use client";

import { useTranslations } from "next-intl";
import { PageHeader, KPICard, StatusBadge } from "@intilaqa/ui";
import { UserCheck, Clock, XCircle, Users, Search } from "lucide-react";

type Record = { id: string; employeeName: string; employeeId: string | null; department: string | null; checkIn: string | null; checkOut: string | null; status: string; date: string };
type Dept = { id: string; name: string };
type Stats = { present: number; late: number; absent: number; total: number };

export function AttendanceContent({ records, departments, stats, total, page, totalPages, dateFilter, deptFilter, locale }: {
  records: Record[]; departments: Dept[]; stats: Stats; total: number; page: number; totalPages: number; dateFilter: string; deptFilter: string; locale: string;
}) {
  const t = useTranslations("attendance");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (dateFilter) params.set("date", dateFilter);
    if (deptFilter) params.set("department", deptFilter);
    return `?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: tn("items.dashboard"), href: `/${locale}/company` }, { label: t("title") }]} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KPICard title={t("present")} value={stats.present} icon={<UserCheck className="w-5 h-5" />} color="emerald" />
        <KPICard title={t("late")} value={stats.late} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <KPICard title={t("absent")} value={stats.absent} icon={<XCircle className="w-5 h-5" />} color="red" />
        <KPICard title={td("total")} value={stats.total} icon={<Users className="w-5 h-5" />} color="blue" />
      </div>
      <form method="GET" className="flex gap-2 mb-4">
        <input type="date" name="date" defaultValue={dateFilter} className="px-3 py-2 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[13px]" />
        <select name="department" defaultValue={deptFilter} className="px-3 py-2 rounded-2xl bg-white/40 border border-outline-variant/60 text-[13px]">
          <option value="">{t("allDepartments")}</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 rounded-2xl bg-primary text-white text-[13px] font-bold"><Search className="w-4 h-4" /></button>
      </form>
      <div className="floating-glass rounded-[2rem] p-6">
        {records.length === 0 ? (
          <div className="py-12 text-center"><Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{t("noRecords")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("employee")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("department")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("checkIn")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("checkOut")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
              </tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-3 font-medium text-gray-900 text-[13px]">{r.employeeName}</td>
                    <td className="px-3 py-3 text-gray-500 text-[12px]">{r.department || "—"}</td>
                    <td className="px-3 py-3 text-center text-[12px]">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—"}</td>
                    <td className="px-3 py-3 text-center text-[12px]">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—"}</td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-gray-400 text-[12px]">{tc("page")} {page} {tc("of")} {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <a href={buildUrl(page - 1)} className="px-4 py-2 rounded-xl bg-white/30 border border-outline-variant/40 text-[12px] font-bold">{tc("prev")}</a>}
            {page < totalPages && <a href={buildUrl(page + 1)} className="px-4 py-2 rounded-xl bg-white/30 border border-outline-variant/40 text-[12px] font-bold">{tc("next")}</a>}
          </div>
        </div>
      )}
    </div>
  );
}
