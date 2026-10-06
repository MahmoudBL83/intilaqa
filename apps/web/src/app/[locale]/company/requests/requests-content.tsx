"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader, KPICard, StatusBadge } from "@intilaqa/ui";
import { FileText, Clock, CheckCircle } from "lucide-react";

type Request = { id: string; type: string; title: string; employeeName: string; status: string; startDate: string; endDate: string | null; createdAt: string };

export function RequestsContent({ requests, total, pending, page, totalPages, typeFilter, statusFilter, locale }: {
  requests: Request[]; total: number; pending: number; page: number; totalPages: number; typeFilter: string; statusFilter: string; locale: string;
}) {
  const router = useRouter();
  const t = useTranslations("requests");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    return `?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader title={t("pageTitle")} breadcrumbs={[{ label: tn("items.dashboard"), href: `/${locale}/company` }, { label: t("pageTitle") }]} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={td("total")} value={total} icon={<FileText className="w-5 h-5" />} color="blue" />
        <KPICard title={t("pending")} value={pending} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <KPICard title={t("approved")} value={requests.filter((r) => r.status === "approved").length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
      </div>
      <form method="GET" className="flex gap-2 mb-4">
        <select name="type" defaultValue={typeFilter} className="px-3 py-2 rounded-2xl bg-white/40 border border-outline-variant/60 text-[13px]">
          <option value="">{tc("allTypes")}</option>
          <option value="leave">{t("leave")}</option>
          <option value="permission">{t("permission")}</option>
          <option value="overtime">{t("overtime")}</option>
          <option value="salary_letter">{t("salaryLetter")}</option>
          <option value="loan">{t("loan")}</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="px-3 py-2 rounded-2xl bg-white/40 border border-outline-variant/60 text-[13px]">
          <option value="">{tc("allStatus")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="approved">{t("approved")}</option>
          <option value="rejected">{t("rejected")}</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded-2xl bg-primary text-white text-[13px] font-bold">{tc("filter")}</button>
      </form>
      <div className="floating-glass rounded-[2rem] p-6">
        {requests.length === 0 ? (
          <div className="py-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{t("noRequests")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("employee")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("type")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("requestTitle")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("start")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
              </tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-3 font-medium text-[13px]">{r.employeeName}</td>
                    <td className="px-3 py-3 text-[12px]"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold capitalize">{r.type.replace("_", " ")}</span></td>
                    <td className="px-3 py-3 text-[13px]">{r.title}</td>
                    <td className="px-3 py-3 text-center text-[12px]">{new Date(r.startDate).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {page > 1 && <a href={buildUrl(page - 1)} className="px-4 py-2 rounded-xl bg-white/30 text-[12px] font-bold">{tc("prev")}</a>}
          <span className="px-3 py-2 text-[12px] text-gray-400">{page}/{totalPages}</span>
          {page < totalPages && <a href={buildUrl(page + 1)} className="px-4 py-2 rounded-xl bg-white/30 text-[12px] font-bold">{tc("next")}</a>}
        </div>
      )}
    </div>
  );
}
