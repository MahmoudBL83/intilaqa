import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { AdminDashboardContent } from "./dashboard-content";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  // Fetch all counts from database
  const [
    totalClients,
    totalCompanies,
    totalEmployees,
    saudiEmployees,
    activeCompanies,
    suspendedClients,
    activeSubscriptions,
    pendingActions,
    payrollSum,
    nitaqatGroups,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.company.count(),
    prisma.employee.count(),
    prisma.employee.count({ where: { isSaudi: true } }),
    prisma.company.count({ where: { isActive: true } }),
    prisma.client.count({ where: { isActive: false } }),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.employeeRequest.count({ where: { status: "pending" } }),
    prisma.employee.aggregate({ _sum: { salary: true } }),
    prisma.company.groupBy({ by: ["nitaqatColor"], _count: { nitaqatColor: true } }),
  ]);

  const expatEmployees = totalEmployees - saudiEmployees;

  // Format nitaqat
  const nitaqatDistribution = nitaqatGroups.map((group) => ({
    color: group.nitaqatColor || "GREEN_MID",
    count: group._count.nitaqatColor,
  })).sort((a,b) => b.count - a.count);

  const recentClients = await prisma.client.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      companies: { select: { id: true, name: true } },
      subscriptions: {
        where: { status: "active" },
        take: 1,
        include: { plan: { select: { name: true } } },
      },
    },
  });

  const subscriptionPlans = await prisma.subscriptionPlan.findMany({
    include: {
      _count: { select: { subscriptions: true } },
    },
  });

  const totalSubscriptions = subscriptionPlans.reduce((sum, p) => sum + p._count.subscriptions, 0);

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringDocuments = await prisma.document.findMany({
    where: {
      expiryDate: { lte: thirtyDaysFromNow, gte: new Date() },
      status: { not: "expired" },
    },
    take: 3,
    orderBy: { expiryDate: "asc" },
  });

  // Get Contract Alerts via Subscriptions expiring soon
  const contractSubscriptions = await prisma.subscription.findMany({
    where: {
      endDate: { lte: thirtyDaysFromNow, gte: new Date() },
      status: "active"
    },
    take: 5,
    orderBy: { endDate: "asc" },
    include: { client: { select: { name: true } } }
  });

  const contractAlerts = contractSubscriptions.map((sub) => {
    const today = new Date();
    const endDate = new Date(sub.endDate);
    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      id: sub.id,
      client: { name: sub.client.name },
      endDate: endDate.toISOString(),
      daysRemaining,
      status: daysRemaining < 15 ? "critical" : "warning",
    };
  });

  // Latest Payroll Runs
  const latestPayrolls = await prisma.payrollRecord.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true } } }
  });

  const payrollRuns = latestPayrolls.map((pr) => ({
    id: pr.id,
    companyName: pr.company?.name || "Unknown Company",
    month: pr.month,
    year: pr.year,
    baseSalary: pr.baseSalary,
    deductions: pr.deductions,
    netPay: pr.netPay,
    status: pr.status as any,
  }));

  return (
    <div>
      <AdminDashboardContent
        stats={{
          totalClients,
          totalCompanies,
          totalEmployees,
          saudiEmployees,
          expatEmployees,
          activeCompanies,
          suspended: suspendedClients,
          activeSubscriptions,
          monthlyPayroll: payrollSum._sum.salary || 0,
          pendingActions,
        }}
        recentClients={recentClients}
        subscriptionPlans={subscriptionPlans}
        totalSubscriptions={totalSubscriptions}
        expiringDocuments={expiringDocuments}
        nitaqatDistribution={nitaqatDistribution}
        contractAlerts={contractAlerts}
        payrollRuns={payrollRuns}
      />
    </div>
  );
}
