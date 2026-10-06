"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { DollarSign, Users, TrendingUp, CheckCircle2, Clock, FileText } from "lucide-react";
import { cn } from "@intilaqa/ui";

type PayrollData = {
  id: string;
  period: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: string;
  employeeCount: number;
  payslipCount: number;
  paidAt: string | null;
};

const statusConfig: Record<string, { color: string; bg: string; text: string; icon: React.ElementType }> = {
  draft: { color: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-700", icon: Clock },
  paid: { color: "bg-green-500", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
};

function PayrollCard({ record, locale }: { record: PayrollData; locale: string }) {
  const t = useTranslations("payroll");
  const tc = useTranslations("common");
  const cfg = statusConfig[record.status] as typeof statusConfig[string] ?? statusConfig.draft;
  const StatusIcon = cfg.icon;
  const completion = record.employeeCount > 0 ? Math.round((record.payslipCount / record.employeeCount) * 100) : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "currency", currency: "SAR", maximumFractionDigits: 0,
    }).format(val);

  return (
    <Link href={`/${locale}/admin/payroll/${record.id}`} className="block group">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-on-surface group-hover:text-primary transition-colors">{record.period}</h3>
              <p className="text-[12px] text-on-surface-variant/50 mt-0.5">{t("payrollRun")}</p>
            </div>
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold", cfg.bg, cfg.text)}>
              <StatusIcon className="w-3 h-3" />
              {t(record.status as "draft" | "paid")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("gross")}</p>
              <p className="text-[15px] font-bold text-on-surface mt-0.5">{formatCurrency(record.baseSalary)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("deductions")}</p>
              <p className="text-[15px] font-bold text-red-600 mt-0.5">{formatCurrency(record.deductions)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("net")}</p>
              <p className="text-[15px] font-bold text-green-600 mt-0.5">{formatCurrency(record.netPay)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-on-surface-variant/50">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {record.employeeCount} {t("employees")}
            </span>
            {record.paidAt && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {t("paidOn")} {new Date(record.paidAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PayrollContent({
  records,
  emptyTitle,
  emptyDescription,
}: {
  records: PayrollData[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("payroll");
  const locale = useLocale();

  if (records.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-dashed border-outline-variant/30 p-12 text-center">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-outline-variant/10" />
        <DollarSign className="w-14 h-14 text-on-surface-variant/15 mx-auto mb-4" />
        <h3 className="text-[18px] font-bold text-on-surface mb-1">{emptyTitle}</h3>
        <p className="text-[13px] text-on-surface-variant/50 max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {records.map((record) => (
        <PayrollCard key={record.id} record={record} locale={locale} />
      ))}
    </div>
  );
}
