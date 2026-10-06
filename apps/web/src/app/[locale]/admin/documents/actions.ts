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

export async function createDocumentAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const type = readText(formData.get("type"));
  const url = readText(formData.get("url"));
  const status = readText(formData.get("status")) || "active";
  const expiryDate = readDate(formData.get("expiryDate"));

  if (!name || !type || !url) {
    redirect(`/${locale}/admin/documents/new?error=missingFields`);
  }

  try {
    await prisma.document.create({
      data: {
        name,
        type,
        url,
        status,
        expiryDate,
      },
    });
  } catch (error) {
    redirect(`/${locale}/admin/documents/new?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/documents`, "layout");
  redirect(`/${locale}/admin/documents?created=1`);
}

export async function updateDocumentAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const type = readText(formData.get("type"));
  const url = readText(formData.get("url"));
  const status = readText(formData.get("status")) || "active";
  const expiryDate = readDate(formData.get("expiryDate"));

  if (!name || !type || !url) {
    redirect(`/${locale}/admin/documents/${id}?error=missingFields`);
  }

  try {
    await prisma.document.update({
      where: { id },
      data: {
        name,
        type,
        url,
        status,
        expiryDate,
      },
    });
  } catch (error) {
    redirect(`/${locale}/admin/documents/${id}?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/documents`, "layout");
  redirect(`/${locale}/admin/documents?updated=1`);
}

export async function deleteDocumentAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  try {
    await prisma.document.delete({ where: { id } });
  } catch (error) {
    redirect(`/${locale}/admin/documents?error=unknown`);
  }

  revalidatePath(`/${locale}/admin/documents`, "layout");
  redirect(`/${locale}/admin/documents`);
}
