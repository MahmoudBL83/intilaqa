import { prisma } from "@intilaqa/db";

export interface PayrollCalculationInput {
  baseSalary: number;
  allowances: number;
  absenceDeduction: number;
  lateDeduction: number;
  violationDeduction: number;
  otherDeductions: number;
}

export interface PayrollCalculationResult {
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculatePayrollItem(input: PayrollCalculationInput): PayrollCalculationResult {
  const grossSalary = input.baseSalary + input.allowances;
  const totalDeductions =
    input.absenceDeduction +
    input.lateDeduction +
    input.violationDeduction +
    input.otherDeductions;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}

export async function createPayrollRun(companyId: string, payrollMonth: string) {
  const employees = await prisma.employee.findMany({
    where: { companyId, isActive: true },
  });

  if (employees.length === 0) {
    throw new Error("No active employees found in this company");
  }

  // Calculate items for each employee
  const items = employees.map((emp) => {
    const baseSalary = emp.salary;
    const allowances = 0;
    const absenceDeduction = 0;
    const lateDeduction = 0;
    const violationDeduction = 0;
    const otherDeductions = 0;

    const calc = calculatePayrollItem({
      baseSalary,
      allowances,
      absenceDeduction,
      lateDeduction,
      violationDeduction,
      otherDeductions,
    });

    return {
      employeeId: emp.id,
      baseSalary,
      allowances,
      absenceDeduction,
      lateDeduction,
      violationDeduction,
      otherDeductions,
      grossSalary: calc.grossSalary,
      totalDeductions: calc.totalDeductions,
      netSalary: calc.netSalary,
    };
  });

  const totalGross = items.reduce((s, i) => s + i.grossSalary, 0);
  const totalDeductions = items.reduce((s, i) => s + i.totalDeductions, 0);
  const totalNet = items.reduce((s, i) => s + i.netSalary, 0);

  return prisma.payrollRun.create({
    data: {
      companyId,
      payrollMonth,
      status: "draft",
      totalGross: Math.round(totalGross * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      items: {
        create: items.map((i) => ({
          employeeId: i.employeeId,
          baseSalary: i.baseSalary,
          allowances: i.allowances,
          absenceDeduction: i.absenceDeduction,
          lateDeduction: i.lateDeduction,
          violationDeduction: i.violationDeduction,
          otherDeductions: i.otherDeductions,
          grossSalary: i.grossSalary,
          totalDeductions: i.totalDeductions,
          netSalary: i.netSalary,
        })),
      },
    },
    include: {
      items: {
        include: {
          employee: {
            select: { id: true, employeeId: true, position: true, isSaudi: true, user: { select: { name: true } } },
          },
        },
      },
    },
  });
}

export async function getPayrollRuns(companyId: string) {
  return prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });
}

export async function getPayrollRun(id: string) {
  return prisma.payrollRun.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      items: {
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              position: true,
              isSaudi: true,
              nationality: true,
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updatePayrollRunStatus(
  id: string,
  status: "draft" | "calculated" | "approved" | "exported" | "paid"
) {
  const data: any = { status };
  if (status === "approved") data.approvedAt = new Date();
  if (status === "paid") data.paidAt = new Date();

  return prisma.payrollRun.update({
    where: { id },
    data,
  });
}

export async function recalculatePayrollRun(runId: string) {
  const run = await prisma.payrollRun.findUnique({
    where: { id: runId },
    include: { items: true },
  });
  if (!run) throw new Error("Payroll run not found");

  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  for (const item of run.items) {
    const calc = calculatePayrollItem({
      baseSalary: item.baseSalary,
      allowances: item.allowances,
      absenceDeduction: item.absenceDeduction,
      lateDeduction: item.lateDeduction,
      violationDeduction: item.violationDeduction,
      otherDeductions: item.otherDeductions,
    });

    await prisma.payrollItem.update({
      where: { id: item.id },
      data: {
        grossSalary: calc.grossSalary,
        totalDeductions: calc.totalDeductions,
        netSalary: calc.netSalary,
      },
    });

    totalGross += calc.grossSalary;
    totalDeductions += calc.totalDeductions;
    totalNet += calc.netSalary;
  }

  return prisma.payrollRun.update({
    where: { id: runId },
    data: {
      status: "calculated",
      totalGross: Math.round(totalGross * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
    },
  });
}

export function generateWpsExportData(items: Array<{
  employee: { employeeId: string | null; isSaudi: boolean };
  baseSalary: number;
  allowances: number;
  totalDeductions: number;
  netSalary: number;
}>) {
  return items.map((item) => ({
    employeeId: item.employee.employeeId || "",
    baseSalary: item.baseSalary,
    allowances: item.allowances,
    deductions: item.totalDeductions,
    netSalary: item.netSalary,
  }));
}

export function generateMudadExportData(items: Array<{
  employee: { employeeId: string | null; isSaudi: boolean };
  baseSalary: number;
  netSalary: number;
}>) {
  return items.map((item) => ({
    employeeId: item.employee.employeeId || "",
    isSaudi: item.employee.isSaudi,
    baseSalary: item.baseSalary,
    netSalary: item.netSalary,
  }));
}

export class PayrollEngine {
  static readonly SOCIAL_SECURITY_RATE = 0.1023;
  static readonly HOURLY_RATE_FACTOR = 1 / 176;

  static calculatePayrollItem = calculatePayrollItem;
  static createPayrollRun = createPayrollRun;
  static getPayrollRuns = getPayrollRuns;
  static getPayrollRun = getPayrollRun;
  static updatePayrollRunStatus = updatePayrollRunStatus;
  static recalculatePayrollRun = recalculatePayrollRun;
  static generateWpsExportData = generateWpsExportData;
  static generateMudadExportData = generateMudadExportData;

  static async queryPayrollAdvanced(options: {
    filters?: Array<{ field: string; operator: string; value: string | number | boolean | string[] }>;
    logic?: "AND" | "OR";
    companyId?: string;
    take?: number;
    skip?: number;
  }) {
    const { filters = [], logic = "AND", companyId, take = 20, skip = 0 } = options;
    const whereConditions: any[] = [];
    if (companyId) whereConditions.push({ companyId });

    filters.forEach((filter) => {
      switch (filter.field) {
        case "month":
        case "year":
          if (filter.field === "month") whereConditions.push({ payrollMonth: { contains: `-${String(filter.value).padStart(2, "0")}` } });
          if (filter.field === "year") whereConditions.push({ payrollMonth: { startsWith: String(filter.value) } });
          break;
        case "status":
          whereConditions.push({ status: String(filter.value) });
          break;
        case "totalNetMin":
          whereConditions.push({ totalNet: { gte: Number(filter.value) } });
          break;
        case "totalNetMax":
          whereConditions.push({ totalNet: { lte: Number(filter.value) } });
          break;
      }
    });

    const where = whereConditions.length > 0
      ? logic === "OR" ? { OR: whereConditions } : { AND: whereConditions }
      : {};

    const [data, total] = await Promise.all([
      prisma.payrollRun.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.payrollRun.count({ where }),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take, totalPages: Math.ceil(total / take) };
  }
}
