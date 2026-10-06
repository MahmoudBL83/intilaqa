import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { getCompanyOvertimeRecords } from "@/server/services/shift-service";
import { OvertimeContent } from "./overtime-content";

export default async function CompanyOvertimePage({
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

  const records = await getCompanyOvertimeRecords(companyId);

  return (
    <OvertimeContent
      locale={locale}
      companyId={companyId}
      records={records.map((r) => ({
        id: r.id,
        date: r.date.toISOString(),
        regularHours: r.regularHours,
        workedHours: r.workedHours,
        overtimeHours: r.overtimeHours,
        hours: r.hours,
        rate: r.rate,
        status: r.status,
        approvalStatus: r.approvalStatus,
        notes: r.notes,
        employeeName: r.employee.user?.name ?? "—",
        employeeCode: r.employee.employeeId ?? "—",
      }))}
    />
  );
}
