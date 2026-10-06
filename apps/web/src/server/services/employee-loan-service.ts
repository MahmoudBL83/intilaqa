import { prisma } from "@intilaqa/db";

export interface LoanRequestInput {
  amount: number;
  purpose: string;
  expectedRepaymentMonths: number;
  description?: string;
}

export interface LoanRequestResult {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  purpose: string;
  expectedRepaymentMonths: number;
  description?: string | null;
  monthlyDeduction: number;
  status: "pending" | "approved" | "rejected" | "disbursed" | "completed";
  approvedBy?: string | null;
  approvalDate?: Date | null;
  rejectionReason?: string | null;
  disbursementDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Employee Loan Service
 * Handles employee loan requests, approvals, and tracking
 */
export class EmployeeLoanService {
  /**
   * Create a new loan request
   */
  static async requestLoan(
    employeeId: string,
    input: LoanRequestInput
  ): Promise<LoanRequestResult> {
    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, salary: true, user: { select: { name: true } } },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Validate loan amount (max 3x monthly salary)
    const maxLoan = (employee.salary || 0) * 3;
    if (input.amount > maxLoan) {
      throw new Error(
        `Loan amount cannot exceed ${maxLoan} (3x monthly salary)`
      );
    }

    // Validate repayment period (1-24 months)
    if (
      input.expectedRepaymentMonths < 1 ||
      input.expectedRepaymentMonths > 24
    ) {
      throw new Error("Repayment period must be between 1 and 24 months");
    }

    // Create employee request of type "loan"
    const request = await prisma.employeeRequest.create({
      data: {
        type: "loan",
        title: `Loan Request - ${input.purpose}`,
        status: "pending",
        reason: input.purpose,
        description: input.description,
        startDate: new Date(),
        metadata: {
          loanAmount: input.amount,
          expectedRepaymentMonths: input.expectedRepaymentMonths,
          monthlyDeduction: input.amount / input.expectedRepaymentMonths,
        },
        employeeId,
      },
    });

    const monthlyDeduction = input.amount / input.expectedRepaymentMonths;

