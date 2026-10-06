"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader, FormSection, LoadingState } from "@intilaqa/ui";

type Props = {
  locale: string;
  companyId: string;
  employeeCount: number;
};

export function NewPayrollRunContent({ locale, companyId, employeeCount }: Props) {
  const t = useTranslations("nav");
  const tp = useTranslations("payroll");
  const router = useRouter();

  const [payrollMonth, setPayrollMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!payrollMonth) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, payrollMonth }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || tp("createError"));
      }

      router.push(`/${locale}/company/payroll`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={tp("newRun")}
        breadcrumbs={[
          { label: t("items.dashboard"), href: `/${locale}/company` },
          { label: t("items.payroll"), href: `/${locale}/company/payroll` },
          { label: tp("newRun") },
        ]}
      />

      <FormSection title={tp("runDetails")}>
        <div className="space-y-6">
          <div>
            <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
              {tp("payrollMonth")}
            </label>
            <input
              type="month"
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(e.target.value)}
              className="w-full max-w-xs px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="p-4 rounded-xl bg-white/30 border border-white/40">
            <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase tracking-wider">
              {tp("activeEmployees")}
            </p>
            <p className="text-on-surface text-[24px] font-bold mt-1">{employeeCount}</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-error/10 text-error text-[14px] font-bold border border-error/20">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !payrollMonth}
            className="px-8 py-3.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (tp("creating")) : (tp("createRun"))}
          </button>
        </div>
      </FormSection>
    </div>
  );
}
