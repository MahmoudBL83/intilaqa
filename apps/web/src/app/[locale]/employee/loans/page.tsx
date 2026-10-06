import { auth } from '@intilaqa/auth';
import { redirect } from 'next/navigation';
import { PageHeader } from '@intilaqa/ui';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@intilaqa/db';
import { LoanRequestFormContent } from './loan-request-content';

export default async function EmployeeLoansPage() {
  const session = await auth();
  const t = await getTranslations('dashboard');

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get employee and salary info
  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      salary: true,
    },
  });

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('error')}</h1>
          <p className="text-on-surface-variant">{t('employeeNotFound')}</p>
        </div>
      </div>
    );
  }

  // Get existing loans
  const existingLoans = await prisma.employeeRequest.findMany({
    where: {
      employeeId: employee.id,
      type: 'loan',
    },
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      metadata: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedLoans = existingLoans.map((loan) => ({
    id: loan.id,
    amount: (loan.metadata as any)?.loanAmount || 0,
    purpose: loan.reason || '',
    expectedRepaymentMonths: (loan.metadata as any)?.expectedRepaymentMonths || 0,
    monthlyDeduction: (loan.metadata as any)?.monthlyDeduction || 0,
    status: loan.status as 'pending' | 'approved' | 'rejected' | 'disbursed' | 'completed',
    createdAt: loan.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employeeLoans')}
        subtitle={t('manageYourLoanRequests')}
      />

      <LoanRequestFormContent
        employeeId={employee.id}
        salary={employee.salary || 0}
        existingLoans={formattedLoans}
      />
    </div>
  );
}
