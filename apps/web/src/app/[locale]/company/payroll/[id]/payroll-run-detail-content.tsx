"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { PageHeader, StatCard, DataTable, StatusBadge, LoadingState } from "@intilaqa/ui";
import { updatePayrollRunStatus } from "@/server/services/payroll-engine";

type Run = {
  id: string;
  payrollMonth: string;
  status: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  companyName: string;
  createdAt: string;
  approvedAt: string | null;
  paidAt: string | null;
};

type Item = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  baseSalary: number;
  allowances: number;
  absenceDeduction: number;
  lateDeduction: number;
  violationDeduction: number;
  otherDeductions: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
};

type Props = {
  locale: string;
  run: Run;
  items: Item[];
};

export function PayrollRunDetailContent({ locale, run, items }: Props) {
  const t = useTranslations("nav");
  const tp = useTranslations("payroll");
  const [currentStatus, setCurrentStatus] = useState(run.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: "calculated" | "approved" | "paid") => {
    setUpdating(true);
    try {
      const res = await fetch("/api/v1/payroll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: run.id, status: newStatus }),
      });
      if (res.ok) setCurrentStatus(newStatus);
    } catch {
      // silently fail
    } finally {
      setUpdating(false);
    }
  };

  const statusActions: Record<string, { next: string; action: string }[]> = {
    draft: [
      { next: "calculated", action: tp("calculate") },
    ],
    calculated: [
      { next: "approved", action: tp("approve") },
    ],
    approved: [
      { next: "paid", action: tp("markPaid") },
    ],
  };

  return (
    <div>
      <PageHeader
        title={`${tp("payrollRun")} — ${run.payrollMonth}`}
        breadcrumbs={[
          { label: t("items.dashboard"), href: `/${locale}/company` },
          { label: t("items.payroll"), href: `/${locale}/company/payroll` },
          { label: run.payrollMonth },
        ]}
        actions={
          <div className="flex gap-2">
            {(statusActions[currentStatus] || []).map((action) => (
              <button
                key={action.next}
                onClick={() => handleStatusChange(action.next as any)}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {action.action}
              </button>
            ))}
            <Link
              href={`/${locale}/company/payroll-export`}
              className="px-4 py-2 rounded-xl bg-white/40 border border-white/40 text-on-surface text-[12px] font-bold flex items-center gap-1.5 hover:bg-white/60 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              {tp("wpsMudadExport")}
            </Link>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title={tp("status")} value={currentStatus} icon={CheckCircle2} variant="primary" />
        <StatCard title={tp("gross")} value={`${run.totalGross.toLocaleString()} SAR`} icon={TrendingUp} variant="secondary" />
        <StatCard title={tp("deductions")} value={`${run.totalDeductions.toLocaleString()} SAR`} icon={TrendingDown} variant="error" />
        <StatCard title={tp("net")} value={`${run.totalNet.toLocaleString()} SAR`} icon={DollarSign} variant="primary" />
      </div>

      {/* Employee Items Table */}
      <div className="floating-glass rounded-[2rem] p-6">
        <DataTable
          columns={[
            {
              key: "employee",
              header: tp("employee"),
              render: (item: Item) => (
                <div>
                  <p className="text-on-surface text-[14px] font-bold">{item.employeeName}</p>
                  <p className="text-on-surface-variant/50 text-[11px]">{item.employeeCode} · {item.position}</p>
                </div>
              ),
            },
            {
              key: "baseSalary",
              header: tp("salary"),
              render: (item: Item) => (
                <span className="text-on-surface text-[13px]">{item.baseSalary.toLocaleString()} SAR</span>
              ),
            },
            {
              key: "allowances",
              header: tp("allowances"),
              render: (item: Item) => (
                <span className="text-on-surface text-[13px]">{item.allowances.toLocaleString()} SAR</span>
              ),
            },
            {
              key: "absenceDeduction",
              header: tp("absences"),
              render: (item: Item) => (
                <span className="text-error text-[13px]">{item.absenceDeduction > 0 ? `-${item.absenceDeduction}` : "—"}</span>
              ),
            },
            {
              key: "lateDeduction",
              header: tp("late"),
              render: (item: Item) => (
                <span className="text-error text-[13px]">{item.lateDeduction > 0 ? `-${item.lateDeduction}` : "—"}</span>
              ),
            },
            {
              key: "violationDeduction",
              header: tp("violations"),
              render: (item: Item) => (
                <span className="text-error text-[13px]">{item.violationDeduction > 0 ? `-${item.violationDeduction}` : "—"}</span>
              ),
            },
            {
              key: "netSalary",
              header: tp("net"),
              render: (item: Item) => (
                <span className="text-primary text-[14px] font-bold">{item.netSalary.toLocaleString()} SAR</span>
              ),
            },
          ]}
          data={items}
          emptyTitle={tp("noItems")}
          emptyDescription={tp("noItemsDesc")}
        />
      </div>
    </div>
  );
}
