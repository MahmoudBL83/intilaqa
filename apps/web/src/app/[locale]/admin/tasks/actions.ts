"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { revalidatePath } from "next/cache";

function readText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getLocale(value: FormDataEntryValue | null) {
  const locale = readText(value);
  return locale || "ar";
}

function readDate(value: FormDataEntryValue | null) {
  const text = readText(value);
  if (!text) return null;
  const dateValue = new Date(text);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
}

export async function createTaskAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const title = readText(formData.get("title"));
  const description = readText(formData.get("description"));
  const employeeId = readText(formData.get("employeeId"));
  const status = readText(formData.get("status")) || "todo";
  const priority = readText(formData.get("priority")) || "medium";
  const dueDate = readDate(formData.get("dueDate"));

  if (!title) {
    redirect(`/${locale}/admin/tasks/new?error=missingFields`);
  }

  try {
    await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority,
        status,
        dueDate,
        employeeId: employeeId || null,
      },
    });
  } catch (error) {
    redirect(`/${locale}/admin/tasks/new?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/tasks`, "layout");
  redirect(`/${locale}/admin/tasks?created=1`);
}

export async function updateTaskAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const title = readText(formData.get("title"));
  const description = readText(formData.get("description"));
  const employeeId = readText(formData.get("employeeId"));
  const status = readText(formData.get("status")) || "todo";
  const priority = readText(formData.get("priority")) || "medium";
  const dueDate = readDate(formData.get("dueDate"));

  if (!title) {
    redirect(`/${locale}/admin/tasks/${id}?error=missingFields`);
  }

  try {
    await prisma.task.update({
      where: { id },
      data: {
        title,
        description: description || null,
        priority,
        status,
        dueDate,
        employeeId: employeeId || null,
      },
    });
  } catch (error) {
    redirect(`/${locale}/admin/tasks/${id}?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/tasks`, "layout");
  redirect(`/${locale}/admin/tasks?updated=1`);
}

export async function deleteTaskAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  try {
    await prisma.task.delete({ where: { id } });
  } catch (error) {
    redirect(`/${locale}/admin/tasks?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/tasks`, "layout");
  redirect(`/${locale}/admin/tasks`);
}
