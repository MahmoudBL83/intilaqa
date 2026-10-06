import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { ClientDashboardContent } from "./dashboard-content";

export default async function ClientDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;

  const client = await prisma.client.findFirst({ where: { userId } });
  if (!client) redirect(`/${locale}/login`);

  const [companyCount, totalEmployees, activeSubscriptions, subscription] = await Promise.all([
    prisma.company.count({ where: { clientId: client.id } }),
    prisma.employee.count({ where: { company: { clientId: client.id } } }),
    prisma.subscription.count({ where: { clientId: client.id, status: "active" } }),
    prisma.subscription.findFirst({
      where: { clientId: client.id, status: "active" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rawCompanies = await prisma.company.findMany({
    where: { clientId: client.id },
    include: { _count: { select: { employees: true } } },
    orderBy: { createdAt: "desc" },
  });

  const companies = rawCompanies.map((c) => ({
    id: c.id,
    name: c.name,
    employeeCount: c._count.employees,
    isActive: c.isActive,
  }));

  const subscriptionInfo = subscription
    ? {
        planName: subscription.plan.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
      }
    : null;

  return (
    <ClientDashboardContent
      stats={{ companyCount, employeeCount: totalEmployees, activeSubscriptions }}
      companies={companies}
      subscription={subscriptionInfo}
      totalEmployees={totalEmployees}
    />
  );
}
