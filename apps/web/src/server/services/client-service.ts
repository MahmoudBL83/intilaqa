import { prisma } from "@intilaqa/db";
import type { Prisma } from "@intilaqa/db";

export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: { companies: { select: { id: true; name: true } }; subscriptions: { include: { plan: { select: { name: true } } } } };
}>;

export async function getClients(options?: { take?: number; skip?: number; search?: string }) {
  const { take = 10, skip = 0, search } = options || {};
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        companies: { select: { id: true, name: true } },
        subscriptions: {
          where: { status: "active" },
          take: 1,
          include: { plan: { select: { name: true } } },
        },
      },
    }),
    prisma.client.count({ where }),
  ]);
  return { data, total };
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      companies: true,
      subscriptions: { include: { plan: true } },
    },
  });
}

export async function createClient(data: { name: string; domain?: string; contactEmail: string }) {
  return prisma.client.create({ data });
}

export async function updateClient(id: string, data: { name?: string; domain?: string; contactEmail?: string; isActive?: boolean }) {
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}

export async function getClientStats() {
  const [total, active, suspended] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true } }),
    prisma.client.count({ where: { isActive: false } }),
  ]);
  return { total, active, suspended };
}
