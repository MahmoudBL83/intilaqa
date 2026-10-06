import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { SaudizationService, type SaudizationStatus, type SaudizedProfession } from "../../../../server/services/saudization-service";
import { SaudizationContent } from "./saudization-content";

export default async function SaudizationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { employee: true },
  });

  if (!user?.employee?.companyId) {
    redirect(`/${locale}/login`);
  }

  const companyId = user.employee.companyId;
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } });

  let status: SaudizationStatus | null = null;
  let professions: SaudizedProfession[] = [];
  let error: string | null = null;

  const scenarios = await prisma.saudizationScenario.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  try {
    [status, professions] = await Promise.all([
      SaudizationService.getCompanySaudizationStatus(companyId),
      SaudizationService.getSaudizedProfessions(companyId),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load Saudization data";
  }

  return (
    <SaudizationContent
      locale={locale}
      companyName={company?.name ?? ""}
      companyId={companyId}
      status={status}
      professions={professions}
      savedScenarios={scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        currentSaudis: s.currentSaudis,
        currentExpats: s.currentExpats,
        newSaudisToHire: s.newSaudisToHire,
        newExpatsToHire: s.newExpatsToHire,
        projectedPercentage: s.projectedPercentage,
        createdAt: s.createdAt.toISOString(),
      }))}
      error={error}
    />
  );
}
