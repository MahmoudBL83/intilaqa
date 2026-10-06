"use server";

import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as userService from "@/server/services/user-service";

const errorMap: Record<string, string> = {
  EMAIL_EXISTS: "emailExists",
  MISSING_COMPANY: "missingCompany",
  INVALID_COMPANY: "invalidCompany",
  INVALID_DEPARTMENT: "invalidDepartment",
};

export async function createEmployeeAction(formData: FormData) {
  const session = await auth();
  const locale = (formData.get("locale") as string) || "en";
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyId = formData.get("companyId") as string;
  const departmentId = formData.get("departmentId") as string;
  const employeeId = formData.get("employeeId") as string;
  const position = formData.get("position") as string;
  const salaryStr = formData.get("salary") as string;

  if (!name || !email || !password || !companyId) {
    redirect(`/${locale}/admin/employees/new?error=missingFields`);
  }

  try {
    const user = await userService.createUser({
      name,
      email,
      password,
      role: "employee",
      companyId: companyId,
      departmentId: departmentId || undefined,
    });

    // A completely new User with 'employee' role triggers the creation of an Employee record via syncUserRelations
    // Now we must update that new Employee record with HR specifics
    await prisma.employee.update({
      where: { userId: user.id },
      data: {
        employeeId: employeeId || undefined,
        position: position || undefined,
        salary: salaryStr ? parseFloat(salaryStr) : 0,
      },
    });

    revalidatePath(`/${locale}/admin/employees`, "layout");
    redirect(`/${locale}/admin/employees?created=1`);
  } catch (err: any) {
    const errorKey = errorMap[err.message] || "unknown";
    redirect(`/${locale}/admin/employees/new?error=${errorKey}`);
  }
}
export async function updateEmployeeAction(id: string, formData: FormData) {
  const session = await auth();
  const locale = (formData.get("locale") as string) || "en";
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyId = formData.get("companyId") as string;
  const departmentId = formData.get("departmentId") as string;
  const employeeId = formData.get("employeeId") as string;
  const position = formData.get("position") as string;
  const salaryStr = formData.get("salary") as string;
  const isActive = formData.get("isActive") !== "false";

  if (!name || !email || !companyId) {
    redirect(`/${locale}/admin/employees?error=missingFields`);
  }

  try {
    const employee = await prisma.employee.findUnique({ where: { id }, select: { userId: true } });
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");

    await userService.updateUser(employee.userId, {
      name,
      email,
      password: password || undefined,
      companyId: companyId,
      departmentId: departmentId || undefined,
      isActive,
    });

    await prisma.employee.update({
      where: { id },
      data: {
        employeeId: employeeId || undefined,
        position: position || undefined,
        salary: salaryStr ? parseFloat(salaryStr) : 0,
        isActive,
      },
    });

    revalidatePath(`/${locale}/admin/employees`, "layout");
    redirect(`/${locale}/admin/employees?updated=1`);
  } catch (err: any) {
    const errorKey = errorMap[err.message] || "unknown";
    redirect(`/${locale}/admin/employees?error=${errorKey}`);
  }
}

export async function deleteEmployeeAction(id: string, formData: FormData) {
  const session = await auth();
  const locale = (formData.get("locale") as string) || "en";
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (employee) {
    // Delete user will cascade delete employee according to our schema setup
    // But schema says Employee has relation onDelete: Cascade. 
    // Wait, let's just delete the user, and Employee is deleted via cascade
    await prisma.user.delete({ where: { id: employee.userId } });
  }

  revalidatePath(`/${locale}/admin/employees`, "layout");
}
