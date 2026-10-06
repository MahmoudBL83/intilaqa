"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { PageHeader } from "@intilaqa/ui";
import { createPayroll } from "../actions";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const monthKeys = ["january","february","march","april","may","june","july","august","september","october","november","december"] as const;

export default function NewPayrollPage() {
  const t = useTranslations("payroll");
  const tc = useTranslations("common");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("locale", locale);
      formData.set("month", String(month));
      formData.set("year", String(year));

      const result = await createPayroll(formData);
      if (result.success) {
        setSuccess(t("createdSuccess"));
        setTimeout(() => router.push(`/${locale}/admin/payroll/${result.id}`), 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("createError"));
    } finally {
      setLoading(false);
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div>
      <PageHeader
        title={t("newRun")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/payroll` },
          { label: t("newRun") },
        ]}
      />

      <div className="max-w-lg">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
          <div className="p-6">
            <h2 className="text-[16px] font-bold text-on-surface mb-1">{t("newRun")}</h2>
            <p className="text-[13px] text-on-surface-variant/50 mb-5">{t("runDetails")}</p>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl mb-5 border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-[13px] font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-600 rounded-xl mb-5 border border-green-200">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-[13px] font-medium">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">
                  {t("month")}
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                >
                  {monthKeys.map((key, idx) => (
                    <option key={idx + 1} value={idx + 1}>{tc(key)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">
                  {t("year")}
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? t("creating") : t("createRun")}
                </button>
                <Link
                  href={`/${locale}/admin/payroll`}
                  className="px-6 py-2.5 rounded-2xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-bold hover:bg-white/80 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tc("cancel")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
