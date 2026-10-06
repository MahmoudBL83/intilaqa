"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader, FormSection, StatusBadge } from "@intilaqa/ui";
import { Building2, CreditCard, Loader2 } from "lucide-react";

type Company = { id: string; name: string; address: string | null; industry: string | null; saudizationPercent: number; nitaqatColor: string; isActive: boolean };
type Sub = { planName: string; startDate: string; endDate: string; status: string } | null;

export function SettingsContent({ company, subscription, locale }: { company: Company; subscription: Sub; locale: string }) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch("/api/v1/companies", {
        method: "PATCH",
        body: JSON.stringify({ id: company.id, name: fd.get("name"), address: fd.get("address"), industry: fd.get("industry") }),
        headers: { "Content-Type": "application/json" },
      });
      router.refresh();
    } catch {} finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: tn("items.dashboard"), href: `/${locale}/company` }, { label: t("title") }]} />
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <FormSection title={t("companyProfile")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-on-surface-variant/60 mb-1">{tc("name")}</label>
              <input name="name" defaultValue={company.name} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-[14px]" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-on-surface-variant/60 mb-1">{t("industry")}</label>
              <input name="industry" defaultValue={company.industry || ""} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-[14px]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase font-bold text-on-surface-variant/60 mb-1">{tc("address")}</label>
              <input name="address" defaultValue={company.address || ""} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-[14px]" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{tc("save")}
          </button>
        </FormSection>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-2xl">
        <div className="floating-glass p-4 rounded-[1.5rem]">
          <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-primary" /><span className="font-bold">{t("branding")}</span></div>
          <p className="text-[24px] font-bold mt-2">{company.saudizationPercent}%</p>
          <p className="text-[11px] uppercase text-on-surface-variant/50">{company.nitaqatColor}</p>
        </div>
        {subscription && (
          <div className="floating-glass p-4 rounded-[1.5rem]">
            <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-primary" /><span className="font-bold">{t("subscription")}</span></div>
            <p className="text-[16px] font-bold mt-2">{subscription.planName}</p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-on-surface-variant/50">
              <span>{new Date(subscription.startDate).toLocaleDateString()}</span><span>→</span><span>{new Date(subscription.endDate).toLocaleDateString()}</span>
              <StatusBadge status={subscription.status} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
