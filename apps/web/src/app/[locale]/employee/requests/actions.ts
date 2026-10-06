"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@intilaqa/db";
import { auth } from "@intilaqa/auth";
import { createNotificationForRole } from "@/server/services/notification-service";

export async function createEmployeeRequest(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const userId = (session.user as { id?: string }).id;
    const employee = await prisma.employee.findFirst({ where: { userId } });
    if (!employee) return { success: false, error: "Employee not found" };

    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!type || !title || !startDate) return { success: false, error: "Missing required fields" };

    await prisma.employeeRequest.create({
      data: {
        type,
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: "pending",
        employeeId: employee.id,
      },
    });

    const requestTypeLabels: Record<string, { en: string; ar: string }> = {
      leave: { en: "leave", ar: "إجازة" },
      overtime: { en: "overtime", ar: "عمل إضافي" },
      permission: { en: "permission", ar: "إذن" },
      salary_letter: { en: "salary letter", ar: "خطاب راتب" },
      document: { en: "document", ar: "مستند" },
      other: { en: "other", ar: "أخرى" },
    };
    const typeLabel = requestTypeLabels[type] || { en: type, ar: type };

    await createNotificationForRole("company_admin", {
      title: "New Request",
      titleAr: "طلب جديد",
      titleEn: "New Request",
      message: `An employee submitted a new ${typeLabel.en} request: "${title}".`,
      messageAr: `قام موظف بتقديم طلب ${typeLabel.ar}: "${title}".`,
      messageEn: `An employee submitted a new ${typeLabel.en} request: "${title}".`,
      type: "info",
      relatedEntityType: "request",
    });

    revalidatePath("/employee/requests");
    return { success: true };
  } catch (e) {
    return { success: false, error: "An unexpected error occurred" };
  }
}
