import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { ProfileContent } from "./profile-content";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect(`/${locale}/login`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: {
        include: {
          department: true,
          company: true,
          contracts: { orderBy: { startDate: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!user?.employee) redirect(`/${locale}/employee`);

  const emp = user.employee;
  const contract = emp.contracts[0] ?? null;

  return (
    <ProfileContent
      locale={locale}
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      employee={{
        employeeId: emp.employeeId,
        position: emp.position,
        joinDate: emp.joinDate.toISOString(),
        salary: emp.salary,
        isSaudi: emp.isSaudi,
        nationality: emp.nationality,
        contractStartDate: emp.contractStartDate?.toISOString() ?? null,
        contractEndDate: emp.contractEndDate?.toISOString() ?? null,
        department: emp.department?.name ?? null,
        company: emp.company?.name ?? null,
      }}
      contract={contract ? {
        type: contract.type,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate?.toISOString() ?? null,
        salary: contract.salary,
        status: contract.status,
        documentUrl: contract.documentUrl,
      } : null}
    />
  );
}
