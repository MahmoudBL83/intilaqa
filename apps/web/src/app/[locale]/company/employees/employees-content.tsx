"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader, DataTable, StatusBadge, KPICard } from "@intilaqa/ui";
import { Users, Building2, Search } from "lucide-react";
import Link from "next/link";

type Employee = { id: string; name: string; email: string; employeeId: string | null; position: string | null; department: string | null; salary: number; isSaudi: boolean; joinDate: string };
type Dept = { id: string; name: string };

export function EmployeesContent({
  employees, departments, total, page, totalPages, search, deptFilter, locale,
}: {
  employees: Employee[]; departments: Dept[]; total: number; page: number; totalPages: number; search: string; deptFilter: string; locale: string;
}) {
  const t = useTranslations("employees");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const saudi = employees.filter((e) => e.isSaudi).length;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (search) params.set("search", search);
    if (deptFilter) params.set("department", deptFilter);
    return `?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader title={tn("items.employees")} breadcrumbs={[{ label: tn("items.dashboard"), href: `/${locale}/company` }, { label: tn("items.employees") }]}
        actions={<Link href={`/${locale}/company/users/new`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold">{t("addEmployee")}</Link>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={td("total")} value={total} icon={<Users className="w-5 h-5" />} color="blue" />
        <KPICard title={td("saudi")} value={saudi} icon={<Building2 className="w-5 h-5" />} color="emerald" />
        <KPICard title={td("expat")} value={total - saudi} icon={<Building2 className="w-5 h-5" />} color="yellow" />
      </div>
      <form method="GET" className="flex gap-2 mb-4">
        <div className="flex items-center bg-white/40 border border-outline-variant/60 rounded-2xl h-11 px-4 flex-1">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input name="search" defaultValue={search} placeholder={tc("search")} className="w-full bg-transparent border-none focus:ring-0 text-[14px] outline-none ml-2" />
        </div>
        <select name="department" defaultValue={deptFilter} className="px-3 py-2 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[13px]">
          <option value="">{tc("allDepartments")}</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 rounded-2xl bg-primary text-white text-[13px] font-bold">{tc("filter")}</button>
      </form>
      <div className="floating-glass rounded-[2rem] p-6">
        {employees.length === 0 ? (
          <div className="py-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{t("noEmployees")}</p></div>
        ) : (
          <DataTable
            columns={[
              { key: "name", header: t("name"), render: (e: Employee) => <span className="font-bold text-on-surface text-[14px]">{e.name}</span> },
              { key: "employeeId", header: t("employeeId"), render: (e: Employee) => <span className="text-gray-500 text-[12px] font-mono">{e.employeeId || "—"}</span> },
              { key: "position", header: t("position"), render: (e: Employee) => <span className="text-[13px]">{e.position || "—"}</span> },
              { key: "department", header: t("department"), render: (e: Employee) => <span className="text-[13px]">{e.department || "—"}</span> },
              { key: "salary", header: t("salary"), render: (e: Employee) => <span className="font-bold">{e.salary.toLocaleString()} SAR</span> },
            ]}
            data={employees}
            emptyTitle={t("noEmployees")}
            emptyDescription={t("noEmployeesDesc")}
          />
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-gray-400 text-[12px]">{tc("page")} {page} {tc("of")} {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <a href={buildUrl(page - 1)} className="px-4 py-2 rounded-xl bg-white/30 border border-outline-variant/40 text-on-surface text-[12px] font-bold">{tc("prev")}</a>}
            {page < totalPages && <a href={buildUrl(page + 1)} className="px-4 py-2 rounded-xl bg-white/30 border border-outline-variant/40 text-on-surface text-[12px] font-bold">{tc("next")}</a>}
          </div>
        </div>
      )}
    </div>
  );
}
