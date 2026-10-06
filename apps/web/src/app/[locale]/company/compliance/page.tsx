import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { getCompanyAlerts, getCompanyComplianceDocuments } from "@/server/services/compliance-service";
import { CompliancePageContent } from "./compliance-content";

export default async function CompanyCompliancePage({
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

  const [alerts, documents] = await Promise.all([
    getCompanyAlerts(companyId),
    getCompanyComplianceDocuments(companyId),
  ]);

  return (
    <CompliancePageContent
      locale={locale}
      companyId={companyId}
      initialAlerts={alerts.map((a) => ({
        id: a.id,
        type: a.type,
        alertLevel: a.alertLevel,
        severity: a.severity,
        title: a.title,
        description: a.description,
        status: a.status,
        channel: a.channel,
        ownerType: a.ownerType,
        ownerId: a.ownerId,
        document: a.document ? { id: a.document.id, name: a.document.name, type: a.document.type, expiryDate: a.document.expiryDate?.toISOString() ?? null } : null,
        dueDate: a.dueDate?.toISOString() ?? null,
        resolvedAt: a.resolvedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      }))}
      initialDocuments={documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        documentNumber: d.documentNumber,
        issuingAuthority: d.issuingAuthority,
        ownerType: d.ownerType,
        ownerId: d.ownerId,
        expiryDate: d.expiryDate?.toISOString() ?? null,
        status: d.status,
      }))}
    />
  );
}
