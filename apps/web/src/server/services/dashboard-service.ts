import { prisma } from "@intilaqa/db";

/**
 * Dashboard Statistics Service
 * Provides KPI and metric data for dashboards
 */

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  saudiEmployees: number;
  expatEmployees: number;
  saudizationPercentage: number;
  targetSaudizationPercentage: number;
  totalDepartments: number;
  averageSalary: number;
  totalPayroll: number;
}

export interface AttendanceStats {
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onTimeToday: number;
  attendancePercentage: number;
  presentWeek: number;
  absentWeek: number;
  attendancePercentageWeek: number;
}

export interface PayrollStats {
  pendingPayroll: number;
  processedPayroll: number;
  paidPayroll: number;
  totalPayrollAmount: number;
  averageNetPay: number;
  overtimeHours: number;
}

export interface ComplianceStats {
  totalDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
  pendingViolations: number;
  appliedViolations: number;
  complianceScore: number;
}

export interface LoanStats {
  totalRequests: number;
  pendingLoans: number;
  approvedLoans: number;
  disbursedLoans: number;
  totalAmountRequested: number;
  totalAmountActive: number;
}

export class DashboardService {
  /**
   * Get overall company dashboard stats
   */
  static async getCompanyDashboardStats(
    companyId: string
  ): Promise<DashboardStats> {
    const [
      totalEmployees,
      activeEmployees,
      saudiEmployees,
      departments,
      salaries,
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId } }),
      prisma.employee.count({
        where: { companyId, isActive: true },
      }),
      prisma.employee.count({
        where: { companyId, isSaudi: true },
      }),
      prisma.department.findMany({
        where: { companyId },
        select: { id: true },
      }),
      prisma.employee.findMany({
        where: { companyId },
        select: { salary: true },
      }),
    ]);

    const inactiveEmployees = totalEmployees - activeEmployees;
    const expatEmployees = totalEmployees - saudiEmployees;
    const saudizationPercentage =
      totalEmployees > 0
        ? Math.round((saudiEmployees / totalEmployees) * 100)
        : 0;

    const totalSalary = salaries.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary =
      totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      saudiEmployees,
      expatEmployees,
      saudizationPercentage,
      targetSaudizationPercentage: 75, // Default target
      totalDepartments: departments.length,
      averageSalary,
      totalPayroll: totalSalary,
    };
  }

  /**
   * Get attendance statistics for date range
   */
  static async getAttendanceStats(
    companyId: string,
    days: number = 1
  ): Promise<AttendanceStats> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        employee: { companyId },
        date: { gte: startDate, lte: now },
      },
      select: { status: true },
    });

    const totalRecords = records.length;
    const presentToday = records.filter((r) => r.status === "present").length;
    const absentToday = records.filter((r) => r.status === "absent").length;
    const lateToday = records.filter((r) => r.status === "late").length;
    const onTimeToday = records.filter((r) => r.status === "on-time").length;

    const attendancePercentage =
      totalRecords > 0 ? Math.round(((presentToday + onTimeToday) / totalRecords) * 100) : 0;

    return {
      presentToday,
      absentToday,
      lateToday,
      onTimeToday,
      attendancePercentage,
      presentWeek: presentToday,
      absentWeek: absentToday,
      attendancePercentageWeek: attendancePercentage,
    };
  }

  /**
   * Get payroll statistics
   */
  static async getPayrollStats(companyId: string): Promise<PayrollStats> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const payrollRecords = await prisma.payrollRecord.findMany({
      where: { companyId },
      select: { status: true, netPay: true },
    });

    const pending = payrollRecords.filter((r) => r.status === "pending").length;
    const processed = payrollRecords.filter((r) => r.status === "processed").length;
    const paid = payrollRecords.filter((r) => r.status === "paid").length;

    const totalNetPay = payrollRecords.reduce((sum, p) => sum + p.netPay, 0);
    const averageNetPay =
      payrollRecords.length > 0
        ? Math.round(totalNetPay / payrollRecords.length)
        : 0;

    // Note: Overtime tracking is not yet implemented in AttendanceRecord schema
    const overtimeHours = 0;

    return {
      pendingPayroll: pending,
      processedPayroll: processed,
      paidPayroll: paid,
      totalPayrollAmount: totalNetPay,
      averageNetPay,
      overtimeHours: Math.round(overtimeHours),
    };
  }

  /**
   * Get compliance statistics
   */
  static async getComplianceStats(companyId: string): Promise<ComplianceStats> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalDocuments,
      expiringDocuments,
      expiredDocuments,
      violations,
    ] = await Promise.all([
      prisma.document.count({ where: { companyId } }),
      prisma.document.count({
        where: {
          companyId,
          expiryDate: { gte: now, lte: thirtyDaysFromNow },
        },
      }),
      prisma.document.count({
        where: {
          companyId,
          expiryDate: { lt: now },
        },
      }),
      prisma.employeeViolation.findMany({
        where: { employee: { companyId } },
        select: { status: true },
      }),
    ]);

    const pendingViolations = violations.filter((v) => v.status === "pending").length;
    const appliedViolations = violations.filter((v) => v.status === "applied").length;

    const complianceScore = Math.max(
      0,
      100 - (expiringDocuments + expiredDocuments) * 5 - pendingViolations * 3
    );

    return {
      totalDocuments,
      expiringDocuments,
      expiredDocuments,
      pendingViolations,
      appliedViolations,
      complianceScore: Math.min(100, complianceScore),
    };
  }

  /**
   * Get loan statistics
   */
  static async getLoanStats(companyId: string): Promise<LoanStats> {
    const requests = await prisma.employeeRequest.findMany({
      where: {
        employee: { companyId },
        type: "loan",
      },
      select: { status: true, metadata: true },
    });

    const totalRequests = requests.length;
    const pendingLoans = requests.filter((r) => r.status === "pending").length;
    const approvedLoans = requests.filter((r) => r.status === "approved").length;
    const disbursedLoans = requests.filter((r) => r.status === "disbursed").length;

    let totalAmountRequested = 0;
    let totalAmountActive = 0;

    requests.forEach((req) => {
      const amount = (req.metadata as any)?.loanAmount || 0;
      totalAmountRequested += amount;

      if (req.status === "approved" || req.status === "disbursed") {
        totalAmountActive += amount;
      }
    });

    return {
      totalRequests,
      pendingLoans,
      approvedLoans,
      disbursedLoans,
      totalAmountRequested,
      totalAmountActive,
    };
  }

  /**
   * Get employee dashboard stats (personal metrics)
   */
  static async getEmployeeDashboardStats(
    employeeId: string
  ): Promise<{
    attendance: AttendanceStats;
    loans: LoanStats;
    documents: { total: number; expiring: number; expired: number };
  }> {
    const [attendance, loans, documents] = await Promise.all([
      this.getAttendanceStatsForEmployee(employeeId),
      this.getLoanStatsForEmployee(employeeId),
      this.getDocumentStatsForEmployee(employeeId),
    ]);

    return { attendance, loans, documents };
  }

  /**
   * Get attendance stats for single employee
   */
  private static async getAttendanceStatsForEmployee(
    employeeId: string
  ): Promise<AttendanceStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: startOfMonth, lte: now },
      },
      select: { status: true },
    });

    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const onTime = records.filter((r) => r.status === "on-time").length;

    const total = records.length;
    const percentage =
      total > 0 ? Math.round(((present + onTime) / total) * 100) : 0;

    return {
      presentToday: present,
      absentToday: absent,
      lateToday: late,
      onTimeToday: onTime,
      attendancePercentage: percentage,
      presentWeek: present,
      absentWeek: absent,
      attendancePercentageWeek: percentage,
    };
  }

  /**
   * Get loan stats for single employee
   */
  private static async getLoanStatsForEmployee(
    employeeId: string
  ): Promise<LoanStats> {
    const requests = await prisma.employeeRequest.findMany({
      where: { employeeId, type: "loan" },
      select: { status: true, metadata: true },
    });

    let totalAmount = 0;
    let activeAmount = 0;

    requests.forEach((req) => {
      const amount = (req.metadata as any)?.loanAmount || 0;
      totalAmount += amount;
      if (req.status === "disbursed") activeAmount += amount;
    });

    return {
      totalRequests: requests.length,
      pendingLoans: requests.filter((r) => r.status === "pending").length,
      approvedLoans: requests.filter((r) => r.status === "approved").length,
      disbursedLoans: requests.filter((r) => r.status === "disbursed").length,
      totalAmountRequested: totalAmount,
      totalAmountActive: activeAmount,
    };
  }

  /**
   * Get document stats for single employee
   */
  private static async getDocumentStatsForEmployee(
    employeeId: string
  ): Promise<{ total: number; expiring: number; expired: number }> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, expiring, expired] = await Promise.all([
      prisma.document.count({ where: { employeeId } }),
      prisma.document.count({
        where: {
          employeeId,
          expiryDate: { gte: now, lte: thirtyDaysFromNow },
        },
      }),
      prisma.document.count({
        where: { employeeId, expiryDate: { lt: now } },
      }),
    ]);

    return { total, expiring, expired };
  }

  /**
   * Get department statistics
   */
  static async getDepartmentStats(departmentId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    saudiEmployees: number;
    expatEmployees: number;
    averageSalary: number;
    attendancePercentage: number;
  }> {
    const [employees, attendance] = await Promise.all([
      prisma.employee.findMany({
        where: { departmentId },
        select: { isActive: true, isSaudi: true, salary: true },
      }),
      prisma.attendanceRecord.findMany({
        where: { employee: { departmentId } },
        select: { status: true },
      }),
    ]);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.isActive).length;
    const saudiEmployees = employees.filter((e) => e.isSaudi).length;
    const expatEmployees = totalEmployees - saudiEmployees;

    const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const averageSalary =
      totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

    const present = attendance.filter(
      (r) => r.status === "present" || r.status === "on-time"
    ).length;
    const attendancePercentage =
      attendance.length > 0
        ? Math.round((present / attendance.length) * 100)
        : 0;

    return {
      totalEmployees,
      activeEmployees,
      saudiEmployees,
      expatEmployees,
      averageSalary,
      attendancePercentage,
    };
  }
}

export default DashboardService;
