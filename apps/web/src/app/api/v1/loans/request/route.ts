import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@intilaqa/auth';
import { EmployeeLoanService } from '@/server/services/employee-loan-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, amount, purpose, expectedRepaymentMonths, description } = body;

    if (!employeeId || !amount || !purpose || !expectedRepaymentMonths) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await EmployeeLoanService.requestLoan(employeeId, {
      amount: parseFloat(amount),
      purpose,
      expectedRepaymentMonths: parseInt(expectedRepaymentMonths),
      description,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Loan request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create loan request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID required' },
        { status: 400 }
      );
    }

    const loans = await EmployeeLoanService.getEmployeeLoans(employeeId);
    return NextResponse.json(loans);
  } catch (error: any) {
    console.error('Get loans error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}
