import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { EmployeesContent } from "./employees-content";

export default async function CompanyEmployeesPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; department?: string; page?: string }>;
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

  const companyId = employee.companyId;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const deptFilter = sp.department || "";
  const pageSize = 10;

  const where: Record<string, unknown> = { companyId, isActive: true };
  if (search) {
    where.user = { name: { contains: search, mode: "insensitive" } };
  }
  if (deptFilter) {
    where.departmentId = deptFilter;
  }

  const [employees, total, departments] = await Promise.all([
    prisma.employee.findMany({
      where: where as any,
      include: { user: true, department: { select: { name: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.count({ where: where as any }),
    prisma.department.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <EmployeesContent
      locale={locale}
      employees={employees.map((e) => ({
        id: e.id,
        name: e.user.name,
        email: e.user.email,
        employeeId: e.employeeId,
        position: e.position,
        department: e.department?.name || null,
        salary: e.salary,
        isSaudi: e.isSaudi,
        joinDate: e.joinDate.toISOString(),
      }))}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      total={total}
      page={page}
      totalPages={totalPages}
      search={search}
      deptFilter={deptFilter}
    />
  );
}
