import { prisma } from "@intilaqa/db";

export interface AttendanceReport {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  monthlyAttendance: { month: string; present: number; absent: number; late: number; total: number }[];
}

export interface PayrollReport {
  totalPayroll: number;
  totalDeductions: number;
  totalAllowances: number;
  averageSalary: number;
  monthlyPayroll: { month: string; gross: number; deductions: number; net: number }[];
  departmentBreakdown: { department: string; totalSalary: number; employeeCount: number }[];
}

export interface ComplianceReport {
  totalDocuments: number;
  expired: number;
  expiring30: number;
  expiring60: number;
  valid: number;
  byType: { type: string; count: number; expired: number }[];
}

export interface EmployeeReport {
  total: number;
  active: number;
  saudi: number;
  expat: number;
  byDepartment: { department: string; count: number }[];
  byNationality: { nationality: string; count: number }[];
}

export interface DashboardSummary {
  attendance: AttendanceReport;
  payroll: PayrollReport;
  compliance: ComplianceReport;
  employees: EmployeeReport;
}

export async function getAttendanceReport(companyId: string): Promise<AttendanceReport> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalEmployees, todayRecords] = await Promise.all([
    prisma.employee.count({ where: { companyId, isActive: true } }),
    prisma.attendanceRecord.findMany({
      where: {
        employee: { companyId },
        date: { gte: today, lt: tomorrow },
      },
    }),
  ]);

  const presentToday = todayRecords.filter((r) => r.status === "present").length;
  const absentToday = todayRecords.filter((r) => r.status === "absent").length;
  const lateToday = todayRecords.filter((r) => r.status === "late").length;
  const onLeaveToday = todayRecords.filter((r) => r.status === "on_leave").length;

  // Monthly attendance for past 6 months
  const monthlyData: AttendanceReport["monthlyAttendance"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const records = await prisma.attendanceRecord.findMany({
      where: {
        employee: { companyId },
        date: { gte: d, lte: end },
      },
    });
    const total = records.length;
    monthlyData.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
      total,
    });
  }

  return { totalEmployees, presentToday, absentToday, lateToday, onLeaveToday, monthlyAttendance: monthlyData };
}

export async function getPayrollReport(companyId: string): Promise<PayrollReport> {
  const employees = await prisma.employee.findMany({
    where: { companyId, isActive: true },
    select: { salary: true, departmentId: true, department: { select: { name: true } } },
  });

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const averageSalary = employees.length > 0 ? totalPayroll / employees.length : 0;

  // Department breakdown
  const deptMap = new Map<string, { totalSalary: number; employeeCount: number }>();
  for (const emp of employees) {
    const deptName = emp.department?.name ?? "Unassigned";
    const existing = deptMap.get(deptName) || { totalSalary: 0, employeeCount: 0 };
    existing.totalSalary += emp.salary;
    existing.employeeCount += 1;
    deptMap.set(deptName, existing);
  }
  const departmentBreakdown = Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    ...data,
  }));

  // Monthly payroll from PayrollRun
  const runs = await prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const monthlyPayroll = runs.reverse().map((r) => ({
    month: r.payrollMonth,
    gross: r.totalGross,
    deductions: r.totalDeductions,
    net: r.totalNet,
  }));

  return {
    totalPayroll,
    totalDeductions: runs.reduce((s, r) => s + r.totalDeductions, 0),
    totalAllowances: 0,
    averageSalary: Math.round(averageSalary * 100) / 100,
    monthlyPayroll,
    departmentBreakdown,
  };
}

export async function getComplianceReport(companyId: string): Promise<ComplianceReport> {
  const documents = await prisma.complianceDocument.findMany({
    where: { companyId },
  });

  const now = new Date();
  let expired = 0, expiring30 = 0, expiring60 = 0, valid = 0;

  for (const doc of documents) {
    if (!doc.expiryDate) { valid++; continue; }
    const daysLeft = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) expired++;
    else if (daysLeft <= 30) expiring30++;
    else if (daysLeft <= 60) expiring60++;
    else valid++;
  }

  const typeMap = new Map<string, { count: number; expired: number }>();
  for (const doc of documents) {
    const existing = typeMap.get(doc.type) || { count: 0, expired: 0 };
    existing.count++;
    if (doc.expiryDate && doc.expiryDate <= now) existing.expired++;
    typeMap.set(doc.type, existing);
  }

  return {
    totalDocuments: documents.length,
    expired, expiring30, expiring60, valid,
    byType: Array.from(typeMap.entries()).map(([type, data]) => ({ type, ...data })),
  };
}

export async function getEmployeeReport(companyId: string): Promise<EmployeeReport> {
  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: { department: { select: { name: true } } },
  });

  const total = employees.length;
  const active = employees.filter((e) => e.isActive).length;
  const saudi = employees.filter((e) => e.isSaudi).length;
  const expat = total - saudi;

  const deptMap = new Map<string, number>();
  const natMap = new Map<string, number>();
  for (const emp of employees) {
    const dept = emp.department?.name ?? "Unassigned";
    deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    const nat = emp.nationality || "Unknown";
    natMap.set(nat, (natMap.get(nat) || 0) + 1);
  }

  return {
    total, active, saudi, expat,
    byDepartment: Array.from(deptMap.entries()).map(([department, count]) => ({ department, count })),
    byNationality: Array.from(natMap.entries()).map(([nationality, count]) => ({ nationality, count })),
  };
}

export async function getFullDashboardSummary(companyId: string): Promise<DashboardSummary> {
  const [attendance, payroll, compliance, employees] = await Promise.all([
    getAttendanceReport(companyId),
    getPayrollReport(companyId),
    getComplianceReport(companyId),
    getEmployeeReport(companyId),
  ]);
  return { attendance, payroll, compliance, employees };
}
