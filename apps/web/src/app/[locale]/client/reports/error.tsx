"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="w-20 h-20 rounded-[2rem] bg-error/10 flex items-center justify-center text-error mb-6 border border-error/10">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-headline-lg-mobile font-bold text-on-surface mb-2">{t("errorTitle")}</h2>
      <p className="text-on-surface-variant/60 text-body-md text-center max-w-sm mb-6">
        {error.message || t("errorDescription")}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        {t("tryAgain")}
      </button>
    </div>
  );
}
