import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { SettingsContent } from "./settings-content";

export default async function CompanySettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;
  const emp = await prisma.employee.findFirst({ where: { userId }, include: { company: true } });
  if (!emp?.companyId) redirect(`/${locale}/login`);

  const company = await prisma.company.findUnique({ where: { id: emp.companyId } });
  if (!company) redirect(`/${locale}/login`);

  const subscription = await prisma.subscription.findFirst({
    where: { clientId: company.clientId, status: "active" },
    include: { plan: true },
  });

  return (
    <SettingsContent
      locale={locale}
      company={{
        id: company.id,
        name: company.name,
        address: company.address,
        industry: company.industry,
        saudizationPercent: company.saudizationPercent,
        nitaqatColor: company.nitaqatColor,
        isActive: company.isActive,
      }}
      subscription={subscription ? {
        planName: subscription.plan.name,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        status: subscription.status,
      } : null}
    />
  );
}
