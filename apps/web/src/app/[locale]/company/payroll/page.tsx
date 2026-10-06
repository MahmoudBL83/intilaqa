import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { getPayrollRuns } from "@/server/services/payroll-engine";
import { PayrollRunsContent } from "./payroll-runs-content";

export default async function CompanyPayrollPage({
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

  const runs = await getPayrollRuns(companyId);

  return (
    <PayrollRunsContent
      locale={locale}
      companyId={companyId}
      runs={runs.map((r) => ({
        id: r.id,
        payrollMonth: r.payrollMonth,
        status: r.status,
        totalGross: r.totalGross,
        totalDeductions: r.totalDeductions,
        totalNet: r.totalNet,
        itemCount: r._count.items,
        createdAt: r.createdAt.toISOString(),
        approvedAt: r.approvedAt?.toISOString() ?? null,
        paidAt: r.paidAt?.toISOString() ?? null,
      }))}
    />
  );
}
