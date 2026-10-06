import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { getCompanyShifts } from "@/server/services/shift-service";
import { ShiftsContent } from "./shifts-content";

export default async function CompanyShiftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employee: true },
  });

  const companyId = user?.employee?.companyId;
  if (!companyId) redirect(`/${locale}/company`);

  const [shifts, assignments, employees] = await Promise.all([
    getCompanyShifts(companyId),
    prisma.shiftAssignment.findMany({
      where: { shift: { companyId } },
      include: { shift: true, employee: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({
      where: { companyId, isActive: true },
      include: { user: true },
      orderBy: { employeeId: "asc" },
    }),
  ]);

  return (
    <ShiftsContent
      locale={locale}
      companyId={companyId}
      shifts={shifts.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        startTime: s.startTime,
        endTime: s.endTime,
        workingDays: s.workingDays,
        breakMinutes: s.breakMinutes,
        isActive: s.isActive,
      }))}
      assignments={assignments.map((a) => ({
        id: a.id,
        shiftName: a.shift.name,
        employeeName: a.employee.user.name,
        employeeId: a.employee.id,
        shiftId: a.shift.id,
        startDate: a.startDate.toISOString(),
        endDate: a.endDate?.toISOString() ?? null,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.user.name }))}
    />
  );
}
