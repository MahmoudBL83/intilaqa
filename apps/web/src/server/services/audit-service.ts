import { prisma } from "@intilaqa/db";
import type { Prisma } from "@intilaqa/db";

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  const data: Prisma.AuditLogCreateInput = {
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
  };
  if (params.userId) data.user = { connect: { id: params.userId } };
  if (params.changes) data.changes = params.changes as Prisma.InputJsonValue;
  if (params.ip) data.ip = params.ip;
  if (params.userAgent) data.userAgent = params.userAgent;

  await prisma.auditLog.create({ data });
}

export async function getAuditLogs(params: {
  take?: number;
  skip?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;
  if (params.entityType) where.entityType = params.entityType;
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) (where.createdAt as Record<string, Date>).gte = params.startDate;
    if (params.endDate) (where.createdAt as Record<string, Date>).lte = params.endDate;
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: params.take || 20,
      skip: params.skip || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total };
}
