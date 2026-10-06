"use client";

import { useTranslations, useLocale } from "next-intl";
import { FileText, Download, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@intilaqa/ui";

type PayslipData = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  period: string;
  monthYear: string;
  netPay: string;
  status: string;
  issuedAt: string;
  hasFile: boolean;
  fileUrl: string | null;
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" },
  paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
};

function PayslipCard({ payslip, locale }: { payslip: PayslipData; locale: string }) {
  const t = useTranslations("payslips");
  const tc = useTranslations("common");
  const cfg = statusConfig[payslip.status] as typeof statusConfig[string] ?? statusConfig.draft;

  return (
    <div className="rounded-xl bg-on-surface-variant/5 p-4 hover:bg-on-surface-variant/8 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary">
            {payslip.employeeName.charAt(0)}
          </div>
          <div>
            <p className="text-[13px] font-bold text-on-surface leading-tight">{payslip.employeeName}</p>
            <p className="text-[11px] text-on-surface-variant/40">{payslip.employeeEmail}</p>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", cfg.bg, cfg.text)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          {t(payslip.status as "draft" | "paid")}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("netPay")}</p>
          <p className="text-[16px] font-extrabold text-green-600">{payslip.netPay}</p>
        </div>
        <div className="text-end">
          <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("issuedAt")}</p>
          <p className="text-[12px] font-medium text-on-surface-variant/60">{payslip.issuedAt}</p>
        </div>
      </div>

      {payslip.hasFile && (
        <a
          href={`/api/v1/payslips/download?id=${payslip.id}`}
          className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          {t("downloadPdf")}
        </a>
      )}
    </div>
  );
}

export function PayslipsContent({
  payslips,
  emptyTitle,
  emptyDescription,
  locale,
}: {
  payslips: PayslipData[];
  locale: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("payslips");

  if (payslips.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-dashed border-outline-variant/30 p-12 text-center">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-outline-variant/10" />
        <FileText className="w-14 h-14 text-on-surface-variant/15 mx-auto mb-4" />
        <h3 className="text-[18px] font-bold text-on-surface mb-1">{emptyTitle}</h3>
        <p className="text-[13px] text-on-surface-variant/50 max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  const grouped = payslips.reduce<Record<string, PayslipData[]>>((acc, ps) => {
    if (!acc[ps.monthYear]) acc[ps.monthYear] = [];
    acc[ps.monthYear]!.push(ps);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedMonths.map((monthYear) => {
        const monthPayslips = grouped[monthYear] ?? [];
        return (
          <div key={monthYear}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-on-surface-variant/40" />
              <h3 className="text-[14px] font-bold text-on-surface">{monthYear}</h3>
              <span className="text-[11px] font-bold text-on-surface-variant/40 bg-on-surface-variant/8 px-2 py-0.5 rounded-full">
                {monthPayslips.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {monthPayslips.map((ps) => (
                <PayslipCard key={ps.id} payslip={ps} locale={locale} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
