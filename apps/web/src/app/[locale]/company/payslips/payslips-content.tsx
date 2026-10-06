"use client";

import { useTranslations } from "next-intl";
import { PageHeader, KPICard, StatusBadge } from "@intilaqa/ui";
import { ReceiptText, Download } from "lucide-react";

type Payslip = { id: string; employeeName: string; period: string; netPay: number; status: string; issuedAt: string };

export function PayslipsContent({ payslips, total, page, totalPages, locale }: { payslips: Payslip[]; total: number; page: number; totalPages: number; locale: string }) {
  const t = useTranslations("payslips");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const totalNet = payslips.reduce((s, p) => s + p.netPay, 0);
  const currency = tc("currency");
  const buildUrl = (p: number) => `?page=${p}`;

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: tn("items.dashboard"), href: `/${locale}/company` }, { label: t("title") }]} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={td("total")} value={total} icon={<ReceiptText className="w-5 h-5" />} color="blue" />
        <KPICard title={t("totalNet")} value={`${totalNet.toLocaleString()} ${currency}`} icon={<ReceiptText className="w-5 h-5" />} color="emerald" />
        <KPICard title={t("average")} value={`${total > 0 ? Math.round(totalNet / total).toLocaleString() : 0} ${currency}`} icon={<ReceiptText className="w-5 h-5" />} color="purple" />
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        {payslips.length === 0 ? (
          <div className="py-12 text-center"><ReceiptText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{t("noData")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("employee")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("period")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("netPay")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700"></th>
              </tr></thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-3 font-medium text-[13px]">{p.employeeName}</td>
                    <td className="px-3 py-3 text-[13px]">{p.period}</td>
                    <td className="px-3 py-3 text-center font-bold">{p.netPay.toLocaleString()} SAR</td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-3 text-center">
                      <a href={`/api/v1/payslips/download?id=${p.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold"><Download className="w-3 h-3" />{t("pdf")}</a>
                    </td>
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
