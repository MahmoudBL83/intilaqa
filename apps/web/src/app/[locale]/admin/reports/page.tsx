import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { ReportsContent } from "../../reports-content";
import type { DashboardSummary } from "../../../../server/services/reports-service";

export default async function AdminReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");
  const td = await getTranslations("dashboard");

  let data: DashboardSummary | null = null;
  let error: string | null = null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [employees, todayAttendance, payrollRuns, complianceDocs, firstCompany] =
      await Promise.all([
        prisma.employee.findMany({
          select: { isActive: true, isSaudi: true, salary: true },
        }),
        prisma.attendanceRecord.findMany({
          where: { date: { gte: today, lt: tomorrow } },
          select: { status: true },
        }),
        prisma.payrollRun.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { payrollMonth: true, totalGross: true, totalDeductions: true, totalNet: true },
        }),
        prisma.complianceDocument.findMany({
          select: { expiryDate: true, type: true },
        }),
        prisma.company.findFirst({
          select: { id: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    const totalEmployees = employees.length;
    const active = employees.filter((e) => e.isActive).length;
    const saudi = employees.filter((e) => e.isSaudi).length;
    const expat = totalEmployees - saudi;
    const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);

    const presentToday = todayAttendance.filter((r) => r.status === "present").length;
    const absentToday = todayAttendance.filter((r) => r.status === "absent").length;
    const lateToday = todayAttendance.filter((r) => r.status === "late").length;
    const onLeaveToday = todayAttendance.filter((r) => r.status === "on_leave").length;

    const totalDeductions = payrollRuns.reduce((s, r) => s + r.totalDeductions, 0);
    const monthlyPayroll = payrollRuns
      .reverse()
      .map((r) => ({
        month: r.payrollMonth,
        gross: r.totalGross,
        deductions: r.totalDeductions,
        net: r.totalNet,
      }));

    const now = new Date();
    let expired = 0, expiring30 = 0, expiring60 = 0, valid = 0;
    for (const doc of complianceDocs) {
      if (!doc.expiryDate) { valid++; continue; }
      const daysLeft = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) expired++;
      else if (daysLeft <= 30) expiring30++;
      else if (daysLeft <= 60) expiring60++;
      else valid++;
    }

    // Monthly attendance from first company for trend display
    let monthlyAttendance: DashboardSummary["attendance"]["monthlyAttendance"] = [];
    if (firstCompany) {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const records = await prisma.attendanceRecord.findMany({
          where: {
            employee: { companyId: firstCompany.id },
            date: { gte: d, lte: end },
          },
          select: { status: true },
        });
        monthlyAttendance.push({
          month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          present: records.filter((r) => r.status === "present").length,
          absent: records.filter((r) => r.status === "absent").length,
          late: records.filter((r) => r.status === "late").length,
          total: records.length,
        });
      }
    }

    data = {
      attendance: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        onLeaveToday,
        monthlyAttendance,
      },
      payroll: {
        totalPayroll,
        totalDeductions,
        totalAllowances: 0,
        averageSalary: totalEmployees > 0 ? Math.round((totalPayroll / totalEmployees) * 100) / 100 : 0,
        monthlyPayroll,
        departmentBreakdown: [],
      },
      compliance: {
        totalDocuments: complianceDocs.length,
        expired,
        expiring30,
        expiring60,
        valid,
        byType: [],
      },
      employees: {
        total: totalEmployees,
        active,
        saudi,
        expat,
        byDepartment: [],
        byNationality: [],
      },
    };
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reports";
  }

  return (
    <ReportsContent
      data={data}
      error={error}
      title={t("reports")}
      breadcrumbs={[
        { label: td("overview"), href: `/${locale}/admin` },
        { label: t("reports") },
      ]}
    />
  );
}
