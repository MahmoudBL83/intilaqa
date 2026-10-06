"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { APP_SETTINGS_DEFAULTS } from "@intilaqa/config";

type Settings = {
  appArabicName: string;
  appEnglishName: string;
  logoUrl: string | null;
  primaryColor: string;
};

export function AppBrand({ collapsed }: { collapsed?: boolean }) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const name = isArabic
    ? settings?.appArabicName ?? APP_SETTINGS_DEFAULTS.appArabicName
    : settings?.appEnglishName ?? APP_SETTINGS_DEFAULTS.appEnglishName;

  const logoUrl = settings?.logoUrl ?? null;

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-white/40 shrink-0 overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="w-8 h-8 object-contain" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-bold text-[18px] text-on-surface tracking-[-0.02em] leading-tight">
            {name}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
            {isArabic ? "مساحة العمل" : "Workspace"}
          </span>
        </div>
      )}
    </div>
  );
}
