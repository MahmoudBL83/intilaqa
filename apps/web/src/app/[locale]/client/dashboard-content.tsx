"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Building2, Users, CreditCard, Activity, Calendar, CalendarClock, Building } from "lucide-react";
import { StatCard, DataTable, StatusBadge, PageHeader } from "@intilaqa/ui";

type CompanyRow = {
  id: string;
  name: string;
  employeeCount: number;
  isActive: boolean;
};

type SubscriptionInfo = {
  planName: string;
  startDate: Date;
  endDate: Date;
  status: string;
} | null;

type Stats = {
  companyCount: number;
  employeeCount: number;
  activeSubscriptions: number;
};

export function ClientDashboardContent({
  stats,
  companies,
  subscription,
  totalEmployees,
}: {
  stats: Stats;
  companies: CompanyRow[];
  subscription: SubscriptionInfo;
  totalEmployees: number;
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });

  const usagePercent =
    stats.companyCount > 0 ? Math.min(100, Math.round((totalEmployees / (stats.companyCount * 200)) * 100)) : 0;

  return (
    <div>
      <PageHeader
        title={t("client")}
        breadcrumbs={[
          { label: t("overview"), href: `/${locale}/client` },
          { label: t("client") },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("totalCompanies")}
          value={stats.companyCount}
          icon={Building2}
          variant="primary"
        />
        <StatCard
          title={t("totalEmployees")}
          value={totalEmployees}
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title={t("activeSubscriptions")}
          value={stats.activeSubscriptions}
          icon={CreditCard}
          variant="neutral"
        />
        <StatCard
          title={t("usage")}
          value={`${usagePercent}%`}
          icon={Activity}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href={`/${locale}/client/users`}>
          <div className="floating-glass rounded-[2rem] p-6 hover:bg-white/25 transition-colors cursor-pointer h-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-on-surface mb-1">{t("manageUsers")}</h3>
                <p className="text-on-surface-variant/50 text-[13px]">{t("createAndManageTeamMembers")}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
        <Link href={`/${locale}/client/companies`}>
          <div className="floating-glass rounded-[2rem] p-6 hover:bg-white/25 transition-colors cursor-pointer h-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-on-surface mb-1">{t("totalCompanies")}</h3>
                <p className="text-on-surface-variant/50 text-[13px]">{t("managePartnerNetwork")}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
        <Link href={`/${locale}/client/employees`}>
          <div className="floating-glass rounded-[2rem] p-6 hover:bg-white/25 transition-colors cursor-pointer h-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-on-surface mb-1">{t("totalEmployees")}</h3>
                <p className="text-on-surface-variant/50 text-[13px]">{t("managePartnerNetwork")}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="floating-glass rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold text-on-surface">{t("yourCompanies")}</h2>
                <p className="text-on-surface-variant/50 text-[13px] mt-0.5">
                  {t("managePartnerNetwork")}
                </p>
              </div>
            </div>
            <DataTable
              columns={[
                {
                  key: "name",
                  header: t("companies"),
                  render: (item: CompanyRow) => (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px] border border-white/30 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-on-surface text-[14px]">{item.name}</span>
                    </div>
                  ),
                },
                {
                  key: "employees",
                  header: t("employees"),
                  render: (item: CompanyRow) => (
                    <span className="text-on-surface-variant/70 text-[13px] font-medium">
                      {item.employeeCount}
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: t("status"),
                  render: (item: CompanyRow) => (
                    <StatusBadge status={item.isActive ? "active" : "inactive"} />
                  ),
                },
              ]}
              data={companies}
              emptyTitle={t("noData")}
              emptyDescription={t("noResults")}
            />
          </div>
        </div>

        <div>
          <div className="floating-glass rounded-[2rem] p-6">
            <h2 className="text-[18px] font-bold text-on-surface mb-5">{t("subscriptionPlan")}</h2>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60 text-[13px]">{t("plan")}</span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest border border-primary/10">
                    {subscription.planName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{t("startDate")}</p>
                    <p className="text-on-surface text-[13px] font-bold">{formatDate(subscription.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{t("endDate")}</p>
                    <p className="text-on-surface text-[13px] font-bold">{formatDate(subscription.endDate)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{t("status")}</span>
                    <StatusBadge status={subscription.status} />
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{t("usage")}</span>
                    <span className="text-on-surface text-[12px] font-bold">{usagePercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} />
                  </div>
                  <p className="text-on-surface-variant/40 text-[10px] mt-1">{t("employeesAcrossCompanies", { employees: totalEmployees, companies: stats.companyCount })}</p>
                </div>
                {subscription && (
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{t("daysRemaining")}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000*60*60*24)) < 30
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} {t("daysBadge")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  <CreditCard className="w-7 h-7" />
                </div>
                <p className="text-on-surface-variant/50 text-[14px] font-medium">{t("noData")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
