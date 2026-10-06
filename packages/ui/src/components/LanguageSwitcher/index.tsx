"use client";

import { useLocale } from "next-intl";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();

  function toggleLanguage() {
    const newLocale = locale === "ar" ? "en" : "ar";
    const rest = window.location.pathname.replace(/^\/(ar|en)/, "");
    window.location.href = `/${newLocale}${rest}${window.location.search}`;
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-white/30 transition-all text-[13px] font-bold"
    >
      <Languages className="w-5 h-5" />
      <span>{locale === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
