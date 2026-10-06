"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@intilaqa/db";
import { auth } from "@intilaqa/auth";
import { createNotification } from "@/server/services/notification-service";

export async function createPayroll(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const locale = (formData.get("locale") as string) || "ar";
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);

  if (!month || !year || month < 1 || month > 12) throw new Error("Invalid month/year");

  const existing = await prisma.payrollRecord.findFirst({ where: { month, year } });
  if (existing) throw new Error("Payroll for this period already exists");

  const activeEmployees = await prisma.employee.findMany({
    where: { isActive: true },
    include: { user: { select: { name: true } } },
  });

  if (activeEmployees.length === 0) throw new Error("No active employees found");

  const totalSalary = activeEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);

  const record = await prisma.payrollRecord.create({
    data: {
      month,
      year,
      baseSalary: totalSalary,
      allowances: 0,
      deductions: 0,
      netPay: totalSalary,
      status: "draft",
      payslips: {
        create: activeEmployees.map((emp) => ({
          employeeId: emp.id,
          issuedAt: new Date(),
        })),
      },
    },
  });

  revalidatePath(`/${locale}/admin/payroll`);
  return { success: true, id: record.id };
}

export async function markPayrollAsPaid(id: string, locale?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const loc = locale || "ar";

  const record = await prisma.payrollRecord.findUnique({
    where: { id },
    include: { _count: { select: { payslips: true } } },
  });
  if (!record) throw new Error("Payroll record not found");
  if (record.status !== "draft") throw new Error("Payroll must be in draft status to mark as paid");

  await prisma.payrollRecord.update({
    where: { id },
    data: { status: "paid", paidAt: new Date() },
  });

  const payslips = await prisma.payslip.findMany({
    where: { payrollRecordId: id },
    include: { employee: { include: { user: true } } },
  });

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const recordData = await prisma.payrollRecord.findUnique({ where: { id } });

  for (const payslip of payslips) {
    if (payslip.employee?.user) {
      await createNotification({
        userId: payslip.employee.user.id,
        title: "Payslip Issued",
        message: `Your payslip for ${monthNames[recordData!.month - 1]} ${recordData!.year} is now available.`,
        type: "info",
        relatedEntityType: "payslip",
        relatedEntityId: payslip.id,
      });
    }
  }

  revalidatePath(`/${loc}/admin/payroll/${id}`);
  revalidatePath(`/${loc}/admin/payroll`);
}
