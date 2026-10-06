import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, StatCard } from "@intilaqa/ui";
import { Settings, Bell, Globe, Shield, Building2 } from "lucide-react";
import { APP_SETTINGS_DEFAULTS } from "@intilaqa/config";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const client = await prisma.client.findFirst({ where: { userId } });
  if (!client) redirect(`/${locale}/login`);

  const t = await getTranslations("settings");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const [companyCount, employeeCount, settings] = await Promise.all([
    prisma.company.count({ where: { clientId: client.id } }),
    prisma.employee.count({ where: { company: { clientId: client.id } } }),
    prisma.appSettings.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  const appName = locale === "ar"
    ? (settings?.appArabicName || APP_SETTINGS_DEFAULTS.appArabicName)
    : (settings?.appEnglishName || APP_SETTINGS_DEFAULTS.appEnglishName);
  const defaultLang = settings?.defaultLanguage || APP_SETTINGS_DEFAULTS.defaultLanguage;
  const currency = settings?.currency || "SAR";
  const timezone = settings?.timezone || "Asia/Riyadh";
  const dateFormat = settings?.dateFormat || "dd/MM/yyyy";

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/client` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title={td("totalCompanies")} value={companyCount} icon={Building2} variant="primary" />
        <StatCard title={td("totalEmployees")} value={employeeCount} icon={Globe} variant="secondary" />
        <StatCard title={t("title")} value="" icon={Settings} variant="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="floating-glass rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">{t("general")}</h3>
              <p className="text-on-surface-variant/50 text-[13px]">{t("generalDescription")}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-1">{t("systemName")}</label>
              <p className="text-on-surface text-[14px] font-bold">{appName}</p>
            </div>
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-1">{t("defaultLanguage")}</label>
              <p className="text-on-surface text-[14px] font-bold">{defaultLang === "ar" ? "العربية" : "English"}</p>
            </div>
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-1">{tc("currency")}</label>
              <p className="text-on-surface text-[14px] font-bold">{currency}</p>
            </div>
          </div>
        </div>

        <div className="floating-glass rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">{t("notifications")}</h3>
              <p className="text-on-surface-variant/50 text-[13px]">{t("notifications")}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "timezone", value: timezone },
              { key: "dateFormat", value: dateFormat },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-on-surface text-[14px] font-medium">{t(item.key as any)}</span>
                <span className="text-on-surface-variant/70 text-[13px] font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="floating-glass rounded-[2rem] p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">{t("security")}</h3>
              <p className="text-on-surface-variant/50 text-[13px]">{t("security")}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface text-[14px] font-bold">{t("general")}</p>
                <p className="text-on-surface-variant/50 text-[12px]">{tc("save")}</p>
              </div>
              <button className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                {t("saveSettings")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
