import { prisma } from "@intilaqa/db";

export interface DeductionResult {
  employeeId: string;
  totalDeduction: number;
  deductionType: "PERCENTAGE" | "FIXED";
  violations: Array<{
    policyId: string;
    policyName: string;
    deduction: number;
    count: number;
  }>;
}

/**
 * Violations Engine
 * Handles automatic deduction calculations based on company-defined violation policies
 * Supports both fixed amount and percentage-based deductions
 */
export class ViolationsEngine {
  /**
   * Calculate total deductions for an employee based on recorded violations
   */
  static async calculateEmployeeDeductions(
    employeeId: string,
    month?: number,
    year?: number
  ): Promise<DeductionResult> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const firstDay = new Date(targetYear, targetMonth - 1, 1);
    const lastDay = new Date(targetYear, targetMonth, 0);

    // Get employee details for percentage calculations
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { salary: true, companyId: true },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Get all violations for the employee in the period
    const violations = await prisma.employeeViolation.findMany({
      where: {
        employeeId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
        status: "applied", // Only count applied violations
      },
      include: {
        policy: true,
      },
    });

    // Group violations by policy
    const violationsByPolicy = new Map<
      string,
      {
        policy: (typeof violations)[0]["policy"];
        count: number;
      }
    >();

    violations.forEach((v) => {
      const key = v.policy.id;
      const existing = violationsByPolicy.get(key);
      if (existing) {
        existing.count++;
      } else {
        violationsByPolicy.set(key, { policy: v.policy, count: 1 });
      }
    });

    // Calculate deductions
    let totalDeduction = 0;
    const deductionDetails: DeductionResult["violations"] = [];

    violationsByPolicy.forEach(({ policy, count }) => {
      let deduction = 0;

      if (policy.deductionType === "PERCENTAGE") {
        deduction = (employee.salary * policy.deductionValue * count) / 100;
      } else if (policy.deductionType === "FIXED") {
        deduction = policy.deductionValue * count;
      }

      totalDeduction += deduction;

      deductionDetails.push({
        policyId: policy.id,
        policyName: policy.name,
        deduction,
        count,
      });
    });

    // Determine deduction type from the violations
    let deductionType: "PERCENTAGE" | "FIXED" = "PERCENTAGE";
    if (deductionDetails.length > 0) {
      // Check the first violation's policy type
      const firstViolation = violations[0];
      if (firstViolation && (firstViolation.policy.deductionType === "PERCENTAGE" || firstViolation.policy.deductionType === "FIXED")) {
        deductionType = firstViolation.policy.deductionType;
      }
    }

