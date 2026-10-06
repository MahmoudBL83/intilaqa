import { auth } from '@intilaqa/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@intilaqa/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll Export',
  description: 'Export payroll records and reports',
};

async function PayrollExportData(locale: string) {
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

  const payrollRecords = await prisma.payrollRecord.findMany({
    where: { companyId: user.employee.companyId },
    orderBy: { createdAt: 'desc' },
  });

  const records = payrollRecords.map((record) => ({
    id: record.id,
    month: record.month,
    year: record.year,
    baseSalary: record.baseSalary,
    allowances: record.allowances,
    deductions: record.deductions,
    netPay: record.netPay,
    status: record.status as 'pending' | 'processed' | 'paid',
    createdAt: record.createdAt.toISOString(),
  }));

  return { companyId: user.employee.companyId, payrollRecords: records };
}

export default async function PayrollExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { companyId, payrollRecords } = await PayrollExportData(locale);

  // Dynamic import of client component to avoid circular dependency
  const { PayrollExportContent } = await import('./payroll-export-content');

  return (
    <PayrollExportContent
      companyId={companyId}
      payrollRecords={payrollRecords}
    />
  );
}
