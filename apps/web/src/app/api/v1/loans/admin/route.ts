import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@intilaqa/auth';
import { EmployeeLoanService } from '@/server/services/employee-loan-service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      );
    }

    const pendingLoans = await EmployeeLoanService.getPendingLoans(companyId);
    return NextResponse.json(pendingLoans);
  } catch (error: any) {
    console.error('Get pending loans error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending loans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, loanRequestId, reason } = body;

    if (!loanRequestId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await EmployeeLoanService.approveLoan(loanRequestId, session.user.id);
      return NextResponse.json({ message: 'Loan approved' });
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Rejection reason required' },
          { status: 400 }
        );
      }
      await EmployeeLoanService.rejectLoan(loanRequestId, reason);
      return NextResponse.json({ message: 'Loan rejected' });
    } else if (action === 'disburse') {
      await EmployeeLoanService.disburse(loanRequestId);
      return NextResponse.json({ message: 'Loan disbursed' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Loan action error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process loan request' },
      { status: 400 }
    );
  }
}
