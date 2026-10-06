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

export async function createSubscriptionAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const clientId = readText(formData.get("clientId"));
  const planId = readText(formData.get("planId"));
  const startDateStr = readText(formData.get("startDate"));
  const endDateStr = readText(formData.get("endDate"));
  const status = readText(formData.get("status"));

  if (!clientId || !planId || !startDateStr || !endDateStr || !status) {
    redirect(`/${locale}/admin/subscriptions/new?error=missingFields`);
  }

  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    await prisma.subscription.create({
      data: {
        clientId,
        planId,
        startDate,
        endDate,
        status,
      },
    });

    redirect(`/${locale}/admin/subscriptions?created=1`);
  } catch (error) {
    redirect(`/${locale}/admin/subscriptions/new?error=unknown`);
  }
}

export async function updateSubscriptionAction(formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const subscriptionId = readText(formData.get("subscriptionId"));
  const clientId = readText(formData.get("clientId"));
  const planId = readText(formData.get("planId"));
  const startDateStr = readText(formData.get("startDate"));
  const endDateStr = readText(formData.get("endDate"));
  const status = readText(formData.get("status"));

  if (!subscriptionId) redirect(`/${locale}/admin/subscriptions?error=missingFields`);

  if (!clientId || !planId || !startDateStr || !endDateStr || !status) {
    redirect(`/${locale}/admin/subscriptions/${subscriptionId}?error=missingFields`);
  }

  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        clientId,
        planId,
        startDate,
        endDate,
        status,
      },
    });

    redirect(`/${locale}/admin/subscriptions/${subscriptionId}?updated=1`);
  } catch (error) {
    redirect(`/${locale}/admin/subscriptions/${subscriptionId}?error=unknown`);
  }
}
