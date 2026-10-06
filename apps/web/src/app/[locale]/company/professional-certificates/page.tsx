import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { ProfessionalCertificatesContent } from "./certs-content";

export default async function ProfessionalCertificatesPage({
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

  const [certs, total, expiring] = await Promise.all([
    prisma.professionalCertificate.findMany({
      where: { companyId },
      include: { employee: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.professionalCertificate.count({ where: { companyId } }),
    prisma.professionalCertificate.count({
      where: {
        companyId,
        expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const employees = await prisma.employee.findMany({
    where: { companyId, isActive: true },
    include: { user: true },
    orderBy: { employeeId: "asc" },
  });

  const stats = { total, expiring, verified: certs.filter((c) => c.isVerified).length };

  return (
    <ProfessionalCertificatesContent
      certs={certs.map((c) => ({
        id: c.id,
        name: c.name,
        certificateNumber: c.certificateNumber,
        issuingAuthority: c.issuingAuthority,
        issueDate: c.issueDate?.toISOString() ?? null,
        expiryDate: c.expiryDate?.toISOString() ?? null,
        profession: c.profession,
        qiwaProfessionCode: c.qiwaProfessionCode,
        isVerified: c.isVerified,
        status: c.status,
        employeeName: c.employee.user.name,
        employeeId: c.employee.id,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.user.name }))}
      stats={stats}
    />
  );
}
