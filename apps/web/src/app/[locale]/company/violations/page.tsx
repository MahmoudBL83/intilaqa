import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { ViolationsContent } from "./violations-content";

export default async function CompanyViolationsPage({
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

  const companyId = employee.companyId;

  const [policies, violations, vCount, pCount] = await Promise.all([
    prisma.violationPolicy.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employeeViolation.findMany({
      where: { employee: { companyId } },
      include: {
        employee: { include: { user: true } },
        policy: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.employeeViolation.count({ where: { employee: { companyId } } }),
    prisma.employeeViolation.count({
      where: { employee: { companyId }, status: "pending" },
    }),
  ]);

  const stats = {
    totalViolations: vCount,
    pendingReviews: pCount,
    totalPolicies: policies.length,
    appliedCount: vCount - pCount,
  };

  return (
    <ViolationsContent
      policies={policies.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        deductionType: p.deductionType,
        deductionValue: p.deductionValue,
      }))}
      violations={violations.map((v) => ({
        id: v.id,
        employeeName: v.employee.user.name,
        employeeId: v.employee.id,
        policyName: v.policy.name,
        deductionType: v.policy.deductionType,
        deductionValue: v.policy.deductionValue,
        date: v.date.toISOString(),
        status: v.status,
        notes: v.notes,
      }))}
      stats={stats}
    />
  );
}
