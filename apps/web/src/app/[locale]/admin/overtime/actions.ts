"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { revalidatePath } from "next/cache";

const allowedStatuses = new Set(["pending", "approved", "rejected"]);

function readText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function readNumber(value: FormDataEntryValue | null) {
  const text = readText(value);
  if (!text) return null;
  const numberValue = Number.parseFloat(text);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function readDate(value: FormDataEntryValue | null) {
  const text = readText(value);
  if (!text) return null;
  const dateValue = new Date(text);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
}

function getLocale(value: FormDataEntryValue | null) {
  const locale = readText(value);
  return locale || "ar";
}

function normalizeStatus(value: string) {
  return allowedStatuses.has(value) ? value : "pending";
}

export async function createOvertimeAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const employeeId = readText(formData.get("employeeId"));
  const dateValue = readDate(formData.get("date"));
  const hoursValue = readNumber(formData.get("hours"));
  const rateValue = readNumber(formData.get("rate"));
  const notesValue = readText(formData.get("notes"));
  const statusValue = normalizeStatus(readText(formData.get("status")));

  if (!employeeId || !dateValue || hoursValue === null) {
    redirect(`/${locale}/admin/overtime/new?error=missingFields`);
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true } });
  if (!employee) {
    redirect(`/${locale}/admin/overtime/new?error=invalidEmployee`);
  }

  try {
    await prisma.overtimeRecord.create({
      data: {
        employeeId,
        date: dateValue,
        hours: hoursValue,
        regularHours: 0,
        workedHours: hoursValue,
        overtimeHours: hoursValue,
        rate: rateValue ?? 1.5,
        status: statusValue,
        approvalStatus: statusValue,
        notes: notesValue || null,
      },
    });
  } catch (error) {
    redirect(`/${locale}/admin/overtime/new?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/overtime`, "layout");
  redirect(`/${locale}/admin/overtime?created=1`);
}

export async function updateOvertimeAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const employeeId = readText(formData.get("employeeId"));
  const dateValue = readDate(formData.get("date"));
  const hoursValue = readNumber(formData.get("hours"));
  const rateValue = readNumber(formData.get("rate"));
  const notesValue = readText(formData.get("notes"));
  const statusValue = normalizeStatus(readText(formData.get("status")));

  if (!employeeId || !dateValue || hoursValue === null) {
    redirect(`/${locale}/admin/overtime/${id}?error=missingFields`);
  }

  try {
    await prisma.overtimeRecord.update({
      where: { id },
      data: {
        date: dateValue,
        hours: hoursValue,
        regularHours: 0,
        workedHours: hoursValue,
        overtimeHours: hoursValue,
        rate: rateValue ?? 1.5,
        status: statusValue,
        approvalStatus: statusValue,
        notes: notesValue || null,
      },
    });
  } catch (error) {
    redirect(`/${locale}/admin/overtime/${id}?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/overtime`, "layout");
  redirect(`/${locale}/admin/overtime?updated=1`);
}

export async function setOvertimeStatusAction(id: string, status: "approved" | "rejected", formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const statusValue = normalizeStatus(status);

  try {
    await prisma.overtimeRecord.update({
      where: { id },
      data: { status: statusValue },
    });
  } catch (error) {
    redirect(`/${locale}/admin/overtime/${id}?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/overtime`, "layout");
  redirect(`/${locale}/admin/overtime?updated=1`);
}

export async function deleteOvertimeAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  try {
    await prisma.overtimeRecord.delete({ where: { id } });
  } catch (error) {
    redirect(`/${locale}/admin/overtime?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/overtime`, "layout");
  redirect(`/${locale}/admin/overtime`);
}
