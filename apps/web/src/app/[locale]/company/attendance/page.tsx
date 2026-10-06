import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { AttendanceContent } from "./attendance-content";

export default async function CompanyAttendancePage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string; date?: string; department?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;

  const emp = await prisma.employee.findFirst({ where: { userId }, include: { company: true } });
  if (!emp?.companyId) redirect(`/${locale}/login`);

  const companyId = emp.companyId;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 15;
  const dateFilter = sp.date || new Date().toISOString().substring(0, 10);
  const deptFilter = sp.department || "";

  const date = new Date(dateFilter);
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const where: Record<string, unknown> = {
    employee: { companyId },
    date: { gte: date, lt: nextDay },
  };
  if (deptFilter) {
    where.employee = { ...(where.employee as object), departmentId: deptFilter };
  }

  const [records, total, departments, present, late, absent] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: where as any,
      include: { employee: { include: { user: true, department: { select: { name: true } } } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendanceRecord.count({ where: where as any }),
    prisma.department.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.attendanceRecord.count({ where: { ...where, status: "present" } as any }),
    prisma.attendanceRecord.count({ where: { ...where, status: "late" } as any }),
    prisma.attendanceRecord.count({ where: { ...where, status: "absent" } as any }),
  ]);

  return (
    <AttendanceContent
      locale={locale}
      records={records.map((r) => ({
        id: r.id,
        employeeName: r.employee.user.name,
        employeeId: r.employee.employeeId,
        department: r.employee.department?.name || null,
        checkIn: r.checkIn?.toISOString() || null,
        checkOut: r.checkOut?.toISOString() || null,
        status: r.status,
        date: r.date.toISOString(),
      }))}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      stats={{ present, late, absent, total }}
      total={total}
      page={page}
      totalPages={Math.ceil(total / pageSize)}
      dateFilter={dateFilter}
      deptFilter={deptFilter}
    />
  );
}
