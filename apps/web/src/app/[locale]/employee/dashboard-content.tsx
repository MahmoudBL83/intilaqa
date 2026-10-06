"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, CalendarCheck, FileText, DollarSign, ClipboardList, UserCog } from "lucide-react";
import Link from "next/link";
import {
  StatCard,
  DataTable,
  StatusBadge,
  PageHeader,
  KPICard,
  SimpleBarChart,
  ProgressRing,
  LoadingCard,
  FormSection,
} from "@intilaqa/ui";

type TaskRow = {
  id: string;
  title: string;
  dueDate: Date | null;
  status: string;
};

type Stats = {
  attendanceToday: string;
  pendingRequests: number;
  myTasks: number;
  lastPayslip: string;
};

type QuickAction = {
  label: string;
  icon: typeof Clock;
  color: string;
  href: string;
};

type Props = {
  stats: Stats;
  tasks: TaskRow[];
  locale: string;
};

interface EmployeeDashboardStats {
  totalAttendance: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  totalLoans: number;
  activeLoanAmount: number;
  completedLoans: number;
  documents: number;
  expiringDocuments: number;
  upToDateDocuments: number;
}

export function EmployeeDashboardContent({ stats, tasks, locale }: Props) {
  const t = useTranslations("dashboard");
  const commonT = useTranslations("common");
  const [dashboardStats, setDashboardStats] = useState<EmployeeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: Date | null) =>
    date ? new Date(date).toLocaleDateString() : "—";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/v1/dashboard/stats?dashboard=employee");
        if (response.ok) {
          const result = await response.json();
          setDashboardStats(result.stats);
        }
      } catch (error) {
        console.error("Failed to fetch employee dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions: QuickAction[] = [
    { label: t("checkIn"), icon: Clock, color: "bg-primary/10 text-primary", href: `/${locale}/employee/attendance` },
    { label: t("requestLeave"), icon: CalendarCheck, color: "bg-secondary/10 text-secondary", href: `/${locale}/employee/requests` },
    { label: t("viewPayslip"), icon: DollarSign, color: "bg-on-surface-variant/10 text-on-surface-variant", href: `/${locale}/employee/payslips` },
    { label: t("updateInfo"), icon: UserCog, color: "bg-primary/10 text-primary", href: `/${locale}/employee/profile` },
  ];

  return (
    <div>
      <PageHeader
        title={t("employee")}
        breadcrumbs={[
          { label: t("overview"), href: `/${locale}/employee` },
          { label: t("employee") },
        ]}
      />

      {/* Enhanced KPI Cards */}
      {dashboardStats && !loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title={t("attendanceRate") }
            value={dashboardStats.attendancePercentage}
            suffix="%"
            color="emerald"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <KPICard
            title={t("totalLoans") }
            value={dashboardStats.totalLoans}
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <KPICard
            title={t("documents") }
            value={dashboardStats.documents}
            color="yellow"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          <KPICard
            title={t("loanAmount") }
            value={dashboardStats.activeLoanAmount.toLocaleString()}
            suffix={commonT("currency")}
            color="purple"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      )}

      {/* Traditional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("attendanceToday")}
          value={stats.attendanceToday}
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title={t("pendingRequests")}
          value={stats.pendingRequests}
          icon={CalendarCheck}
          variant={stats.pendingRequests > 0 ? "error" : "secondary"}
        />
        <StatCard
          title={t("myTasks")}
          value={stats.myTasks}
          icon={ClipboardList}
          variant="neutral"
        />
        <StatCard
          title={t("lastPayslip")}
          value={stats.lastPayslip}
          icon={DollarSign}
          variant="primary"
        />
      </div>

      <div className="floating-glass rounded-[2.5rem] p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-on-surface">{t("quickActions")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex flex-col items-center gap-3 p-6 rounded-[1.5rem] bg-white/30 border border-white/40 hover:bg-white/50 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-bold text-on-surface">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Attendance Breakdown */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <FormSection title={t("attendanceBreakdown") }>
            <SimpleBarChart
              labels={[
                t("present") ,
                t("absent") ,
                t("late") ,
              ]}
              data={[dashboardStats.presentDays, dashboardStats.absentDays, dashboardStats.lateDays]}
              color="bg-emerald-600"
            />
          </FormSection>

          <FormSection title={t("attendanceProgress") }>
            <div className="flex justify-center">
              <ProgressRing
                percentage={dashboardStats.attendancePercentage}
                label={`${t("rate") }`}
                color="#10b981"
              />
            </div>
          </FormSection>

          <FormSection title={t("documentStatus") }>
            <SimpleBarChart
              labels={[
                t("upToDate") ,
                t("expiring") ,
              ]}
              data={[dashboardStats.upToDateDocuments, dashboardStats.expiringDocuments]}
              color="bg-blue-600"
            />
          </FormSection>
        </div>
      )}

      <div className="floating-glass rounded-[2rem] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{t("myTasks")}</h2>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">
              {t("tasks")}
            </p>
          </div>
        </div>
        <DataTable
          columns={[
            {
              key: "title",
              header: t("task"),
              render: (item: TaskRow) => (
                <span className="font-bold text-on-surface text-[14px]">{item.title}</span>
              ),
            },
            {
              key: "dueDate",
              header: t("dueDate"),
              render: (item: TaskRow) => (
                <span className="text-on-surface-variant/70 text-[13px]">{formatDate(item.dueDate)}</span>
              ),
            },
            {
              key: "status",
              header: t("status"),
              render: (item: TaskRow) => <StatusBadge status={item.status} />,
            },
          ]}
          data={tasks}
          emptyTitle={t("noData")}
          emptyDescription={t("noResults")}
        />
      </div>
    </div>
  );
}
