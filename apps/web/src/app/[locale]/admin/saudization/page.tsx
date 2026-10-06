import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { SaudizationService } from "../../../../server/services/saudization-service";
import { AdminSaudizationContent } from "./admin-saudization-content";

export default async function AdminSaudizationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  let companyData: { id: string; name: string; status: any }[] = [];
  let error: string | null = null;

  try {
    const companyIds = companies.map((c) => c.id);
    const statusMap = await SaudizationService.getBatchCompanySaudizationStatus(companyIds);

    companyData = companies.map((c) => ({
      id: c.id,
      name: c.name,
      status: statusMap.get(c.id),
    })).filter((d) => d.status);

    if (companyData.length === 0 && companies.length > 0) {
      error = "Could not load Saudization data for any company";
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load Saudization data";
  }

  return (
    <AdminSaudizationContent
      companyData={companyData}
      totalCompanies={companies.length}
      error={error}
    />
  );
}
