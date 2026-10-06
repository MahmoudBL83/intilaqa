import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { AdminViolationsContent } from "./admin-violations-content";

const PAGE_SIZE = 20;

export default async function AdminViolationsPage(props: { searchParams: Promise<{ page?: string }>, params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const [companies, policies, violations, pending] = await Promise.all([
    prisma.company.findMany({ take: 20 }),
    prisma.violationPolicy.count(),
    prisma.employeeViolation.count(),
    prisma.employeeViolation.count({ where: { status: "pending" } }),
  ]);

  const companyIds = companies.map((c) => c.id);

  const [violationCounts, pendingCounts, employees] = await Promise.all([
    prisma.employeeViolation.groupBy({
      by: ["employeeId"],
      where: { employee: { companyId: { in: companyIds } } },
      _count: { id: true },
    }),
    prisma.employeeViolation.groupBy({
      by: ["employeeId"],
      where: { employee: { companyId: { in: companyIds } }, status: "pending" },
      _count: { id: true },
    }),
    prisma.employee.findMany({
      where: { companyId: { in: companyIds } },
      select: { id: true, companyId: true },
    }),
  ]);

  const empCompany = new Map(employees.map((e) => [e.id, e.companyId]));

  const statsMap = new Map<string, { totalViolations: number; pendingReviews: number }>();
  for (const vc of violationCounts) {
    const cid = empCompany.get(vc.employeeId);
    if (!cid) continue;
    const s = statsMap.get(cid) || { totalViolations: 0, pendingReviews: 0 };
    s.totalViolations += vc._count.id;
    statsMap.set(cid, s);
  }
  for (const pc of pendingCounts) {
    const cid = empCompany.get(pc.employeeId);
    if (!cid) continue;
    const s = statsMap.get(cid) || { totalViolations: 0, pendingReviews: 0 };
    s.pendingReviews += pc._count.id;
    statsMap.set(cid, s);
  }

  const paginatedCompanies = companies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const companyStats = paginatedCompanies.map((c) => {
    const s = statsMap.get(c.id) || { totalViolations: 0, pendingReviews: 0 };
    return { id: c.id, name: c.name, ...s };
  });

  return (
    <AdminViolationsContent
      stats={{ totalCompanies: companies.length, totalPolicies: policies, totalViolations: violations, pending }}
      companyStats={companyStats}
      currentPage={page}
      totalPages={Math.ceil(companies.length / PAGE_SIZE)}
    />
  );
}
