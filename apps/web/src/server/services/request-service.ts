import { prisma } from "@intilaqa/db";
import { createNotification } from "./notification-service";

async function notifyOnRequestStatusChange(requestId: string, status: string) {
  const request = await prisma.employeeRequest.findUnique({
    where: { id: requestId },
    include: { employee: { include: { user: true } } },
  });
  if (!request?.employee?.user) return;

  const title = status === "approved" ? "Request Approved" : "Request Rejected";
  const message = `Your request "${request.title}" has been ${status}.`;
  const type = status === "approved" ? "approval" : "rejection";

  await createNotification({
    userId: request.employee.user.id,
    title,
    message,
    type,
    relatedEntityType: "request",
    relatedEntityId: request.id,
  });
}

export async function getRequests(options?: { take?: number; skip?: number; employeeId?: string; type?: string; status?: string }) {
  const { take = 10, skip = 0, employeeId, type, status } = options || {};
  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (type) where.type = type;
  if (status) where.status = status;
  const [data, total] = await Promise.all([
    prisma.employeeRequest.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: { employee: { include: { user: { select: { name: true } } } } },
    }),
    prisma.employeeRequest.count({ where }),
  ]);
  return { data, total };
}

export async function getPendingRequestCount() {
  return prisma.employeeRequest.count({ where: { status: "pending" } });
}

export async function approveRequest(id: string) {
  const result = await prisma.employeeRequest.update({ where: { id }, data: { status: "approved" } });
  await notifyOnRequestStatusChange(id, "approved");
  return result;
}

export async function rejectRequest(id: string) {
  const result = await prisma.employeeRequest.update({ where: { id }, data: { status: "rejected" } });
  await notifyOnRequestStatusChange(id, "rejected");
  return result;
}

/**
 * Advanced filtering for employee requests with support for multiple criteria
 * Supports filtering by: title, type, status, date range, employee
 */
export async function queryRequestsAdvanced(options: {
  filters?: Array<{
    field: string;
    operator: string;
    value: string | number | boolean | string[];
  }>;
  logic?: "AND" | "OR";
  employeeId?: string;
  companyId?: string;
  take?: number;
  skip?: number;
}) {
  const { filters = [], logic = "AND", employeeId, companyId, take = 20, skip = 0 } = options;

  const whereConditions: any[] = [];

  // Add basic filters
  if (employeeId) whereConditions.push({ employeeId });

  // Process custom filters
  filters.forEach((filter) => {
    switch (filter.field) {
      case "title":
        whereConditions.push({
          title: {
            contains: String(filter.value),
            mode: "insensitive",
          },
        });
        break;
      case "type":
        whereConditions.push({
          type: String(filter.value),
        });
        break;
      case "status":
        whereConditions.push({
          status: String(filter.value),
        });
        break;
      case "reason":
        whereConditions.push({
          reason: {
            contains: String(filter.value),
            mode: "insensitive",
          },
        });
        break;
      case "createdDateFrom":
        whereConditions.push({
          createdAt: { gte: new Date(String(filter.value)) },
        });
        break;
      case "createdDateTo":
        whereConditions.push({
          createdAt: { lte: new Date(String(filter.value)) },
        });
        break;
      case "startDateFrom":
        whereConditions.push({
          startDate: { gte: new Date(String(filter.value)) },
        });
        break;
      case "startDateTo":
        whereConditions.push({
          startDate: { lte: new Date(String(filter.value)) },
        });
        break;
    }
  });

  // Combine conditions
  const where: any =
    whereConditions.length > 0
      ? logic === "OR"
        ? { OR: whereConditions }
        : { AND: whereConditions }
      : {};

  if (companyId) {
    // Filter by company employees
    if (where.OR || where.AND) {
      // If we already have conditions, add company filter to all of them
      const conditions = where.OR || where.AND;
      conditions.forEach((cond: any) => {
        cond.employee = { companyId };
      });
    } else {
      // Simple case: just add the employee company filter
      where.employee = { companyId };
    }
  }

  const [data, total] = await Promise.all([
    prisma.employeeRequest.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            company: { select: { name: true } },
          },
        },
      },
    }),
    prisma.employeeRequest.count({ where }),
  ]);

  return {
    data,
    total,
    page: Math.floor(skip / take) + 1,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  };
}
