"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import * as userService from "@/server/services/user-service";

const errorMap: Record<string, string> = {
  EMAIL_EXISTS: "emailExists",
  INVALID_CLIENT: "invalidClient",
  CLIENT_ASSIGNED: "clientAssigned",
  INVALID_COMPANY: "invalidCompany",
  INVALID_DEPARTMENT: "invalidDepartment",
  MISSING_CLIENT: "missingClient",
  MISSING_COMPANY: "missingCompany",
  USER_NOT_FOUND: "userNotFound",
};

const roles = new Set(["admin", "client", "company_admin", "employee"]);

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

export async function createUserAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const authUser = session?.user as { id?: string; role?: string };
  if (!authUser?.id || authUser.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const email = readText(formData.get("email"));
  const role = readText(formData.get("role"));
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";
  const clientId = readOptionalId(formData.get("clientId"));
  const companyId = readOptionalId(formData.get("companyId"));
  const departmentId = readOptionalId(formData.get("departmentId"));

  if (!name || !email || !role || !password || !roles.has(role)) {
    redirect(`/${locale}/admin/users/new?error=missingFields`);
  }

  try {
    await userService.createUser({
      name,
      email,
      role: role as "admin" | "client" | "company_admin" | "employee",
      password,
      isActive,
      clientId,
      companyId,
      departmentId,
    });
    redirect(`/${locale}/admin/users?created=1`);
  } catch (error) {
    const errorKey = getErrorKey(error);
    redirect(`/${locale}/admin/users/new?error=${errorKey}`);
  }
}

export async function updateUserAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const authUser = session?.user as { id?: string; role?: string };
  if (!authUser?.id || authUser.role !== "admin") redirect(`/${locale}/login`);

  const userId = readText(formData.get("userId"));
  const name = readText(formData.get("name"));
  const email = readText(formData.get("email"));
  const role = readText(formData.get("role"));
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";
  const clientId = readOptionalId(formData.get("clientId"));
  const companyId = readOptionalId(formData.get("companyId"));
  const departmentId = readOptionalId(formData.get("departmentId"));

  if (!userId) {
    redirect(`/${locale}/admin/users?error=missingFields`);
  }

  if (!name || !email || !role || !roles.has(role)) {
    redirect(`/${locale}/admin/users/${userId}?error=missingFields`);
  }

  try {
    await userService.updateUser(userId, {
      name,
      email,
      role: role as "admin" | "client" | "company_admin" | "employee",
      password: password || undefined,
      isActive,
      clientId,
      companyId,
      departmentId,
    });
    redirect(`/${locale}/admin/users/${userId}?updated=1`);
  } catch (error) {
    const errorKey = getErrorKey(error);
    redirect(`/${locale}/admin/users/${userId}?error=${errorKey}`);
  }
}
