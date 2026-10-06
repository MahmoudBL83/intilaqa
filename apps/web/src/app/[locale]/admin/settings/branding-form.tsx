"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SettingsCard } from "@intilaqa/ui";

type AppSettings = {
  id: string;
  appArabicName: string;
  appEnglishName: string;
  logoUrl: string | null;
  primaryColor: string;
  defaultLanguage: string;
};

export function BrandingForm({ settings }: { settings: AppSettings }) {
  const t = useTranslations("settings");

  const [appArabicName, setAppArabicName] = useState(settings.appArabicName);
  const [appEnglishName, setAppEnglishName] = useState(settings.appEnglishName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(false);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appArabicName,
          appEnglishName,
          primaryColor,
          logoUrl: logoUrl || null,
          defaultLanguage,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setMessage(t("savedSuccess"));
    } catch {
      setError(true);
      setMessage(t("savedError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="space-y-6">
        <SettingsCard title={t("branding")} description={t("brandingDescription")}>
          <div className="space-y-5">
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("appNameAr")}
              </label>
              <input
                value={appArabicName}
                onChange={(e) => setAppArabicName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("appNameEn")}
              </label>
              <input
                value={appEnglishName}
                onChange={(e) => setAppEnglishName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                  {t("primaryColor")}
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full rounded-xl border border-outline-variant/60 cursor-pointer opacity-0"
                    />
                    <div
                      className="w-12 h-12 rounded-xl border border-white/60"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                  {t("defaultLanguage")}
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("logo")}
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title={t("preview")}>
          <div className="space-y-5">
            <div className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white/30 border border-white/40">
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/40 shrink-0 bg-white/60 flex items-center justify-center">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div>
                  <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">
                    {t("appNameAr")}
                  </p>
                  <h3 className="text-on-surface text-[18px] font-bold" dir="rtl">
                    {appArabicName}
                  </h3>
                </div>
              </div>
              <div>
                <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">
                  {t("appNameEn")}
                </p>
                <h3 className="text-on-surface text-[18px] font-bold">{appEnglishName}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">
                    {t("primaryColor")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-8 h-8 rounded-lg border border-white/40"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-on-surface text-[13px] font-mono font-bold">
                      {primaryColor}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">
                    {t("defaultLanguage")}
                  </p>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest border border-primary/10">
                    {defaultLanguage === "ar" ? "العربية" : "English"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {message && (
          <div
            className={`p-4 rounded-2xl text-[14px] font-bold border ${
              error
                ? "bg-error/10 text-error border-error/20"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t("saving") : t("saveSettings")}
        </button>
      </div>
    </form>
  );
}
