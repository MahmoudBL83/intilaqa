"use client";

import { useTranslations } from "next-intl";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="floating-glass rounded-[2rem] p-12 text-center">
      <h2 className="text-[20px] font-bold text-on-surface mb-2">{t("errorTitle")}</h2>
      <p className="text-on-surface-variant/50 text-[14px] mb-4">{error.message}</p>
      <button onClick={reset} className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:bg-primary/90">
        {t("tryAgain")}
      </button>
    </div>
  );
}
