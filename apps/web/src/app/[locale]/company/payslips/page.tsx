import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PayslipsContent } from "./payslips-content";

export default async function CompanyPayslipsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;
  const emp = await prisma.employee.findFirst({ where: { userId } });
  if (!emp?.companyId) redirect(`/${locale}/login`);

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 12;

  const [payslips, total] = await Promise.all([
    prisma.payslip.findMany({
      where: { employee: { companyId: emp.companyId } },
      include: { payrollRecord: true, employee: { include: { user: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { issuedAt: "desc" },
    }),
    prisma.payslip.count({ where: { employee: { companyId: emp.companyId } } }),
  ]);

  return (
    <PayslipsContent
      locale={locale}
      payslips={payslips.map((p) => ({
        id: p.id,
        employeeName: p.employee.user.name,
        period: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][p.payrollRecord.month - 1] || "—"} ${p.payrollRecord.year}`,
        netPay: p.payrollRecord.netPay,
        status: p.payrollRecord.status,
        issuedAt: p.issuedAt.toISOString(),
      }))}
      total={total}
      page={page}
      totalPages={Math.ceil(total / pageSize)}
    />
  );
}
