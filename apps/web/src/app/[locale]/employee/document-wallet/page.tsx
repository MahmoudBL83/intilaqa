import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { getTranslations } from "next-intl/server";
import { DocumentWalletContent } from "./wallet-content";

export default async function DocumentWalletPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("documentWallet");

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: {
      documents: { orderBy: { expiryDate: "asc" } },
      professionalCertificates: { orderBy: { expiryDate: "asc" } },
      user: { select: { name: true } },
    },
  });

  if (!employee) {
    redirect(`/${locale}/login`);
  }

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringDocuments = employee.documents.filter(
    (doc) =>
      doc.expiryDate &&
      doc.expiryDate <= thirtyDaysFromNow &&
      doc.expiryDate >= new Date() &&
      doc.status !== "expired"
  );

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={[
          { label: t("dashboard"), href: `/${locale}/employee` },
          { label: t("title") },
        ]}
      />
      <DocumentWalletContent
        employeeId={employee.id}
        employeeName={employee.user.name}
        documents={employee.documents}
        expiringDocuments={expiringDocuments}
        certificates={employee.professionalCertificates}
      />
    </div>
  );
}
