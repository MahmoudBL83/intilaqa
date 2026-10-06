"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Users, Building2, CreditCard, UserCheck, AlertTriangle, TrendingUp, DollarSign,
  FileWarning, FileText, FileCheck, Users2, BarChart3, Palette, Globe,
  Download, Plus, Clock, ShieldAlert, Wifi,
} from "lucide-react";
import { DataTable, StatusBadge, PageHeader, KPICard } from "@intilaqa/ui";

type DashboardStats = {
  totalClients: number;
  totalCompanies: number;
  totalEmployees: number;
  saudiEmployees: number;
  expatEmployees: number;
  activeCompanies: number;
  suspended: number;
  activeSubscriptions: number;
  monthlyPayroll: number;
  pendingActions: number;
};

type RecentClient = {
  id: string;
  name: string;
  domain: string | null;
  isActive: boolean;
  companies: { id: string; name: string }[];
  subscriptions: { plan: { name: string } | null }[];
};

type NitaqatDistributionItem = { color: string; count: number };
type ContractAlert = { id: string; endDate: string; status: string; client: { name: string }; daysRemaining: number };
type PayrollRun = { id: string; month: number; year: number; companyName: string; baseSalary: number; deductions: number; netPay: number; status: string };
type SubscriptionPlan = { id: string; name: string; price: number; _count: { subscriptions: number } };
type DocumentAlert = { id: string; name: string; type: string; expiryDate: Date | null; status: string };

