"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogIn, Mail, Lock, AlertCircle, UserCog, Users, Building2, UserCheck } from "lucide-react";
import { APP_SETTINGS_DEFAULTS } from "@intilaqa/config";

const DEV_ACCOUNTS = [
  { role: "admin", email: "admin@intilaqa.com", password: "admin123", name: "Super Admin", nameAr: "مدير النظام", icon: UserCog, color: "bg-primary/10 text-primary" },
  { role: "client", email: "client@intilaqa.com", password: "admin123", name: "Client", nameAr: "العميل", icon: Users, color: "bg-secondary/10 text-secondary" },
  { role: "company_admin", email: "company@intilaqa.com", password: "admin123", name: "Company Admin", nameAr: "مدير الشركة", icon: Building2, color: "bg-on-surface-variant/10 text-on-surface-variant" },
  { role: "employee", email: "employee@intilaqa.com", password: "admin123", name: "Employee", nameAr: "الموظف", icon: UserCheck, color: "bg-primary/10 text-primary" },
] as const;

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isArabic = locale === "ar";
  const appName = isArabic ? APP_SETTINGS_DEFAULTS.appArabicName : APP_SETTINGS_DEFAULTS.appEnglishName;

  async function doSignIn(e: string, p: string) {
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email: e, password: p, redirect: false });
    if (result?.error) {
      setError(t("invalidCredentials"));
      setLoading(false);
    } else {
      router.push(`/${locale}`);
      router.refresh();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doSignIn(email, password);
  }

  function handleQuickLogin(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    doSignIn(e, p);
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-1">{appName}</h1>
          <p className="text-on-surface-variant/60 text-body-md">{t("loginSubtitle")}</p>
        </div>

        <div className="floating-glass rounded-[2.5rem] p-8 mb-6">
          <h2 className="text-[20px] font-bold text-on-surface mb-2">{t("loginTitle")}</h2>
          <p className="text-on-surface-variant/60 text-body-sm mb-6">{t("welcomeBack")}</p>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-error/10 text-error rounded-2xl mb-6 border border-error/10">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-[14px] font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-2">{t("email")}</label>
              <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-12 px-4">
                <Mail className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/30 outline-none px-2"
                  placeholder="admin@intilaqa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-2">{t("password")}</label>
              <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-12 px-4">
                <Lock className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/30 outline-none px-2"
                  placeholder="********"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? t("signingIn") : t("login")}
            </button>
          </form>
        </div>

        {/* Dev Quick Login */}
        <div className="floating-glass rounded-[2.5rem] p-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="px-2 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest border border-error/10">
              DEV
            </span>
            <h3 className="text-[16px] font-bold text-on-surface">
              {t("demoSectionTitle")}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEV_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  disabled={loading}
                  onClick={() => handleQuickLogin(acc.email, acc.password)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/30 border border-white/40 hover:bg-white/50 hover:scale-[1.01] transition-all disabled:opacity-40 text-start group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${acc.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-on-surface text-[13px] truncate">
                      {isArabic ? acc.nameAr : acc.name}
                    </div>
                    <div className="text-on-surface-variant/50 text-[11px] truncate">{acc.email}</div>
                  </div>
                  <LogIn className="w-4 h-4 text-on-surface-variant/30 shrink-0 group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
