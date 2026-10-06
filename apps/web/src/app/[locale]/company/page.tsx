import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { OperationsService } from "../../../server/services/operations-service";
import { CompanyDashboardContent } from "./dashboard-content";

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;

  const employee = await prisma.employee.findFirst({
    where: { userId },
    include: { company: true, department: true, user: true },
  });
  if (!employee?.companyId) redirect(`/${locale}/login`);

  const companyId = employee.companyId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalEmployees, presentToday, pendingRequests, onLeaveCount, latestPayrollRun, operations] = await Promise.all([
    prisma.employee.count({ where: { companyId, isActive: true } }),
    prisma.attendanceRecord.count({
      where: { employee: { companyId }, date: { gte: today, lt: tomorrow }, status: "present" },
    }),
    prisma.employeeRequest.count({
      where: { employee: { companyId }, status: "pending" },
    }),
    prisma.attendanceRecord.count({
      where: { employee: { companyId }, date: { gte: today, lt: tomorrow }, status: "on_leave" },
    }),
    prisma.payrollRun.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { totalGross: true, totalDeductions: true, totalNet: true, payrollMonth: true, status: true },
    }),
    OperationsService.getAll(companyId),
  ]);

  const [rawAttendance, rawRequests] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { employee: { companyId }, date: { gte: today, lt: tomorrow } },
      include: { employee: { include: { department: true, user: true } } },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeRequest.findMany({
      where: { employee: { companyId }, status: "pending" },
      include: { employee: { include: { user: true } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const attendanceToday = rawAttendance.map((a) => ({
    id: a.id,
    name: a.employee.user.name,
    department: a.employee.department?.name ?? "—",
    status: a.status,
  }));

  const pendingRequestsList = rawRequests.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    employeeName: r.employee.user.name,
    status: r.status,
    createdAt: r.createdAt,
  }));

  return (
    <CompanyDashboardContent
      stats={{ totalEmployees, presentToday, pendingRequests, onLeave: onLeaveCount }}
      attendanceToday={attendanceToday}
      pendingRequests={pendingRequestsList}
      operations={operations}
      payrollRun={latestPayrollRun}
    />
  );
}
