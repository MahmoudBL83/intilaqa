import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { NewPayrollRunContent } from "./new-payroll-run-content";

export default async function NewPayrollRunPage({
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

  const employeeCount = await prisma.employee.count({
    where: { companyId, isActive: true },
  });

  return (
    <NewPayrollRunContent
      locale={locale}
      companyId={companyId}
      employeeCount={employeeCount}
    />
  );
}