export function AdminDashboardContent({
  stats, recentClients, subscriptionPlans, totalSubscriptions,
  expiringDocuments, nitaqatDistribution, contractAlerts, payrollRuns,
}: {
  stats: DashboardStats;
  recentClients: RecentClient[];
  subscriptionPlans: SubscriptionPlan[];
  totalSubscriptions: number;
  expiringDocuments: DocumentAlert[];
  nitaqatDistribution: NitaqatDistributionItem[];
  contractAlerts: ContractAlert[];
  payrollRuns: PayrollRun[];
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(n);

  const saudizationRate = stats.totalEmployees > 0 ? Math.round((stats.saudiEmployees / stats.totalEmployees) * 100) : 0;
  const activeRate = stats.totalCompanies > 0 ? Math.round((stats.activeCompanies / stats.totalCompanies) * 100) : 0;

  const kpiCards = [
    { title: t("totalClients"), value: stats.totalClients, icon: <Users className="w-6 h-6" />, color: "blue" as const, trend: "up" as const, change: 12 },
    { title: t("totalCompanies"), value: stats.totalCompanies, icon: <Building2 className="w-6 h-6" />, color: "green" as const, trend: "up" as const, change: activeRate },
    { title: t("suspended"), value: stats.suspended, icon: <AlertTriangle className="w-6 h-6" />, color: stats.suspended > 0 ? "yellow" as const : "emerald" as const },
    { title: t("totalEmployees"), value: stats.totalEmployees, icon: <UserCheck className="w-6 h-6" />, color: "emerald" as const, trend: "up" as const, change: saudizationRate },
    { title: t("activeSubscriptions"), value: stats.activeSubscriptions, icon: <CreditCard className="w-6 h-6" />, color: "purple" as const, trend: "up" as const, change: 85 },
    { title: t("saudiEmployees"), value: `${stats.saudiEmployees}`, icon: <Users2 className="w-6 h-6" />, color: "yellow" as const, trend: "neutral" as const, change: saudizationRate },
    { title: t("expatEmployees"), value: stats.expatEmployees, icon: <Globe className="w-6 h-6" />, color: "blue" as const },
    { title: t("monthlyPayroll"), value: formatCurrency(stats.monthlyPayroll), icon: <DollarSign className="w-6 h-6" />, color: "purple" as const },
    { title: t("pendingActions"), value: stats.pendingActions, icon: <Clock className="w-6 h-6" />, color: stats.pendingActions > 0 ? "red" as const : "emerald" as const },
  ];

  const clientColumns = [
    {
      key: "client", header: t("clients"),
      render: (item: RecentClient) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px] shrink-0">{item.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="font-bold text-on-surface text-[14px]">{item.name}</div>
            <div className="text-on-surface-variant/50 text-[12px]">{item.domain || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "plan", header: t("plan"),
      render: (item: RecentClient) => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{item.subscriptions[0]?.plan?.name || "—"}</span>
      ),
    },
    {
      key: "companies", header: t("companies"),
      render: (item: RecentClient) => <span className="text-on-surface-variant/70 text-[13px] font-medium">{item.companies.length}</span>,
    },
    {
      key: "status", header: t("status"),
      render: (item: RecentClient) => <StatusBadge status={item.isActive ? "active" : "inactive"} />,
    },
  ];

  const payrollColumns = [
    { key: "company", header: t("companyName"), render: (item: PayrollRun) => <span className="font-bold text-[14px] text-on-surface">{item.companyName}</span> },
    { key: "month", header: t("payrollMonth"), render: (item: PayrollRun) => <span className="text-[13px]">{item.month}/{item.year}</span> },
    { key: "gross", header: t("grossSalary"), render: (item: PayrollRun) => <span className="text-[13px]">{formatCurrency(item.baseSalary)}</span> },
    { key: "deductions", header: t("deductions"), render: (item: PayrollRun) => <span className="text-[13px] text-red-600">-{formatCurrency(item.deductions)}</span> },
    { key: "net", header: t("netSalary"), render: (item: PayrollRun) => <span className="text-[13px] text-primary font-bold">{formatCurrency(item.netPay)}</span> },
    { key: "status", header: t("status"), render: (item: PayrollRun) => <StatusBadge status={item.status} /> },
  ];

  const contractAlertColumns = [
    { key: "client", header: t("clientName"), render: (item: ContractAlert) => <span className="font-bold text-[14px] text-on-surface">{item.client.name}</span> },
    { key: "endDate", header: t("endDate"), render: (item: ContractAlert) => <span className="text-[13px]">{new Date(item.endDate).toLocaleDateString()}</span> },
    {
      key: "remaining", header: t("daysRemaining"),
      render: (item: ContractAlert) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.daysRemaining < 15 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
          {item.daysRemaining} {t("daysBadge")}
        </span>
      ),
    },
    { key: "status", header: t("status"), render: (item: ContractAlert) => <StatusBadge status={item.status} /> },
  ];

  const nitaqatColors: Record<string, string> = {
    PLATINUM: "bg-slate-300", GREEN_HIGH: "bg-green-500", GREEN_MID: "bg-green-400",
    GREEN_LOW: "bg-green-300", YELLOW: "bg-yellow-400", RED: "bg-red-500",
  };

  return (
    <div>
      <PageHeader
        title={t("systemOverview")}
        subtitle={t("welcomeBack")}
        breadcrumbs={[{ label: t("overview"), href: `/${locale}/admin` }, { label: t("systemOverview") }]}
        actions={
          <>
            <button className="px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/60 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t("exportData")}
            </button>
            <Link href={`/${locale}/admin/clients/new`} className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t("newClient")}
            </Link>
          </>
        }
      />

      {/* Unified KPI Cards — single design, no duplication */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.slice(0, 4).map((card, i) => (
          <KPICard key={`kpi-${i}`} title={card.title} value={card.value} icon={card.icon} color={card.color} trend={card.trend} change={card.change} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.slice(4, 8).map((card, i) => (
          <KPICard key={`kpi2-${i}`} title={card.title} value={card.value} icon={card.icon} color={card.color} trend={card.trend} change={card.change} />
        ))}
      </div>

      {/* Clients + Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 floating-glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">{t("recentClientsCompanies")}</h2>
              <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("managePartnerNetwork")}</p>
            </div>
            <Link href={`/${locale}/admin/clients`} className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
              {t("viewAllRecords")} →
            </Link>
          </div>
          <DataTable columns={clientColumns} data={recentClients} emptyTitle={t("noData")} emptyDescription={t("noResults")} />
        </div>

        <div className="floating-glass rounded-[2rem] p-6">
          <h2 className="text-[18px] font-bold text-on-surface mb-5">{t("subscriptions")}</h2>
          <div className="space-y-4">
            {subscriptionPlans.map((plan) => {
              const pct = totalSubscriptions > 0 ? Math.round((plan._count.subscriptions / totalSubscriptions) * 100) : 0;
              return (
                <div key={plan.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[13px] font-bold text-on-surface">{plan.name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-on-surface">{pct}%</span>
                  </div>
                  <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">{t("revenueSummary")}</span>
              <span className="text-[18px] font-bold text-primary">{formatCurrency(subscriptionPlans.reduce((s, p) => s + p.price * p._count.subscriptions, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll + Nitaqat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 floating-glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">{t("payrollOperations")}</h2>
              <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("latestPayrollRuns")}</p>
            </div>
            <Link href={`/${locale}/admin/payroll`} className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
              {t("viewAllRecords")} →
            </Link>
          </div>
          <DataTable columns={payrollColumns} data={payrollRuns} emptyTitle={t("noData")} emptyDescription={t("noResults")} />
        </div>

        <div className="floating-glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">{t("nitaqatDistribution")}</h2>
            </div>
            <Link href={`/${locale}/admin/saudization`} className="text-primary text-[11px] font-bold hover:underline">
              {t("viewAllRecords")}
            </Link>
          </div>
          {nitaqatDistribution.length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-on-surface-variant/50 text-[13px]">{t("noData")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nitaqatDistribution.map((tier) => {
                const total = nitaqatDistribution.reduce((sum, t) => sum + t.count, 0);
                const pct = total > 0 ? Math.round((tier.count / total) * 100) : 0;
                const tierColor = nitaqatColors[tier.color] || "bg-primary";
                return (
                  <div key={tier.color}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${tierColor}`} />
                        <span className="text-[13px] font-bold text-on-surface">{tier.color.replace(/_/g, " ")}</span>
                      </div>
                      <span className="text-[13px] font-bold text-on-surface">{pct}% ({tier.count})</span>
                    </div>
                    <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                      <div className={`h-full ${tierColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contract Alerts */}
      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{t("contractAlerts")}</h2>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("upcomingRenewals")}</p>
          </div>
          <Link href={`/${locale}/admin/subscriptions`} className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
            {t("viewAllRecords")} →
          </Link>
        </div>
        <DataTable columns={contractAlertColumns} data={contractAlerts} emptyTitle={t("noData")} emptyDescription={t("noResults")} />
      </div>

      {/* Compliance + Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 floating-glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">{t("complianceAlerts")}</h2>
              <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("trackExpiring")}</p>
            </div>
            <div className="flex items-center gap-2">
              {expiringDocuments.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                  {expiringDocuments.length} {t("actionsRequired")}
                </span>
              )}
              <Link href={`/${locale}/admin/compliance`} className="text-primary text-[13px] font-bold hover:underline">{t("viewAllRecords")}</Link>
            </div>
          </div>
          {expiringDocuments.length === 0 ? (
            <div className="py-8 text-center">
              <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-on-surface-variant/50 text-[14px] font-medium">{t("noData")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/30 border border-white/40 hover:bg-white/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface text-[14px] truncate">{doc.name}</h4>
                    <p className="text-on-surface-variant/50 text-[12px]">{doc.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-red-600 text-[13px] font-bold">{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "—"}</div>
                    <div className="text-on-surface-variant/40 text-[11px]">{t("expiringSoon")}</div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-bold uppercase hover:bg-primary hover:text-white transition-all shrink-0">
                    {t("update")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Shortcuts */}
        <div className="floating-glass rounded-[2rem] p-6">
          <h2 className="text-[18px] font-bold text-on-surface mb-5">{t("quickShortcuts")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("usersPermissions"), icon: Users2, href: `/${locale}/admin/users` },
              { label: t("reportCenter"), icon: BarChart3, href: `/${locale}/admin/reports` },
              { label: t("saudization"), icon: Globe, href: `/${locale}/admin/saudization` },
              { label: t("brandSettings"), icon: Palette, href: `/${locale}/admin/settings` },
            ].map((s) => (
              <Link key={s.label} href={s.href} className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] bg-white/30 border border-white/40 hover:bg-white/50 transition-all text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-bold text-on-surface leading-tight">{s.label}</span>
              </Link>
            ))}
          </div>
          <Link href={`/${locale}/admin`} className="mt-4 w-full py-3 rounded-2xl border border-outline-variant/60 bg-white/30 text-on-surface text-[13px] font-bold hover:bg-white/50 transition-all flex items-center justify-center gap-2">
            {t("customizeDashboard")}
          </Link>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-6 floating-glass rounded-[2rem] p-6">
        <h2 className="text-[18px] font-bold text-on-surface mb-4">{t("integrationStatus")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "Qiwa", configured: false },
            { name: "Mudad", configured: false },
            { name: "GOSI", configured: false },
            { name: "SMS", configured: false },
            { name: "Payment", configured: false },
            { name: "Biometric", configured: false },
          ].map((int) => (
            <div key={int.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/30 border border-white/40">
              <div className={`w-2.5 h-2.5 rounded-full ${int.configured ? "bg-emerald-500" : "bg-gray-300"}`} />
              <div>
                <p className="text-[13px] font-bold text-on-surface">{int.name}</p>
                <p className="text-[10px] text-on-surface-variant/50">{int.configured ? t("connected") : t("notConfigured")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
