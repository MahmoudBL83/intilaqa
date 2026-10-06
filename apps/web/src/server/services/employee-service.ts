import { prisma } from "@intilaqa/db";
import type { Prisma } from "@intilaqa/db";

export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: { select: { id: true; email: true; name: true } };
    company: { select: { id: true; name: true } };
    department: { select: { id: true; name: true } };
  };
}>;

export async function getEmployees(options?: { take?: number; skip?: number; search?: string; companyId?: string; departmentId?: string }) {
  const { take = 10, skip = 0, search, companyId, departmentId } = options || {};
  const where: Record<string, unknown> = {};
  if (search) where.user = { name: { contains: search, mode: "insensitive" } };
  if (companyId) where.companyId = companyId;
  if (departmentId) where.departmentId = departmentId;
  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);
  return { data, total };
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      company: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      attendanceRecords: true,
      requests: true,
      payslips: true,
      tasks: true,
    },
  });
}

export async function createEmployee(data: { userId: string; companyId: string; departmentId?: string; position?: string; salary?: number; employeeId?: string }) {
  return prisma.employee.create({ data: { ...data, joinDate: new Date() } });
}

export async function updateEmployee(id: string, data: { position?: string; salary?: number; departmentId?: string; isActive?: boolean }) {
  return prisma.employee.update({ where: { id }, data });
}

export async function deleteEmployee(id: string) {
  return prisma.employee.delete({ where: { id } });
}

export async function getEmployeeStats() {
  const [total, payrollSum] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.aggregate({ _sum: { salary: true } }),
  ]);
  return { total, monthlyPayroll: payrollSum._sum.salary || 0 };
}

/**
 * Advanced filtering for employees with support for multiple criteria and AND/OR logic
 * Supports filtering by: name, email, status, salary range, hire date, nationality, saudization
 */
export async function queryEmployeesAdvanced(options: {
  filters?: Array<{
    field: string;
    operator: string;
    value: string | number | boolean | string[];
  }>;
  logic?: "AND" | "OR";
  companyId?: string;
  departmentId?: string;
  take?: number;
  skip?: number;
}) {
  const { filters = [], logic = "AND", companyId, departmentId, take = 20, skip = 0 } = options;

  const whereConditions: any[] = [];

  // Add company and department filters
  if (companyId) whereConditions.push({ companyId });
  if (departmentId) whereConditions.push({ departmentId });

  // Process custom filters
  filters.forEach((filter) => {
    switch (filter.field) {
      case "name":
        whereConditions.push({
          user: {
            name: {
              contains: String(filter.value),
              mode: "insensitive",
            },
          },
        });
        break;
      case "email":
        whereConditions.push({
          user: {
            email: {
              contains: String(filter.value),
              mode: "insensitive",
            },
          },
        });
        break;
      case "position":
        whereConditions.push({
          position: {
            contains: String(filter.value),
            mode: "insensitive",
          },
        });
        break;
      case "isActive":
        whereConditions.push({ isActive: filter.value === true || filter.value === "true" });
        break;
      case "isSaudi":
        whereConditions.push({ isSaudi: filter.value === true || filter.value === "true" });
        break;
      case "nationality":
        whereConditions.push({
          nationality: {
            contains: String(filter.value),
            mode: "insensitive",
          },
        });
        break;
      case "salaryMin":
        whereConditions.push({ salary: { gte: Number(filter.value) } });
        break;
      case "salaryMax":
        whereConditions.push({ salary: { lte: Number(filter.value) } });
        break;
      case "joinDateFrom":
        whereConditions.push({ joinDate: { gte: new Date(String(filter.value)) } });
        break;
      case "joinDateTo":
        whereConditions.push({ joinDate: { lte: new Date(String(filter.value)) } });
        break;
      case "contractExpiringSoon":
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        whereConditions.push({
          contractEndDate: {
            lte: thirtyDaysFromNow,
            gte: new Date(),
          },
        });
        break;
    }
  });

  // Combine conditions with AND/OR logic
  const where =
    whereConditions.length > 0
      ? logic === "OR"
        ? { OR: whereConditions }
        : { AND: whereConditions }
      : {};

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    data,
    total,
    page: Math.floor(skip / take) + 1,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  };
}
