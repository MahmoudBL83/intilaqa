import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { ReportsContent } from "../../reports-content";
import { getFullDashboardSummary } from "../../../../server/services/reports-service";
import { prisma } from "@intilaqa/db";

export default async function CompanyReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");
  const td = await getTranslations("dashboard");

  const user = session.user as { role?: string; id?: string };
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { companyId: true },
  });
  if (!employee) {
    return <ReportsContent data={null} error="Employee not found" title={t("reports")} breadcrumbs={[
      { label: td("overview"), href: `/${locale}/company` }, { label: t("reports") },
    ]} />;
  }

  let data = null;
  let error: string | null = null;

  try {
    data = await getFullDashboardSummary(employee.companyId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reports";
  }

  return (
    <ReportsContent
      data={data}
      error={error}
      title={t("reports")}
      breadcrumbs={[
        { label: td("overview"), href: `/${locale}/company` },
        { label: t("reports") },
      ]}
    />
  );
}