    return {
      employeeId,
      totalDeduction: Math.round(totalDeduction * 100) / 100,
      deductionType,
      violations: deductionDetails,
    };
  }

  /**
   * Calculate deductions for all employees in a company
   */
  static async calculateCompanyDeductions(
    companyId: string,
    month?: number,
    year?: number
  ): Promise<DeductionResult[]> {
    const employees = await prisma.employee.findMany({
      where: { companyId },
      select: { id: true },
    });

    const results = await Promise.all(
      employees.map((emp) =>
        this.calculateEmployeeDeductions(emp.id, month, year)
      )
    );

    return results.filter((r) => r.totalDeduction > 0);
  }

  /**
   * Get deduction summary for a department
   */
  static async getDepartmentDeductionSummary(
    departmentId: string,
    month?: number,
    year?: number
  ): Promise<{
    totalDeductions: number;
    averageDeductionPerEmployee: number;
    employeeCount: number;
    topViolations: Array<{
      policyName: string;
      occurrences: number;
      totalDeduction: number;
    }>;
  }> {
    const employees = await prisma.employee.findMany({
      where: { departmentId },
      select: { id: true },
    });

    const deductions = await Promise.all(
      employees.map((emp) => this.calculateEmployeeDeductions(emp.id, month, year))
    );

    const totalDeductions = deductions.reduce(
      (sum, d) => sum + d.totalDeduction,
      0
    );
    const averageDeductionPerEmployee =
      employees.length > 0 ? totalDeductions / employees.length : 0;

    // Aggregate violations
    const violationMap = new Map<
      string,
      { occurrences: number; totalDeduction: number }
    >();

    deductions.forEach((d) => {
      d.violations.forEach((v) => {
        const existing = violationMap.get(v.policyName) || {
          occurrences: 0,
          totalDeduction: 0,
        };
        existing.occurrences += v.count;
        existing.totalDeduction += v.deduction;
        violationMap.set(v.policyName, existing);
      });
    });

    const topViolations = Array.from(violationMap.entries())
      .map(([policyName, data]) => ({
        policyName,
        ...data,
      }))
      .sort((a, b) => b.totalDeduction - a.totalDeduction)
      .slice(0, 10); // Top 10

    return {
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      averageDeductionPerEmployee:
        Math.round(averageDeductionPerEmployee * 100) / 100,
      employeeCount: employees.length,
      topViolations,
    };
  }

  /**
   * Get detailed violation report for an employee
   */
  static async getEmployeeViolationReport(
    employeeId: string,
    month?: number,
    year?: number
  ): Promise<{
    employee: {
      id: string;
      name: string;
      employeeId: string;
      position: string;
      salary: number;
    };
    violations: Array<{
      date: Date;
      policyName: string;
      deductionAmount: number;
      status: "pending" | "applied";
    }>;
    summary: {
      totalViolations: number;
      totalDeduction: number;
      averageDeductionPerViolation: number;
    };
  }> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const firstDay = new Date(targetYear, targetMonth - 1, 1);
    const lastDay = new Date(targetYear, targetMonth, 0);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        salary: true,
        position: true,
        employeeId: true,
        user: { select: { name: true } },
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const violations = await prisma.employeeViolation.findMany({
      where: {
        employeeId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      include: { policy: true },
      orderBy: { date: "desc" },
    });

    const violationDetails = violations.map((v) => {
      let deductionAmount = 0;
      if (v.policy.deductionType === "PERCENTAGE") {
        deductionAmount = (employee.salary * v.policy.deductionValue) / 100;
      } else if (v.policy.deductionType === "FIXED") {
        deductionAmount = v.policy.deductionValue;
      }

      return {
        date: v.date,
        policyName: v.policy.name,
        deductionAmount,
        status: v.status as "pending" | "applied",
      };
    });

    const totalDeduction = violationDetails.reduce(
      (sum, v) => sum + v.deductionAmount,
      0
    );

    return {
      employee: {
        id: employee.id,
        name: employee.user.name || "",
        employeeId: employee.employeeId || "",
        position: employee.position || "",
        salary: employee.salary || 0,
      },
      violations: violationDetails,
      summary: {
        totalViolations: violations.length,
        totalDeduction: Math.round(totalDeduction * 100) / 100,
        averageDeductionPerViolation:
          violations.length > 0
            ? Math.round((totalDeduction / violations.length) * 100) / 100
            : 0,
      },
    };
  }

  /**
   * Record a violation for an employee
   */
  static async recordViolation(
    employeeId: string,
    policyId: string,
    date?: Date,
    notes?: string
  ): Promise<void> {
    // Validate policy belongs to the employee's company
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const policy = await prisma.violationPolicy.findFirst({
      where: { id: policyId, companyId: employee.companyId },
    });

    if (!policy) {
      throw new Error("Violation policy not found for this company");
    }

    // Create the violation record
    await prisma.employeeViolation.create({
      data: {
        employeeId,
        policyId,
        date: date || new Date(),
        status: "pending", // Start as pending, must be approved to apply
        notes,
      },
    });
  }

  /**
   * Approve a violation to apply the deduction
   */
  static async approveViolation(violationId: string): Promise<void> {
    await prisma.employeeViolation.update({
      where: { id: violationId },
      data: { status: "applied" },
    });
  }

  /**
   * Reject a violation (no deduction applied)
   */
  static async rejectViolation(violationId: string): Promise<void> {
    await prisma.employeeViolation.delete({
      where: { id: violationId },
    });
  }

  /**
   * Get company violation policies
   */
  static async getCompanyViolationPolicies(companyId: string) {
    return prisma.violationPolicy.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Create a new violation policy for a company
   */
  static async createViolationPolicy(
    companyId: string,
    name: string,
    description: string,
    deductionType: "PERCENTAGE" | "FIXED",
    deductionValue: number
  ) {
    return prisma.violationPolicy.create({
      data: {
        name,
        description,
        deductionType,
        deductionValue,
        companyId,
      },
    });
  }

  /**
   * Get pending violations for a company (awaiting approval)
   */
  static async getPendingViolations(companyId: string) {
    return prisma.employeeViolation.findMany({
      where: {
        status: "pending",
        employee: { companyId },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            user: { select: { name: true } },
          },
        },
        policy: true,
      },
      orderBy: { date: "desc" },
    });
  }
}

export default ViolationsEngine;
