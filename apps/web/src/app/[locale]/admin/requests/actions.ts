"use server";

import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { approveRequest, rejectRequest } from "@/server/services/request-service";

function readText(value: FormDataEntryValue | null) { if (typeof value !== "string") return ""; return value.trim(); }
function getLocale(value: FormDataEntryValue | null) { const locale = readText(value); return locale || "ar"; }

const allowedStatuses = new Set(["pending", "approved", "rejected"]);

export async function updateRequestStatusAction(id: string, status: "approved" | "rejected", formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  const statusValue = allowedStatuses.has(status) ? status : "pending";

  try {
    if (statusValue === "approved") await approveRequest(id);
    else if (statusValue === "rejected") await rejectRequest(id);
  } catch { redirect(`/${locale}/admin/requests/${id}?error=unknown`); }

  revalidatePath(`/${locale}/admin/requests`, "layout");
  redirect(`/${locale}/admin/requests?updated=1`);
}

export async function deleteRequestAction(id: string, formData: FormData) {
  const locale = getLocale(formData.get("locale"));
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (!user?.id || user.role !== "admin") redirect(`/${locale}/login`);

  try { await prisma.employeeRequest.delete({ where: { id } }); }
  catch { redirect(`/${locale}/admin/requests?error=unknown`); }

  revalidatePath(`/${locale}/admin/requests`, "layout");
  redirect(`/${locale}/admin/requests`);
}
