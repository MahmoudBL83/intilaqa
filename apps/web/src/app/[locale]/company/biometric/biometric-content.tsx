"use client";

import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@intilaqa/ui";
import { Fingerprint, Wifi, Users, Clock } from "lucide-react";

export function BiometricContent() {
  const t = useTranslations("biometric");
  const locale = useLocale();
  const tc = useTranslations("common");
  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} breadcrumbs={[{ label: tc("dashboard"), href: `/${locale}/company` }, { label: t("breadcrumb") }]} />
      <div className="floating-glass rounded-[2rem] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Fingerprint className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-[16px] font-bold text-on-surface mb-2">{t("notConfigured")}</h3>
        <p className="text-on-surface-variant/50 text-[13px] max-w-md mx-auto mb-6">
          Biometric integration is not configured. Set the <code className="bg-white/40 px-1.5 py-0.5 rounded text-[11px] font-mono">BIOMETRIC_ENDPOINT</code> environment variable to enable device connectivity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
          {[
            { icon: Wifi, title: t("deviceSync"), desc: t("deviceSyncDesc") },
            { icon: Users, title: t("employeeMapping"), desc: t("employeeMappingDesc") },
            { icon: Clock, title: t("realtimeAttendance"), desc: t("realtimeDesc") },
          ].map((f) => (
            <div key={f.title} className="p-4 rounded-xl bg-white/30 border border-white/40">
              <f.icon className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-[12px] font-bold text-on-surface">{f.title}</p>
              <p className="text-[10px] text-on-surface-variant/50 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
