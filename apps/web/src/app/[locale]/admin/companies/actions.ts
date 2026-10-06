"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

// Validation helper
function readText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getLocale(value: FormDataEntryValue | null) {
  const locale = readText(value);
  return locale || "ar";
}

export async function createCompanyAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const clientId = readText(formData.get("clientId"));
  const address = readText(formData.get("address"));
  const industry = readText(formData.get("industry"));
  const isActive = readText(formData.get("isActive")) !== "false";

  if (!name || !clientId) {
    redirect(`/${locale}/admin/companies/new?error=missingFields`);
  }

  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      redirect(`/${locale}/admin/companies/new?error=invalidClient`);
    }

    await prisma.company.create({
      data: {
        name,
        clientId,
        address: address || null,
        industry: industry || null,
        isActive,
      },
    });

    redirect(`/${locale}/admin/companies?created=1`);
  } catch (error) {
    redirect(`/${locale}/admin/companies/new?error=unknown`);
  }
}

export async function updateCompanyAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const companyId = readText(formData.get("companyId"));
  const name = readText(formData.get("name"));
  const clientId = readText(formData.get("clientId"));
  const address = readText(formData.get("address"));
  const industry = readText(formData.get("industry"));
  const isActive = readText(formData.get("isActive")) !== "false";

  if (!companyId || !name || !clientId) {
    redirect(`/${locale}/admin/companies/${companyId}?error=missingFields`);
  }

  try {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
       redirect(`/${locale}/admin/companies?error=notFound`);
    }
    
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      redirect(`/${locale}/admin/companies/${companyId}?error=invalidClient`);
    }

    await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        clientId,
        address: address || null,
        industry: industry || null,
        isActive,
      },
    });

    redirect(`/${locale}/admin/companies/${companyId}?updated=1`);
  } catch (error) {
    redirect(`/${locale}/admin/companies/${companyId}?error=unknown`);
  }
}
