import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { EmployeeDashboardContent } from "./dashboard-content";

export default async function EmployeeDashboardPage({
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
  });
  if (!employee) redirect(`/${locale}/login`);

  const tc = await getTranslations("common");
  const ta = await getTranslations("attendance");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [attendanceRecord, pendingRequests, tasks, latestPayslip] = await Promise.all([
    prisma.attendanceRecord.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: today, lt: tomorrow },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeRequest.count({
      where: { employeeId: employee.id, status: "pending" },
    }),
    prisma.task.findMany({
      where: { employeeId: employee.id },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payslip.findFirst({
      where: { employeeId: employee.id },
      include: { payrollRecord: true },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const attendanceToday = attendanceRecord
    ? attendanceRecord.status === "present"
      ? ta("present")
      : attendanceRecord.status === "late"
        ? ta("late")
        : attendanceRecord.status === "absent"
          ? ta("absent")
          : attendanceRecord.status === "on_leave"
            ? ta("onLeave")
            : attendanceRecord.status
    : tc("noRecord");

  const lastPayslip = latestPayslip
    ? `${latestPayslip.payrollRecord.netPay} ${latestPayslip.payrollRecord.netPay > 0 ? tc("currency") : ""}`.trim()
    : "—";

  const tasksList = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    status: t.status,
  }));

  return (
    <EmployeeDashboardContent
      locale={locale}
      stats={{
        attendanceToday,
        pendingRequests,
        myTasks: tasks.length,
        lastPayslip,
      }}
      tasks={tasksList}
    />
  );
}
