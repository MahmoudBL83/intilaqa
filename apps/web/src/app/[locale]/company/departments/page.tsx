import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { DepartmentsContent } from "./departments-content";

export default async function CompanyDepartmentsPage({
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
    include: { company: true },
  });
  if (!employee?.companyId) redirect(`/${locale}/login`);

  const departments = await prisma.department.findMany({
    where: { companyId: employee.companyId },
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <DepartmentsContent
      departments={departments.map((d) => ({
        id: d.id,
        name: d.name,
        employeeCount: d._count.employees,
      }))}
    />
  );
}
