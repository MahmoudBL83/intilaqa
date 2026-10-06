"use server";

import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function readText(value: FormDataEntryValue | null) { if (typeof value !== "string") return ""; return value.trim(); }

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) { const l = readText(formData.get("locale")) || "ar"; redirect(`/${l}/login`); }
  const userId = (session.user as { id?: string }).id;
  if (!userId) { const l = readText(formData.get("locale")) || "ar"; redirect(`/${l}/login`); }

  const name = readText(formData.get("name"));
  const nationality = readText(formData.get("nationality"));
  const position = readText(formData.get("position"));

  if (name) await prisma.user.update({ where: { id: userId }, data: { name } });

  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (employee) {
    const updateData: Record<string, string> = {};
    if (nationality) updateData.nationality = nationality;
    if (position) updateData.position = position;
    if (Object.keys(updateData).length > 0) await prisma.employee.update({ where: { id: employee.id }, data: updateData });
  }

  revalidatePath("/employee/profile", "layout");
}
