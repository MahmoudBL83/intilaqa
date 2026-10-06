"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Award, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader, KPICard, FormDialog, FormInput, FormSelect, StatusBadge } from "@intilaqa/ui";

type Cert = { id: string; name: string; certificateNumber: string | null; issuingAuthority: string | null; issueDate: string | null; expiryDate: string | null; profession: string | null; qiwaProfessionCode: string | null; isVerified: boolean; status: string; employeeName: string; employeeId: string };
type EmployeeOption = { id: string; name: string };
type Stats = { total: number; expiring: number; verified: number };

export function ProfessionalCertificatesContent({ certs, employees, stats }: { certs: Cert[]; employees: EmployeeOption[]; stats: Stats }) {
  const t = useTranslations("professionalCertificates");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/v1/professional-certificates", {
        method: "POST",
        body: JSON.stringify({ name: fd.get("name"), certificateNumber: fd.get("certificateNumber") || null, issuingAuthority: fd.get("issuingAuthority") || null, issueDate: fd.get("issueDate") || null, expiryDate: fd.get("expiryDate") || null, profession: fd.get("profession") || null, qiwaProfessionCode: fd.get("qiwaProfessionCode") || null, employeeId: fd.get("employeeId") }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh(); setShowDialog(false);
    } catch { setError(t("failedCreate")); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/v1/professional-certificates?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" }) : "\u2014";
  const daysLeft = (expiry: string | null) => { if (!expiry) return null; return Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)); };

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={[{ label: t("dashboard"), href: `/${locale}/company` }, { label: t("title") }]}
        actions={<button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold"><Plus className="w-4 h-4" />{t("addCertificate")}</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KPICard title={t("total")} value={stats.total} icon={<Award className="w-6 h-6" />} color="blue" />
        <KPICard title={t("expiring")} value={stats.expiring} icon={<Award className="w-6 h-6" />} color="yellow" />
        <KPICard title={t("verified")} value={stats.verified} icon={<CheckCircle2 className="w-6 h-6" />} color="emerald" />
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        {certs.length === 0 ? (
          <div className="py-12 text-center"><Award className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{t("noData")}</p><button onClick={() => setShowDialog(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold">{t("addAction")}</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("certificate")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("employee")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("profession")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("issue")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("expiry")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700"></th>
              </tr></thead>
              <tbody>
                {certs.map((c) => {
                  const dl = daysLeft(c.expiryDate);
                  return (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-3"><p className="font-medium text-[13px]">{c.name}</p>{c.certificateNumber && <p className="text-gray-400 text-[11px]">#{c.certificateNumber}</p>}</td>
                      <td className="px-3 py-3 text-[13px]">{c.employeeName}</td>
                      <td className="px-3 py-3 text-[12px]"><div>{c.profession || "\u2014"}</div>{c.qiwaProfessionCode && <span className="text-[10px] text-primary font-mono">Qiwa: {c.qiwaProfessionCode}</span>}</td>
                      <td className="px-3 py-3 text-center text-[12px]">{formatDate(c.issueDate)}</td>
                      <td className="px-3 py-3 text-center">{c.expiryDate ? <span className={`text-[12px] font-bold ${dl !== null && dl < 0 ? "text-red-600" : dl !== null && dl <= 30 ? "text-yellow-600" : "text-gray-600"}`}>{formatDate(c.expiryDate)}{dl !== null && <span className="block text-[10px]">{dl < 0 ? t("daysExpired", { days: Math.abs(dl) }) : t("daysLeft", { days: dl })}</span>}</span> : <span className="text-gray-400 text-[12px]">\u2014</span>}</td>
                      <td className="px-3 py-3 text-center"><div className="flex items-center justify-center gap-1"><StatusBadge status={c.status} />{c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}</div></td>
                      <td className="px-3 py-3 text-center"><button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <FormDialog open={showDialog} onClose={() => { setShowDialog(false); setError(""); }} title={t("addCertificate")}>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-error/10 text-error text-[13px] rounded-xl">{error}</div>}
          <FormSelect name="employeeId" label={t("employee")} required options={employees.map((e) => ({ value: e.id, label: e.name }))} />
          <FormInput name="name" label={t("certificateName")} required />
          <FormInput name="certificateNumber" label={t("certificateNumber")} />
          <FormInput name="issuingAuthority" label={t("issuingAuthority")} />
          <FormInput name="profession" label={t("profession")} />
          <FormInput name="qiwaProfessionCode" label={t("qiwaCode")} />
          <FormInput name="issueDate" label={t("issueDate")} type="date" />
          <FormInput name="expiryDate" label={t("expiryDate")} type="date" />
          <button type="submit" disabled={saving} className="w-full px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("save")}</button>
        </form>
      </FormDialog>
    </div>
  );
}
