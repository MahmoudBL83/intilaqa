"use server";

import { redirect } from "next/navigation";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

function readText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getLocale(value: FormDataEntryValue | null) {
  const locale = readText(value);
  return locale || "ar";
}

export async function createPlanAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const name = readText(formData.get("name"));
  const description = readText(formData.get("description"));
  const priceParsed = parseFloat(readText(formData.get("price")));
  const price = isNaN(priceParsed) ? 0 : priceParsed;
  const isActive = readText(formData.get("isActive")) !== "false";
  
  // Features from checkboxes (all named "features")
  const features = formData.getAll("features").map((v) => readText(v)).filter(Boolean);

  if (!name || isNaN(price)) {
    redirect(`/${locale}/admin/subscriptions/plans/new?error=missingFields`);
  }

  try {
    await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price,
        features,
        isActive,
      },
    });

    redirect(`/${locale}/admin/subscriptions/plans?created=1`);
  } catch (error) {
    redirect(`/${locale}/admin/subscriptions/plans/new?error=unknown`);
  }
}

export async function updatePlanAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const planId = readText(formData.get("planId"));
  const name = readText(formData.get("name"));
  const description = readText(formData.get("description"));
  const priceParsed = parseFloat(readText(formData.get("price")));
  const price = isNaN(priceParsed) ? 0 : priceParsed;
  const isActive = readText(formData.get("isActive")) !== "false";
  
  const features = formData.getAll("features").map((v) => readText(v)).filter(Boolean);

  if (!planId) redirect(`/${locale}/admin/subscriptions/plans?error=missingFields`);

  if (!name || isNaN(price)) {
    redirect(`/${locale}/admin/subscriptions/plans/${planId}?error=missingFields`);
  }

  try {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!existing) {
      redirect(`/${locale}/admin/subscriptions/plans?error=notFound`);
    }

    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name,
        description,
        price,
        features,
        isActive,
      },
    });

    redirect(`/${locale}/admin/subscriptions/plans/${planId}?updated=1`);
  } catch (error) {
    redirect(`/${locale}/admin/subscriptions/plans/${planId}?error=unknown`);
  }
}
