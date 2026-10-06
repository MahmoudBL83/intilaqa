import { prisma } from "@intilaqa/db";
import type { Prisma } from "@intilaqa/db";
import { hash } from "bcryptjs";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    client: { select: { id: true; name: true } };
    employee: {
      include: {
        company: { select: { id: true; name: true } };
        department: { select: { id: true; name: true } };
      };
    };
  };
}>;

export type UserCreateInput = {
  name: string;
  email: string;
  role: "admin" | "client" | "company_admin" | "employee";
  password: string;
  isActive?: boolean;
  clientId?: string;
  companyId?: string;
  departmentId?: string;
};

export type UserUpdateInput = {
  name?: string;
  email?: string;
  role?: "admin" | "client" | "company_admin" | "employee";
  password?: string;
  isActive?: boolean;
  clientId?: string;
  companyId?: string;
  departmentId?: string;
};

export type UserListOptions = {
  take?: number;
  skip?: number;
  search?: string;
  role?: string;
  roles?: string[];
  status?: "active" | "inactive";
  clientId?: string;
  companyId?: string;
};

const companyRoles = new Set(["company_admin", "employee"]);

async function ensureClientAssignable(tx: Prisma.TransactionClient, clientId: string, userId?: string) {
  const client = await tx.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("INVALID_CLIENT");
  if (client.userId && client.userId !== userId) {
    throw new Error("CLIENT_ASSIGNED");
  }
  return client;
}

async function ensureCompanyExists(tx: Prisma.TransactionClient, companyId: string) {
  const company = await tx.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error("INVALID_COMPANY");
  return company;
}

async function ensureDepartmentInCompany(
  tx: Prisma.TransactionClient,
  departmentId: string,
  companyId: string
) {
  const department = await tx.department.findFirst({
    where: { id: departmentId, companyId },
  });
  if (!department) throw new Error("INVALID_DEPARTMENT");
  return department;
}

async function clearClientAssignment(tx: Prisma.TransactionClient, userId: string) {
  await tx.client.updateMany({ where: { userId }, data: { userId: null } });
}

async function clearEmployeeAssignment(tx: Prisma.TransactionClient, userId: string) {
  await tx.employee.deleteMany({ where: { userId } });
}

async function syncUserRelations(
  tx: Prisma.TransactionClient,
  userId: string,
  role: string,
  scope: { clientId?: string; companyId?: string; departmentId?: string }
) {
  if (role === "client") {
    if (!scope.clientId) throw new Error("MISSING_CLIENT");
    await ensureClientAssignable(tx, scope.clientId, userId);
    await clearClientAssignment(tx, userId);
    await clearEmployeeAssignment(tx, userId);
    await tx.client.update({ where: { id: scope.clientId }, data: { userId } });
    return;
  }

  if (companyRoles.has(role)) {
    if (!scope.companyId) throw new Error("MISSING_COMPANY");
    await ensureCompanyExists(tx, scope.companyId);
    if (scope.departmentId) {
      await ensureDepartmentInCompany(tx, scope.departmentId, scope.companyId);
    }

    await clearClientAssignment(tx, userId);

    const existingEmployee = await tx.employee.findUnique({ where: { userId } });
    if (existingEmployee) {
      await tx.employee.update({
        where: { userId },
        data: {
          companyId: scope.companyId,
          departmentId: scope.departmentId ?? null,
          isActive: true,
        },
      });
    } else {
      await tx.employee.create({
        data: {
          userId,
          companyId: scope.companyId,
          departmentId: scope.departmentId ?? null,
          joinDate: new Date(),
        },
      });
    }
    return;
  }

  await clearClientAssignment(tx, userId);
  await clearEmployeeAssignment(tx, userId);
}

export async function getUsers(options?: UserListOptions) {
  const { take = 10, skip = 0, search, role, roles, status, clientId, companyId } = options || {};
  const filters: Prisma.UserWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (roles?.length) {
    filters.push({ role: { in: roles } });
  } else if (role) {
    filters.push({ role });
  }
  if (status) filters.push({ isActive: status === "active" });

  if (clientId) {
    filters.push({
      OR: [
        { client: { id: clientId } },
        { employee: { company: { clientId } } },
      ],
    });
  }

  if (companyId) {
    filters.push({ employee: { companyId } });
  }

  const where: Prisma.UserWhereInput = filters.length ? { AND: filters } : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        employee: {
          include: {
            company: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      employee: {
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function createUser(input: UserCreateInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error("EMAIL_EXISTS");

    const passwordHash = await hash(input.password, 10);
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        passwordHash,
        isActive: input.isActive ?? true,
      },
    });

    await syncUserRelations(tx, user.id, input.role, {
      clientId: input.clientId,
      companyId: input.companyId,
      departmentId: input.departmentId,
    });

    return user;
  });
}

export async function updateUser(id: string, input: UserUpdateInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id } });
    if (!existing) throw new Error("USER_NOT_FOUND");

    if (input.email && input.email !== existing.email) {
      const emailTaken = await tx.user.findUnique({ where: { email: input.email } });
      if (emailTaken) throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = input.password ? await hash(input.password, 10) : undefined;
    const nextRole = input.role ?? existing.role;

    const user = await tx.user.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        email: input.email ?? existing.email,
        role: nextRole,
        isActive: input.isActive ?? existing.isActive,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await syncUserRelations(tx, user.id, nextRole, {
      clientId: input.clientId,
      companyId: input.companyId,
      departmentId: input.departmentId,
    });

    return user;
  });
}
