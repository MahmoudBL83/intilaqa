"use client";

import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, FileText, Clock } from "lucide-react";
import { cn } from "@intilaqa/ui";
import type { ReactNode } from "react";

type PayslipData = {
  id: string;
  employeeName: string;
  companyName: string;
  salary: number;
  netPay: number;
  issuedAt: string;
  hasFile: boolean;
};

type PayrollDetailData = {
  id: string;
  period: string;
  status: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  paidAt: string | null;
  payslips: PayslipData[];
};

const statusConfig: Record<string, { color: string; bg: string; text: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-700", icon: Clock },
  paid: { color: "bg-green-500", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
};

export function PayrollDetailContent({
  record,
  locale,
  markPaidButton,
}: {
  record: PayrollDetailData;
  locale: string;
  markPaidButton?: ReactNode;
}) {
  const t = useTranslations("payroll");
  const tc = useTranslations("common");
  const cfg = statusConfig[record.status] as typeof statusConfig[string] ?? statusConfig.draft;
  const StatusIcon = cfg.icon;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "currency", currency: "SAR", maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-on-surface">{t("periodSummary")}</h2>
              <p className="text-[13px] text-on-surface-variant/50">{t("payrollOverview")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold", cfg.bg, cfg.text)}>
                <StatusIcon className="w-3 h-3" />
                {t(record.status as "draft" | "paid")}
              </span>
              {record.status === "draft" && markPaidButton}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-on-surface-variant/5 p-4">
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("gross")}</p>
              <p className="text-[20px] font-extrabold text-on-surface mt-1">{formatCurrency(record.baseSalary)}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-4">
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("deductions")}</p>
              <p className="text-[20px] font-extrabold text-red-600 mt-1">{formatCurrency(record.deductions)}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-4">
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("net")}</p>
              <p className="text-[20px] font-extrabold text-green-600 mt-1">{formatCurrency(record.netPay)}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-4">
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("payslipsGenerated")}</p>
              <p className="text-[20px] font-extrabold text-on-surface mt-1">{record.payslips.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-400 to-blue-600" />
        <div className="p-6">
          <h3 className="text-[16px] font-bold text-on-surface mb-1">{t("employees")}</h3>
          <p className="text-[13px] text-on-surface-variant/50 mb-5">{tc("details")}</p>

          {record.payslips.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-on-surface-variant/15 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-on-surface mb-0.5">{t("noItems")}</p>
              <p className="text-[12px] text-on-surface-variant/45">{t("noItemsDesc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {record.payslips.map((ps) => (
                <div key={ps.id} className="rounded-xl bg-on-surface-variant/5 p-4 hover:bg-on-surface-variant/8 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary">
                        {ps.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-on-surface leading-tight">{ps.employeeName}</p>
                        <p className="text-[11px] text-on-surface-variant/40">{ps.companyName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <p className="text-on-surface-variant/40">{t("salary")}</p>
                      <p className="font-bold text-on-surface">{formatCurrency(ps.salary)}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant/40">{t("net")}</p>
                      <p className="font-bold text-green-600">{formatCurrency(ps.netPay)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-on-surface-variant/10 text-[11px] text-on-surface-variant/40">
                    <span>{new Date(ps.issuedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>
                    {ps.hasFile && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <FileText className="w-3 h-3" />
                        PDF
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
