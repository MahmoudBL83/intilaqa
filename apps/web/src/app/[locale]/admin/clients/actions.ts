"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { hash } from "bcryptjs";

function readText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getLocale(value: FormDataEntryValue | null) {
  const locale = readText(value);
  return locale || "ar";
}

export async function createClientAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const domain = readText(formData.get("domain"));
  const contactEmail = readText(formData.get("contactEmail"));
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";

  if (!name || !contactEmail || !password) {
    redirect(`/${locale}/admin/clients/new?error=missingFields`);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: contactEmail.toLowerCase() },
    });

    if (existingUser) {
      redirect(`/${locale}/admin/clients/new?error=emailExists`);
    }

    const hashedPassword = await hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: contactEmail.toLowerCase(),
          passwordHash: hashedPassword,
          role: "client",
          isActive,
        },
      });

      await tx.client.create({
        data: {
          name,
          domain: domain || null,
          contactEmail: contactEmail.toLowerCase(),
          isActive,
          userId: newUser.id,
        },
      });
    });

    redirect(`/${locale}/admin/clients?created=1`);
  } catch {
    redirect(`/${locale}/admin/clients/new?error=unknown`);
  }
}

export async function updateClientAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const clientId = readText(formData.get("clientId"));
  const name = readText(formData.get("name"));
  const domain = readText(formData.get("domain"));
  const contactEmail = readText(formData.get("contactEmail"));
  const password = readText(formData.get("password"));
  const isActive = readText(formData.get("isActive")) !== "false";

  if (!clientId || !name || !contactEmail) {
    redirect(`/${locale}/admin/clients/${clientId}?error=missingFields`);
  }

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!existingClient) {
      redirect(`/${locale}/admin/clients/${clientId}?error=notFound`);
    }

    if (contactEmail.toLowerCase() !== existingClient.contactEmail) {
      const checkUser = await prisma.user.findUnique({
        where: { email: contactEmail.toLowerCase() },
      });
      if (checkUser && checkUser.id !== existingClient.userId) {
        redirect(`/${locale}/admin/clients/${clientId}?error=emailExists`);
      }
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await hash(password, 10);
    }

    await prisma.$transaction(async (tx) => {
      if (existingClient.userId) {
        await tx.user.update({
          where: { id: existingClient.userId },
          data: {
            name,
            email: contactEmail.toLowerCase(),
            isActive,
            ...(hashedPassword ? { passwordHash: hashedPassword } : {}),
          },
        });
      }

      await tx.client.update({
        where: { id: clientId },
        data: {
          name,
          domain: domain || null,
          contactEmail: contactEmail.toLowerCase(),
          isActive,
        },
      });
    });

    redirect(`/${locale}/admin/clients/${clientId}?updated=1`);
  } catch {
    redirect(`/${locale}/admin/clients/${clientId}?error=unknown`);
  }
}

export async function quickCreateClientAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") return { success: false, error: "Unauthorized" };

  const name = readText(formData.get("name"));
  const domain = readText(formData.get("domain"));
  const contactEmail = readText(formData.get("contactEmail"));
  const password = readText(formData.get("password"));
  const isActive = true;

  if (!name || !contactEmail || !password) {
    return { success: false, error: "missingFields" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: contactEmail.toLowerCase() },
    });
    if (existingUser) return { success: false, error: "emailExists" };

    const hashedPassword = await hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email: contactEmail.toLowerCase(), passwordHash: hashedPassword, role: "client", isActive },
      });
      return tx.client.create({
        data: { name, domain: domain || null, contactEmail: contactEmail.toLowerCase(), isActive, userId: newUser.id },
      });
    });

    return { success: true, id: result.id };
  } catch {
    return { success: false, error: "unknown" };
  }
}
