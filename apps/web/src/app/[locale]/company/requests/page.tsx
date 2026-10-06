import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { RequestsContent } from "./requests-content";

export default async function CompanyRequestsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string; type?: string; status?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;
  const emp = await prisma.employee.findFirst({ where: { userId } });
  if (!emp?.companyId) redirect(`/${locale}/login`);

  const companyId = emp.companyId;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 10;
  const typeFilter = sp.type || "";
  const statusFilter = sp.status || "";

  const where: Record<string, unknown> = { employee: { companyId } };
  if (typeFilter) where.type = typeFilter;
  if (statusFilter) where.status = statusFilter;

  const [requests, total, pending] = await Promise.all([
    prisma.employeeRequest.findMany({
      where: where as any,
      include: { employee: { include: { user: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeRequest.count({ where: where as any }),
    prisma.employeeRequest.count({ where: { employee: { companyId }, status: "pending" } }),
  ]);

  return (
    <RequestsContent
      locale={locale}
      requests={requests.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        employeeName: r.employee.user.name,
        status: r.status,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
      }))}
      total={total}
      pending={pending}
      page={page}
      totalPages={Math.ceil(total / pageSize)}
      typeFilter={typeFilter}
      statusFilter={statusFilter}
    />
  );
}
