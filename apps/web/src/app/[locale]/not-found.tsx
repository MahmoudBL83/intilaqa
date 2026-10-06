import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";

export default async function LocaleNotFound() {
  const heads = await headers();
  const locale = heads.get("x-next-intl-locale") || "ar";
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center text-primary/30 mb-6 border border-white/20">
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-[42px] font-bold text-on-surface mb-2">404</h1>
      <h2 className="text-headline-lg-mobile font-bold text-on-surface mb-2">
        {t("notFoundTitle") || "Page not found"}
      </h2>
      <p className="text-on-surface-variant/60 text-body-md text-center max-w-sm mb-8">
        {t("notFoundDescription") || "The page you are looking for does not exist or has been moved."}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-flex px-6 py-3 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        {t("backToHome") || "Back to Home"}
      </Link>
    </div>
  );
}
