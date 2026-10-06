import { prisma } from "@intilaqa/db";
import type { Prisma } from "@intilaqa/db";

export type PayslipWithRelations = Prisma.PayslipGetPayload<{
  include: {
    payrollRecord: true;
    employee: { include: { user: true } };
  };
}>;

export type PayslipListOptions = {
  take?: number;
  skip?: number;
  search?: string;
  employeeId?: string;
};

export async function getPayslips({
  take = 10,
  skip = 0,
  search,
  employeeId,
}: PayslipListOptions = {}): Promise<[PayslipWithRelations[], number]> {
  const where: Prisma.PayslipWhereInput = {};
  if (search) {
    where.employee = { user: { name: { contains: search, mode: "insensitive" } } };
  }
  if (employeeId) {
    where.employeeId = employeeId;
  }

  return Promise.all([
    prisma.payslip.findMany({
      where,
      take,
      skip,
      orderBy: { issuedAt: "desc" },
      include: {
        payrollRecord: true,
        employee: { include: { user: true } },
      },
    }),
    prisma.payslip.count({ where }),
  ]);
}

export async function getPayslipById(id: string) {
  return prisma.payslip.findUnique({
    where: { id },
    include: {
      payrollRecord: true,
      employee: { include: { user: true, department: true } },
    },
  });
}