    return {
      id: request.id,
      employeeId,
      employeeName: employee.user.name || "",
      amount: input.amount,
      purpose: input.purpose,
      expectedRepaymentMonths: input.expectedRepaymentMonths,
      description: input.description,
      monthlyDeduction: Math.round(monthlyDeduction * 100) / 100,
      status: request.status as LoanRequestResult["status"],
      approvedBy: null,
      approvalDate: null,
      rejectionReason: null,
      disbursementDate: null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  /**
   * Get loan requests for an employee
   */
  static async getEmployeeLoans(employeeId: string) {
    const requests = await prisma.employeeRequest.findMany({
      where: { employeeId, type: "loan" },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((req) => ({
      id: req.id,
      employeeId,
      amount: (req.metadata as any)?.loanAmount || 0,
      purpose: req.reason,
      expectedRepaymentMonths: (req.metadata as any)?.expectedRepaymentMonths || 0,
      description: req.description,
      monthlyDeduction:
        (req.metadata as any)?.monthlyDeduction || 0,
      status: req.status,
      disbursementDate: (req.metadata as any)?.disbursementDate || null,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }));
  }

  /**
   * Get all pending loan requests for a company (for approval)
   */
  static async getPendingLoans(companyId: string) {
    const requests = await prisma.employeeRequest.findMany({
      where: {
        type: "loan",
        status: "pending",
        employee: { companyId },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            salary: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return requests.map((req) => ({
      id: req.id,
      employeeId: req.employee.id,
      employeeNumber: req.employee.employeeId,
      employeeName: req.employee.user.name || "",
      salary: req.employee.salary || 0,
      amount: (req.metadata as any)?.loanAmount || 0,
      purpose: req.reason,
      expectedRepaymentMonths:
        (req.metadata as any)?.expectedRepaymentMonths || 0,
      monthlyDeduction:
        (req.metadata as any)?.monthlyDeduction || 0,
      description: req.description,
      createdAt: req.createdAt,
    }));
  }

  /**
   * Approve a loan request
   */
  static async approveLoan(
    loanRequestId: string,
    approvedByUserId: string
  ): Promise<void> {
    const request = await prisma.employeeRequest.findUnique({
      where: { id: loanRequestId },
    });

    if (!request || request.type !== "loan") {
      throw new Error("Loan request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending loans can be approved");
    }

    await prisma.employeeRequest.update({
      where: { id: loanRequestId },
      data: {
        status: "approved",
        metadata: {
          ...(request.metadata as any),
          approvalDate: new Date(),
          approvedByUserId,
        },
      },
    });
  }

  /**
   * Reject a loan request
   */
  static async rejectLoan(
    loanRequestId: string,
    rejectionReason: string
  ): Promise<void> {
    const request = await prisma.employeeRequest.findUnique({
      where: { id: loanRequestId },
    });

    if (!request || request.type !== "loan") {
      throw new Error("Loan request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending loans can be rejected");
    }

    await prisma.employeeRequest.update({
      where: { id: loanRequestId },
      data: {
        status: "rejected",
        metadata: {
          ...(request.metadata as any),
          rejectionReason,
        },
      },
    });
  }

  /**
   * Mark loan as disbursed
   */
  static async disburse(loanRequestId: string): Promise<void> {
    const request = await prisma.employeeRequest.findUnique({
      where: { id: loanRequestId },
    });

    if (!request || request.type !== "loan") {
      throw new Error("Loan request not found");
    }

    if (request.status !== "approved") {
      throw new Error("Only approved loans can be disbursed");
    }

    await prisma.employeeRequest.update({
      where: { id: loanRequestId },
      data: {
        status: "disbursed",
        metadata: {
          ...(request.metadata as any),
          disbursementDate: new Date(),
        },
      },
    });
  }

  /**
   * Mark loan as completed
   */
  static async completeLoan(loanRequestId: string): Promise<void> {
    const request = await prisma.employeeRequest.findUnique({
      where: { id: loanRequestId },
      select: { type: true, status: true },
    });

    if (!request || request.type !== "loan") {
      throw new Error("Loan request not found");
    }

    if (request.status !== "disbursed") {
      throw new Error("Only disbursed loans can be completed");
    }

    await prisma.employeeRequest.update({
      where: { id: loanRequestId },
      data: {
        status: "completed",
        metadata: {
          completionDate: new Date(),
        },
      },
    });
  }

  /**
   * Get loan deductions for an employee (for payroll integration)
   */
  static async getLoanDeductions(
    employeeId: string,
    month: number,
    year: number
  ): Promise<number> {
    const disbursedLoans = await prisma.employeeRequest.findMany({
      where: {
        employeeId,
        type: "loan",
        status: { in: ["disbursed", "completed"] },
        createdAt: {
          lte: new Date(year, month - 1, 1),
        },
      },
    });

    let totalDeductions = 0;

    for (const loan of disbursedLoans) {
      const monthlyDeduction = (loan.metadata as any)?.monthlyDeduction || 0;
      const expectedMonths =
        (loan.metadata as any)?.expectedRepaymentMonths || 0;

      // Calculate how many months have passed since disbursement
      const disbursementDate =
        (loan.metadata as any)?.disbursementDate || loan.createdAt;
      const monthsSinceDisbursement = this.getMonthsBetween(
        new Date(disbursementDate),
        new Date(year, month - 1, 1)
      );

      if (monthsSinceDisbursement >= 0 && monthsSinceDisbursement < expectedMonths) {
        totalDeductions += monthlyDeduction;
      }
    }

    return Math.round(totalDeductions * 100) / 100;
  }

  /**
   * Get loan summary for an employee
   */
  static async getEmployeeLoanSummary(employeeId: string) {
    const loans = await this.getEmployeeLoans(employeeId);

    const activeLoans = loans.filter(
      (l) => l.status === "disbursed" || l.status === "approved"
    );
    const completedLoans = loans.filter((l) => l.status === "completed");
    const rejectedLoans = loans.filter((l) => l.status === "rejected");

    const totalActive = activeLoans.reduce((sum, l) => sum + l.amount, 0);
    const totalMonthlyDeduction = activeLoans.reduce(
      (sum, l) => sum + l.monthlyDeduction,
      0
    );

    return {
      activeLoans: activeLoans.length,
      completedLoans: completedLoans.length,
      rejectedLoans: rejectedLoans.length,
      totalActive: Math.round(totalActive * 100) / 100,
      totalMonthlyDeduction:
        Math.round(totalMonthlyDeduction * 100) / 100,
      loans,
    };
  }

  /**
   * Helper: Calculate months between two dates
   */
  private static getMonthsBetween(d1: Date, d2: Date): number {
    return (
      (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth())
    );
  }

  /**
   * Get company loan statistics
   */
  static async getCompanyLoanStats(companyId: string) {
    const requests = await prisma.employeeRequest.findMany({
      where: {
        type: "loan",
        employee: { companyId },
      },
      include: {
        employee: { select: { id: true } },
      },
    });

    const stats = {
      totalRequests: requests.length,
      pendingLoans: requests.filter((r) => r.status === "pending").length,
      approvedLoans: requests.filter((r) => r.status === "approved").length,
      disbursedLoans: requests.filter((r) => r.status === "disbursed").length,
      completedLoans: requests.filter((r) => r.status === "completed").length,
      rejectedLoans: requests.filter((r) => r.status === "rejected").length,
      totalAmountRequested: requests.reduce(
        (sum, r) => sum + ((r.metadata as any)?.loanAmount || 0),
        0
      ),
      totalAmountActive: requests
        .filter((r) => r.status === "disbursed")
        .reduce(
          (sum, r) => sum + ((r.metadata as any)?.loanAmount || 0),
          0
        ),
    };

    return stats;
  }
}

export default EmployeeLoanService;
