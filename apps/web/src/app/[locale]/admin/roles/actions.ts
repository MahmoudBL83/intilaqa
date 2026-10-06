"use server";

import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createRoleAction(formData: FormData) {
  const session = await auth();
  const locale = (formData.get("locale") as string) || "en";
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissionIds = formData.getAll("permissions") as string[];

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.role.create({
    data: {
      name,
      description,
      permissions: {
        create: permissionIds.map((id) => ({
          permission: { connect: { id } },
        })),
      },
    },
  });

  revalidatePath("/(admin)/admin/roles", "layout");
  redirect(`/${locale}/admin/roles?created=1`);
}

export async function updateRoleAction(id: string, formData: FormData) {
  const session = await auth();
  const locale = (formData.get("locale") as string) || "en";
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissionIds = formData.getAll("permissions") as string[];

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.rolePermission.deleteMany({
    where: { roleId: id },
  });

  await prisma.role.update({
    where: { id },
    data: {
      name,
      description,
      permissions: {
        create: permissionIds.map((pid) => ({
          permission: { connect: { id: pid } },
        })),
      },
    },
  });

  revalidatePath("/(admin)/admin/roles", "layout");
  redirect(`/${locale}/admin/roles?updated=1`);
}

export async function deleteRoleAction(id: string, formData?: FormData) {
  const session = await auth();
  const locale = formData ? (formData.get("locale") as string) || "en" : "en";
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  await prisma.role.delete({ where: { id } });
  revalidatePath("/(admin)/admin/roles", "layout");
}
