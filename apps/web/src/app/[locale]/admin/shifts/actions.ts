"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { revalidatePath } from "next/cache";

function readText(value: FormDataEntryValue | null) { if (typeof value !== "string") return ""; return value.trim(); }
function readNum(value: FormDataEntryValue | null) { const n = parseInt(readText(value)); return isNaN(n) ? 0 : n; }
function getLocale(value: FormDataEntryValue | null) { const locale = readText(value); return locale || "ar"; }

export async function createShiftAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const type = readText(formData.get("type")) || "fixed";
  const startTime = readText(formData.get("startTime"));
  const endTime = readText(formData.get("endTime"));
  const workingDays = readNum(formData.get("workingDays")) || 5;
  const breakMinutes = readNum(formData.get("breakMinutes")) || 60;
  const companyId = readText(formData.get("companyId")) || null;
  const isActive = formData.get("isActive") === "true";

  if (!name || !startTime || !endTime) redirect(`/${locale}/admin/shifts/new?error=missingFields`);

  try {
    await prisma.shift.create({ data: { name, type, startTime, endTime, workingDays, breakMinutes, companyId, isActive } });
  } catch { redirect(`/${locale}/admin/shifts/new?error=unknown`); }

  revalidatePath(`/${locale}/admin/shifts`, "layout");
  redirect(`/${locale}/admin/shifts?created=1`);
}

export async function updateShiftAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const type = readText(formData.get("type")) || "fixed";
  const startTime = readText(formData.get("startTime"));
  const endTime = readText(formData.get("endTime"));
  const workingDays = readNum(formData.get("workingDays")) || 5;
  const breakMinutes = readNum(formData.get("breakMinutes")) || 60;
  const companyId = readText(formData.get("companyId")) || null;
  const isActive = formData.get("isActive") === "true";

  if (!name || !startTime || !endTime) redirect(`/${locale}/admin/shifts/${id}?error=missingFields`);

  try {
    await prisma.shift.update({ where: { id }, data: { name, type, startTime, endTime, workingDays, breakMinutes, companyId, isActive } });
  } catch { redirect(`/${locale}/admin/shifts/${id}?error=unknown`); }

  revalidatePath(`/${locale}/admin/shifts`, "layout");
  redirect(`/${locale}/admin/shifts?updated=1`);
}

export async function deleteShiftAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  try { await prisma.shift.delete({ where: { id } }); } catch { redirect(`/${locale}/admin/shifts?error=unknown`); }

  revalidatePath(`/${locale}/admin/shifts`, "layout");
  redirect(`/${locale}/admin/shifts`);
}
