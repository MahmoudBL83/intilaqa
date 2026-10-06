"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Shield, AlertTriangle, FileWarning, CheckCircle, XCircle,
  Plus, Trash2, Loader2,
} from "lucide-react";
import { PageHeader, KPICard, FormDialog, FormInput, FormSelect, FormTextarea, StatusBadge } from "@intilaqa/ui";

type Policy = { id: string; name: string; description: string | null; deductionType: string; deductionValue: number };
type Violation = { id: string; employeeName: string; employeeId: string; policyName: string; deductionType: string; deductionValue: number; date: string; status: string; notes: string | null };
type Stats = { totalViolations: number; pendingReviews: number; totalPolicies: number; appliedCount: number };

export function ViolationsContent({ policies, violations, stats }: { policies: Policy[]; violations: Violation[]; stats: Stats }) {
  const t = useTranslations("violations");
  const locale = useLocale();
  const tc = useTranslations("common");
  const router = useRouter();
  const [tab, setTab] = useState<"violations" | "policies">("violations");
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreatePolicy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/v1/violations/policies", {
        method: "POST",
        body: JSON.stringify({ name: fd.get("name"), description: fd.get("description") || null, deductionType: fd.get("deductionType"), deductionValue: Number(fd.get("deductionValue")) }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh(); setShowPolicyDialog(false);
    } catch { setError(t("failedToCreatePolicy")); } finally { setSaving(false); }
  }

  async function handleDeletePolicy(policyId: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/v1/violations/policies?id=${policyId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleApprove(id: string) {
    await fetch("/api/v1/violations", { method: "PATCH", body: JSON.stringify({ id, action: "approve" }), headers: { "Content-Type": "application/json" } });
    router.refresh();
  }

  async function handleReject(id: string) {
    await fetch("/api/v1/violations", { method: "PATCH", body: JSON.stringify({ id, action: "reject" }), headers: { "Content-Type": "application/json" } });
    router.refresh();
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: tc("dashboard"), href: `/${locale}/company` }, { label: t("title") }]}
        actions={<button onClick={() => setShowPolicyDialog(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold"><Plus className="w-4 h-4" />{t("newPolicy")}</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title={t("totalViolations")} value={stats.totalViolations} icon={<AlertTriangle className="w-6 h-6" />} color="yellow" />
        <KPICard title={t("pendingReview")} value={stats.pendingReviews} icon={<FileWarning className="w-6 h-6" />} color="yellow" />
        <KPICard title={t("totalPolicies")} value={stats.totalPolicies} icon={<Shield className="w-6 h-6" />} color="blue" />
        <KPICard title={t("applied")} value={stats.appliedCount} icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
      </div>
      <div className="flex gap-2 mb-6">
        {(["violations", "policies"] as const).map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${tab === tb ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/30 border border-outline-variant/40 text-on-surface hover:bg-white/50"}`}>
            {tb === "violations" ? t("employeeViolations") : t("policies")}
          </button>
        ))}
      </div>
      {tab === "violations" && (
        <div className="floating-glass rounded-[2rem] p-6">
          {violations.length === 0 ? (
            <div className="py-12 text-center"><CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-on-surface-variant/50 text-[14px]">{t("noViolations")}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("employee")}</th>
                  <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("policy")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("deduction")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("date")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700"></th>
                </tr></thead>
                <tbody>
                  {violations.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-3 font-medium text-[13px]">{v.employeeName}</td>
                      <td className="px-3 py-3 text-[12px] max-w-[200px] truncate">{v.policyName}</td>
                      <td className="px-3 py-3 text-center font-medium">{v.deductionType === "PERCENTAGE" ? `${v.deductionValue}%` : `${v.deductionValue} SAR`}</td>
                      <td className="px-3 py-3 text-center text-[12px]">{formatDate(v.date)}</td>
                      <td className="px-3 py-3 text-center"><StatusBadge status={v.status} /></td>
                      <td className="px-3 py-3 text-center">
                        {v.status === "pending" && (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleApprove(v.id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200" title={t("approve")}><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => handleReject(v.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" title={t("reject")}><XCircle className="w-4 h-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "policies" && (
        <div className="floating-glass rounded-[2rem] p-6">
          {policies.length === 0 ? (
            <div className="py-12 text-center"><Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-on-surface-variant/50 text-[14px]">{t("noPolicies")}</p>
              <button onClick={() => setShowPolicyDialog(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold">{t("createFirstPolicy")}</button></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("policyName")}</th>
                  <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("description")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("type")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("value")}</th>
                  <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700"></th>
                </tr></thead>
                <tbody>
                  {policies.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-3 font-medium text-[13px]">{p.name}</td>
                      <td className="px-3 py-3 text-[12px] max-w-[250px] truncate">{p.description || "—"}</td>
                      <td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.deductionType === "PERCENTAGE" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{p.deductionType}</span></td>
                      <td className="px-3 py-3 text-center font-medium">{p.deductionType === "PERCENTAGE" ? `${p.deductionValue}%` : `${p.deductionValue} SAR`}</td>
                      <td className="px-3 py-3 text-center"><button onClick={() => handleDeletePolicy(p.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <FormDialog open={showPolicyDialog} onClose={() => { setShowPolicyDialog(false); setError(""); }} title={t("newPolicy")}>
        <form onSubmit={handleCreatePolicy} className="space-y-4">
          {error && <div className="p-3 bg-error/10 text-error text-[13px] rounded-xl">{error}</div>}
          <FormInput name="name" label={t("policyName")} required />
          <FormTextarea name="description" label={t("description")} />
          <FormSelect name="deductionType" label={t("deductionType")} options={[{ value: "FIXED", label: t("fixedAmount") }, { value: "PERCENTAGE", label: t("percentageSalary") }]} required />
          <FormInput name="deductionValue" label={t("deductionValue")} type="number" required min="1" />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("createPolicy")}</button>
            <button type="button" onClick={() => setShowPolicyDialog(false)} className="px-5 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-bold">{tc("cancel")}</button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
