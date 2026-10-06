"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import * as userService from "@/server/services/user-service";

const errorMap: Record<string, string> = {
  EMAIL_EXISTS: "emailExists",
  INVALID_DEPARTMENT: "invalidDepartment",
  USER_NOT_FOUND: "userNotFound",
};

function readText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function readOptionalId(value: FormDataEntryValue | null) {
  const text = readText(value);
  return text ? text : undefined;
}

function getLocale(value: FormDataEntryValue | null) {
  const locale = readText(value);
  return locale || "ar";
}

function getErrorKey(error: unknown) {
  if (error instanceof Error) {
    return errorMap[error.message] || "unknown";
  }
  return "unknown";
}

async function getCompanyScope(userId: string) {
  return prisma.employee.findFirst({
    where: { userId },
    include: { company: { select: { id: true, name: true } } },
  });
}

async function ensureDepartmentInCompany(departmentId: string, companyId: string) {
  const department = await prisma.department.findFirst({ where: { id: departmentId, companyId } });
  if (!department) throw new Error("INVALID_DEPARTMENT");
}

export async function createCompanyUserAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect(`/${locale}/login`);

  const employee = await getCompanyScope(userId);
  if (!employee?.companyId) redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const email = readText(formData.get("email"));
  const role = readText(formData.get("role")) || "employee";
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";
  const departmentId = readOptionalId(formData.get("departmentId"));

  if (!name || !email || !password || role !== "employee") {
    redirect(`/${locale}/company/users/new?error=missingFields`);
  }

  try {
    if (departmentId) {
      await ensureDepartmentInCompany(departmentId, employee.companyId);
    }

    await userService.createUser({
      name,
      email,
      role: "employee",
      password,
      isActive,
      companyId: employee.companyId,
      departmentId,
    });

    redirect(`/${locale}/company/users?created=1`);
  } catch (error) {
    const errorKey = getErrorKey(error);
    redirect(`/${locale}/company/users/new?error=${errorKey}`);
  }
}

export async function updateCompanyUserAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect(`/${locale}/login`);

  const employee = await getCompanyScope(userId);
  if (!employee?.companyId) redirect(`/${locale}/login`);

  const targetUserId = readText(formData.get("userId"));
  const name = readText(formData.get("name"));
  const email = readText(formData.get("email"));
  const role = readText(formData.get("role")) || "employee";
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";
  const departmentId = readOptionalId(formData.get("departmentId"));

  if (!targetUserId) {
    redirect(`/${locale}/company/users?error=missingFields`);
  }

  if (!name || !email || role !== "employee") {
    redirect(`/${locale}/company/users/${targetUserId}?error=missingFields`);
  }

  const scopedUser = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      employee: { companyId: employee.companyId },
    },
  });

  if (!scopedUser) {
    redirect(`/${locale}/company/users/${targetUserId}?error=userNotFound`);
  }

  try {
    if (departmentId) {
      await ensureDepartmentInCompany(departmentId, employee.companyId);
    }

    await userService.updateUser(targetUserId, {
      name,
      email,
      role: "employee",
      password: password || undefined,
      isActive,
      companyId: employee.companyId,
      departmentId,
    });

    redirect(`/${locale}/company/users/${targetUserId}?updated=1`);
  } catch (error) {
    const errorKey = getErrorKey(error);
    redirect(`/${locale}/company/users/${targetUserId}?error=${errorKey}`);
  }
}
