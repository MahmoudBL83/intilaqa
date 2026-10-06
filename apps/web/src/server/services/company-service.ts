import { prisma } from "@intilaqa/db";
import type { Prisma } from "@intilaqa/db";

export type CompanyWithRelations = Prisma.CompanyGetPayload<{
  include: { client: { select: { id: true; name: true } }; departments: true; _count: { select: { employees: true } } };
}>;

export async function getCompanies(options?: { take?: number; skip?: number; search?: string; clientId?: string }) {
  const { take = 10, skip = 0, search, clientId } = options || {};
  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (clientId) where.clientId = clientId;
  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        departments: true,
        _count: { select: { employees: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);
  return { data, total };
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      departments: true,
      employees: true,
    },
  });
}

export async function createCompany(data: { name: string; clientId: string; address?: string; industry?: string }) {
  return prisma.company.create({ data });
}

export async function updateCompany(id: string, data: { name?: string; address?: string; industry?: string; isActive?: boolean }) {
  return prisma.company.update({ where: { id }, data });
}

export async function deleteCompany(id: string) {
  return prisma.company.delete({ where: { id } });
}

export async function getCompanyStats() {
  const [total, active] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { isActive: true } }),
  ]);
  return { total, active };
}

/**
 * Advanced filtering for companies with support for multiple criteria
 * Supports filtering by: name, industry, nitaqat color, active status
 */
export async function queryCompaniesAdvanced(options: {
  filters?: Array<{
    field: string;
    operator: string;
    value: string | number | boolean | string[];
  }>;
  logic?: "AND" | "OR";
  clientId?: string;
  take?: number;
  skip?: number;
}) {
  const { filters = [], logic = "AND", clientId, take = 20, skip = 0 } = options;

  const whereConditions: any[] = [];

  if (clientId) whereConditions.push({ clientId });

  filters.forEach((filter) => {
    switch (filter.field) {
      case "name":
        whereConditions.push({
          name: {
            contains: String(filter.value),
            mode: "insensitive",
          },
        });
        break;
      case "industry":
        whereConditions.push({
          industry: {
            contains: String(filter.value),
            mode: "insensitive",
          },
        });
        break;
      case "nitaqatColor":
        whereConditions.push({
          nitaqatColor: String(filter.value),
        });
        break;
      case "isActive":
        whereConditions.push({
          isActive: filter.value === true || filter.value === "true",
        });
        break;
      case "saudizationMin":
        whereConditions.push({
          saudizationPercent: { gte: Number(filter.value) },
        });
        break;
      case "saudizationMax":
        whereConditions.push({
          saudizationPercent: { lte: Number(filter.value) },
        });
        break;
    }
  });

  const where =
    whereConditions.length > 0
      ? logic === "OR"
        ? { OR: whereConditions }
        : { AND: whereConditions }
      : {};

  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        departments: true,
        _count: { select: { employees: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    data,
    total,
    page: Math.floor(skip / take) + 1,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  };
}
