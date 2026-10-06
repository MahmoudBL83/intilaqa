"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, DataTable, StatusBadge, LoadingState, EmptyState } from "@intilaqa/ui";

type Run = {
  id: string;
  payrollMonth: string;
  status: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  itemCount: number;
  createdAt: string;
  approvedAt: string | null;
  paidAt: string | null;
};

type Props = {
  locale: string;
  companyId: string;
  runs: Run[];
};

export function PayrollRunsContent({ locale, companyId, runs }: Props) {
  const t = useTranslations("nav");
  const tp = useTranslations("payroll");

  const totalPayroll = runs.reduce((s, r) => s + r.totalNet, 0);

  return (
    <div>
      <PageHeader
        title={t("items.payroll")}
        breadcrumbs={[
          { label: t("items.dashboard"), href: `/${locale}/company` },
          { label: t("items.payroll") },
        ]}
        actions={
          <Link
            href={`/${locale}/company/payroll/new`}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            {tp("newRun")}
          </Link>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title={tp("totalPayroll")}
          value={`${totalPayroll.toLocaleString()} SAR`}
          icon={DollarSign}
          variant="primary"
          trend={runs.length > 0 ? { value: `${runs.length} runs`, direction: "up" } : undefined}
        />
        <StatCard
          title={tp("totalDeductions")}
          value={`${runs.reduce((s, r) => s + r.totalDeductions, 0).toLocaleString()} SAR`}
          icon={TrendingDown}
          variant="error"
        />
        <StatCard
          title={tp("totalGross")}
          value={`${runs.reduce((s, r) => s + r.totalGross, 0).toLocaleString()} SAR`}
          icon={TrendingUp}
          variant="secondary"
        />
      </div>

      {/* Payroll runs table */}
      <div className="floating-glass rounded-[2rem] p-6">
        {runs.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="w-10 h-10" />}
            title={tp("noRuns")}
            description={tp("noRunsDesc")}
            action={
              <Link
                href={`/${locale}/company/payroll/new`}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {tp("createRun")}
              </Link>
            }
          />
        ) : (
          <DataTable
            columns={[
              {
                key: "period",
                header: tp("period"),
                render: (item: Run) => (
                  <Link
                    href={`/${locale}/company/payroll/${item.id}`}
                    className="text-on-surface text-[14px] font-bold hover:text-primary transition-colors"
                  >
                    {item.payrollMonth}
                  </Link>
                ),
              },
              {
                key: "status",
                header: tp("status"),
                render: (item: Run) => <StatusBadge status={item.status} label={item.status} />,
              },
              {
                key: "employees",
                header: tp("employees"),
                render: (item: Run) => (
                  <span className="text-on-surface-variant/70 text-[13px]">{item.itemCount}</span>
                ),
              },
              {
                key: "gross",
                header: tp("gross"),
                render: (item: Run) => (
                  <span className="text-on-surface text-[13px] font-bold">{item.totalGross.toLocaleString()} SAR</span>
                ),
              },
              {
                key: "deductions",
                header: tp("deductions"),
                render: (item: Run) => (
                  <span className="text-error text-[13px] font-bold">-{item.totalDeductions.toLocaleString()} SAR</span>
                ),
              },
              {
                key: "net",
                header: tp("net"),
                render: (item: Run) => (
                  <span className="text-primary text-[13px] font-bold">{item.totalNet.toLocaleString()} SAR</span>
                ),
              },
            ]}
            data={runs}
            emptyTitle={tp("noRuns")}
            emptyDescription={tp("noRunsDesc")}
          />
        )}
      </div>
    </div>
  );
}
