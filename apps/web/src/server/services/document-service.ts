import { prisma } from "@intilaqa/db";

export interface DocumentExpiryInfo {
  id: string;
  name: string;
  type: string;
  url?: string;
  expiryDate?: Date;
  daysUntilExpiry?: number;
  severity: "critical" | "warning" | "normal";
  entityType: "company" | "employee";
  entityName: string;
  entityId: string;
}

/**
 * Document Service
 * Handles document management, expiry tracking, and compliance checks
 */
export class DocumentService {
  /**
   * Get documents with expiry information
   */
  static async getDocumentsWithExpiry(
    companyId?: string,
    employeeId?: string
  ): Promise<DocumentExpiryInfo[]> {
    const documents = await prisma.document.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(employeeId && { employeeId }),
      },
      include: {
        company: { select: { id: true, name: true } },
        employee: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { expiryDate: "asc" },
    });

    const today = new Date();

    return documents.map((doc) => {
      let daysUntilExpiry = undefined;
      let severity: "critical" | "warning" | "normal" = "normal";

      if (doc.expiryDate) {
        daysUntilExpiry = Math.ceil(
          (doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 0) severity = "critical";
        else if (daysUntilExpiry <= 30) severity = "critical";
        else if (daysUntilExpiry <= 60) severity = "warning";
      }

      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        expiryDate: doc.expiryDate || undefined,
        daysUntilExpiry,
        severity,
        entityType: doc.companyId ? "company" : "employee",
        entityName: doc.company?.name || doc.employee?.user?.name || "Unknown",
        entityId: doc.companyId || doc.employeeId || "",
      };
    });
  }

  /**
   * Get documents expiring within specified days
   */
  static async getExpiringDocuments(
    days: number = 30,
    companyId?: string,
    employeeId?: string
  ) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const documents = await prisma.document.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        status: { not: "expired" },
        ...(companyId && { companyId }),
        ...(employeeId && { employeeId }),
      },
      include: {
        company: { select: { id: true, name: true } },
        employee: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { expiryDate: "asc" },
    });

    return documents;
  }

  /**
   * Advanced document filtering with support for multiple criteria
   * Supports filtering by: type, expiry date, status, entity
   */
  static async queryDocumentsAdvanced(options: {
    filters?: Array<{
      field: string;
      operator: string;
      value: string | number | boolean | string[];
    }>;
    logic?: "AND" | "OR";
    companyId?: string;
    employeeId?: string;
    take?: number;
    skip?: number;
  }) {
    const { filters = [], logic = "AND", companyId, employeeId, take = 20, skip = 0 } = options;

    const whereConditions: any[] = [];

    if (companyId) whereConditions.push({ companyId });
    if (employeeId) whereConditions.push({ employeeId });

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
        case "expiryDateFrom":
          whereConditions.push({
            expiryDate: { gte: new Date(String(filter.value)) },
          });
          break;
        case "expiryDateTo":
          whereConditions.push({
            expiryDate: { lte: new Date(String(filter.value)) },
          });
          break;
        case "expiringSoon":
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          whereConditions.push({
            expiryDate: {
              lte: thirtyDaysFromNow,
              gte: new Date(),
            },
          });
          break;
        case "expired":
          whereConditions.push({
            expiryDate: { lt: new Date() },
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
      prisma.document.findMany({
        where,
        take,
        skip,
        orderBy: { expiryDate: "asc" },
        include: {
          company: { select: { id: true, name: true } },
          employee: { select: { id: true, user: { select: { name: true } } } },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Create or update a document
   */
  static async upsertDocument(data: {
    id?: string;
    name: string;
    type: string;
    url: string;
    status?: string;
    expiryDate?: Date;
    companyId?: string;
    employeeId?: string;
  }) {
    if (data.id) {
      return prisma.document.update({
        where: { id: data.id },
        data,
      });
    }

    return prisma.document.create({ data });
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string) {
    return prisma.document.delete({ where: { id } });
  }

  /**
   * Mark document as expired
   */
  static async markAsExpired(id: string) {
    return prisma.document.update({
      where: { id },
      data: { status: "expired" },
    });
  }
}
