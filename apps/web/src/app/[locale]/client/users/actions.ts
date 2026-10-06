"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import * as userService from "@/server/services/user-service";

const errorMap: Record<string, string> = {
  EMAIL_EXISTS: "emailExists",
  INVALID_COMPANY: "invalidCompany",
  INVALID_DEPARTMENT: "invalidDepartment",
  MISSING_COMPANY: "missingCompany",
  USER_NOT_FOUND: "userNotFound",
};

const allowedRoles = new Set(["company_admin", "employee"]);

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

async function getClientScope(userId: string) {
  return prisma.client.findFirst({ where: { userId }, select: { id: true, name: true } });
}

async function ensureCompanyInClient(companyId: string, clientId: string) {
  const company = await prisma.company.findFirst({ where: { id: companyId, clientId } });
  if (!company) throw new Error("INVALID_COMPANY");
}

async function ensureDepartmentInCompany(departmentId: string, companyId: string) {
  const department = await prisma.department.findFirst({ where: { id: departmentId, companyId } });
  if (!department) throw new Error("INVALID_DEPARTMENT");
}

export async function createClientUserAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect(`/${locale}/login`);

  const client = await getClientScope(userId);
  if (!client) redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const email = readText(formData.get("email"));
  const role = readText(formData.get("role")) || "employee";
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";
  const companyId = readOptionalId(formData.get("companyId"));
  const departmentId = readOptionalId(formData.get("departmentId"));

  if (!name || !email || !password || !allowedRoles.has(role)) {
    redirect(`/${locale}/client/users/new?error=missingFields`);
  }

  if (!companyId) {
    redirect(`/${locale}/client/users/new?error=missingCompany`);
  }

  try {
    await ensureCompanyInClient(companyId, client.id);
    if (departmentId) {
      await ensureDepartmentInCompany(departmentId, companyId);
    }

    await userService.createUser({
      name,
      email,
      role: role as "company_admin" | "employee",
      password,
      isActive,
      companyId,
      departmentId,
    });

    redirect(`/${locale}/client/users?created=1`);
  } catch (error) {
    const errorKey = getErrorKey(error);
    redirect(`/${locale}/client/users/new?error=${errorKey}`);
  }
}

export async function updateClientUserAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect(`/${locale}/login`);

  const client = await getClientScope(userId);
  if (!client) redirect(`/${locale}/login`);

  const targetUserId = readText(formData.get("userId"));
  const name = readText(formData.get("name"));
  const email = readText(formData.get("email"));
  const role = readText(formData.get("role")) || "employee";
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";
  const companyId = readOptionalId(formData.get("companyId"));
  const departmentId = readOptionalId(formData.get("departmentId"));

  if (!targetUserId) {
    redirect(`/${locale}/client/users?error=missingFields`);
  }

  if (!name || !email || !allowedRoles.has(role)) {
    redirect(`/${locale}/client/users/${targetUserId}?error=missingFields`);
  }

  if (!companyId) {
    redirect(`/${locale}/client/users/${targetUserId}?error=missingCompany`);
  }

  const scopedUser = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      employee: { company: { clientId: client.id } },
    },
  });

  if (!scopedUser) {
    redirect(`/${locale}/client/users/${targetUserId}?error=userNotFound`);
  }

  try {
    await ensureCompanyInClient(companyId, client.id);
    if (departmentId) {
      await ensureDepartmentInCompany(departmentId, companyId);
    }

    await userService.updateUser(targetUserId, {
      name,
      email,
      role: role as "company_admin" | "employee",
      password: password || undefined,
      isActive,
      companyId,
      departmentId,
    });

    redirect(`/${locale}/client/users/${targetUserId}?updated=1`);
  } catch (error) {
    const errorKey = getErrorKey(error);
    redirect(`/${locale}/client/users/${targetUserId}?error=${errorKey}`);
  }
}
