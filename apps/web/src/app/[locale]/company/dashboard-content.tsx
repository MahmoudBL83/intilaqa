"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Users, CalendarCheck, Clock, FileText, UserCheck, UserX, AlertTriangle,
  Shield, Building2, CreditCard, FileWarning, Plus, UserPlus, CheckCircle, XCircle,
} from "lucide-react";
import { DataTable, StatusBadge, PageHeader, KPICard, LoadingCard, SimpleBarChart } from "@intilaqa/ui";
import type { CompanyOperations } from "../../../server/services/operations-service";

type EmployeeRow = { id: string; name: string; department: string; status: string };
type PendingRequest = { id: string; type: string; title: string; employeeName: string; status: string; createdAt: Date };
type Stats = { totalEmployees: number; presentToday: number; pendingRequests: number; onLeave: number };

export function CompanyDashboardContent({
  stats, attendanceToday, pendingRequests, operations, payrollRun,
}: {
  stats: Stats;
  attendanceToday: EmployeeRow[];
  pendingRequests: PendingRequest[];
  operations: CompanyOperations;
  payrollRun: { totalGross: number; totalDeductions: number; totalNet: number; payrollMonth: string; status: string } | null;
}) {
  const t = useTranslations("dashboard");
  const tr = useTranslations("roles");
  const locale = useLocale();

  const attendanceRate = stats.totalEmployees > 0
    ? Math.round((operations.attendance.checkedIn / stats.totalEmployees) * 100)
    : 0;

  const kpiCards = [
    { title: t("totalEmployees"), value: stats.totalEmployees, icon: <Users className="w-6 h-6" />, color: "blue" as const },
    { title: t("presentToday"), value: operations.attendance.checkedIn, icon: <UserCheck className="w-6 h-6" />, color: "emerald" as const },
    { title: t("pendingRequests"), value: stats.pendingRequests, icon: <Clock className="w-6 h-6" />, color: stats.pendingRequests > 0 ? "yellow" as const : "emerald" as const },
    { title: t("attendanceRate"), value: `${attendanceRate}%`, icon: <CalendarCheck className="w-6 h-6" />, color: attendanceRate >= 80 ? "emerald" as const : "yellow" as const },
  ];

  return (
    <div>
      <PageHeader
        title={t("company")}
        breadcrumbs={[{ label: t("overview"), href: `/${locale}/company` }, { label: t("company") }]}
        actions={
          <Link
            href={`/${locale}/company/users`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {t("manageUsers")}
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, i) => <KPICard key={i} {...card} />)}
      </div>

      {payrollRun && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title={`${t("grossSalary")} (${payrollRun.payrollMonth})`} value={`${payrollRun.totalGross.toLocaleString()} SAR`} icon={<Building2 className="w-6 h-6" />} color="blue" />
          <KPICard title={t("deductions")} value={`${payrollRun.totalDeductions.toLocaleString()} SAR`} icon={<AlertTriangle className="w-6 h-6" />} color="yellow" />
          <KPICard title={t("netSalary")} value={`${payrollRun.totalNet.toLocaleString()} SAR`} icon={<CreditCard className="w-6 h-6" />} color="emerald" />
          <KPICard title={t("payrollStatus")} value={payrollRun.status} icon={<FileText className="w-6 h-6" />} color={payrollRun.status === "paid" ? "emerald" : "blue"} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <AttendanceCard label={t("checkedIn")} value={operations.attendance.checkedIn} total={stats.totalEmployees} color="bg-emerald-500" icon={<UserCheck className="w-5 h-5" />} />
        <AttendanceCard label={t("late")} value={operations.attendance.late} total={stats.totalEmployees} color="bg-yellow-500" icon={<Clock className="w-5 h-5" />} />
        <AttendanceCard label={t("absent")} value={operations.attendance.absent} total={stats.totalEmployees} color="bg-red-500" icon={<UserX className="w-5 h-5" />} />
        <AttendanceCard label={t("onLeave")} value={operations.attendance.onLeave} total={stats.totalEmployees} color="bg-blue-500" icon={<CalendarCheck className="w-5 h-5" />} />
      </div>

      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <h3 className="text-[16px] font-bold text-on-surface mb-4">{t("todaysAttendance")}</h3>
        <SimpleBarChart
          labels={[t("checkedIn"), t("late"), t("absent"), t("onLeave")]}
          data={[operations.attendance.checkedIn, operations.attendance.late, operations.attendance.absent, operations.attendance.onLeave]}
          color="bg-primary"
        />
      </div>

      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{t("expiredDocuments")}</h2>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("expiredDocsDesc")}</p>
          </div>
          <Link href={`/${locale}/company/compliance`} className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
            {t("viewAllRecords")} →
          </Link>
        </div>
        {operations.documents.byType.length === 0 ? (
          <div className="py-8 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-on-surface-variant/50 text-[13px]">{t("noComplianceDocs")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operations.documents.byType.map((doc) => (
              <div key={doc.type} className="p-4 rounded-xl bg-white/30 border border-white/40 hover:bg-white/50 transition-all">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mb-1">
                  {t(`docType_${doc.type}`) || doc.type}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-on-surface-variant/50">{t("totalCount")}</span>
                    <span className="font-bold text-on-surface">{doc.count}</span>
                  </div>
                  {doc.expired > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs text-red-600 font-semibold">{doc.expired} {t("expiredCount")}</span>
                    </div>
                  )}
                  {doc.expiring30 > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-xs text-yellow-600 font-semibold">{doc.expiring30} {t("soonCount")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{t("userAccounts")}</h2>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("userAccountsDesc")}</p>
          </div>
          <Link href={`/${locale}/company/users`} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-bold hover:bg-primary/90 transition-all">
            <Plus className="w-3.5 h-3.5" />{t("addUser")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UserStatCard label={t("totalUsers")} value={operations.users.totalUsers} icon={<Users className="w-5 h-5" />} color="blue" />
          <UserStatCard label={t("activeUsers")} value={operations.users.activeUsers} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
          <UserStatCard label={t("pendingApproval")} value={operations.users.pendingApproval} icon={<Clock className="w-5 h-5" />} color="yellow" />
          <UserStatCard label={t("remainingSlots")} value={`${operations.users.remainingSlots}/${operations.users.maxAllowed}`} icon={<CreditCard className="w-5 h-5" />} color="purple" />
        </div>

        {operations.userAccounts.length === 0 ? (
          <div className="py-8 text-center border-t border-white/20">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-on-surface-variant/50 text-[13px]">{t("noUserAccounts")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-white/20 pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("name")}</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("email")}</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("role")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("status")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("created")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("approval")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {operations.userAccounts.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-3 py-3 text-gray-600">{u.email}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {tr(u.role) || u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={u.isActive ? "active" : "inactive"} />
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500 text-[12px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {u.requiresApproval ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                          <Clock className="w-3 h-3" /> {t("pendingLabel")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" /> {t("approvedLabel")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {u.requiresApproval && (
                        <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary hover:text-white transition-all">
                          {t("approveUser")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-[12px] text-on-surface-variant/50">
          <span>{t("packageLimit")} {operations.users.maxAllowed} {t("users")}</span>
          {operations.users.remainingSlots === 0 && (
            <Link href={`/${locale}/company/users`} className="text-primary font-semibold hover:underline flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              {t("upgradePackage")}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="floating-glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">{t("recentAttendance")}</h2>
              <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("attendanceToday")}</p>
            </div>
            {operations.attendance.lastCheckIn && (
              <span className="text-[11px] text-on-surface-variant/50">
                {t("last")}: {new Date(operations.attendance.lastCheckIn).toLocaleTimeString()}
              </span>
            )}
          </div>
          <DataTable
            columns={[
              { key: "name", header: t("employees"), render: (item: EmployeeRow) => <span className="font-bold text-on-surface text-[14px]">{item.name}</span> },
              { key: "department", header: t("department"), render: (item: EmployeeRow) => <span className="text-on-surface-variant/70 text-[13px]">{item.department}</span> },
              { key: "status", header: t("status"), render: (item: EmployeeRow) => <StatusBadge status={item.status} /> },
            ]}
            data={attendanceToday}
            emptyTitle={t("noData")}
            emptyDescription={t("noResults")}
          />
        </div>

        <div className="floating-glass rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">{t("pendingRequests")}</h2>
              <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{t("pendingApprovals")}</p>
            </div>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-on-surface-variant/50 text-[14px] font-medium">{t("noData")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/30 border border-white/40 hover:bg-white/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface text-[14px] truncate">{req.title}</h4>
                    <p className="text-on-surface-variant/50 text-[12px]">{req.employeeName} &middot; {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceCard({ label, value, total, color, icon }: { label: string; value: number; total: number; color: string; icon: React.ReactNode }) {
  const t = useTranslations("dashboard");
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] p-4 pt-5 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${color}`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant/50 leading-none">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-on-surface-variant/8 to-on-surface-variant/3 flex items-center justify-center text-on-surface-variant/60">{icon}</div>
      </div>
      <p className="text-[24px] font-extrabold text-on-surface tracking-[-0.02em] leading-none kpi-count">{value}</p>
      <div className="mt-3 h-1.5 bg-outline-variant/15 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out kpi-bar-animate`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-on-surface-variant/40 mt-1.5 font-medium">{pct}% {t("ofTotal")}</p>
    </div>
  );
}

function UserStatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-50 to-blue-100/50 text-blue-600",
    emerald: "from-emerald-50 to-emerald-100/50 text-emerald-600",
    yellow: "from-amber-50 to-amber-100/50 text-amber-600",
    purple: "from-purple-50 to-purple-100/50 text-purple-600",
  };
  return (
    <div className="flex items-center gap-3 p-4 rounded-[1rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_1px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm ${colorMap[color] || "from-gray-50 to-gray-100/50 text-gray-600"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant/45 leading-none">{label}</p>
        <p className="text-[20px] font-extrabold text-on-surface tracking-[-0.02em] leading-tight mt-0.5 kpi-count">{value}</p>
      </div>
    </div>
  );
}
