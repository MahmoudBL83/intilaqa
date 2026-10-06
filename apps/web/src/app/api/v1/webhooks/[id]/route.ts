import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, createApiResponse, createApiError } from "@/server/api/middleware/auth";
import { prisma } from "@intilaqa/db";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const { id } = await params;
  await prisma.webhookRegistry.delete({ where: { id } });
  return createApiResponse({ deleted: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const { id } = await params;
  const body = await req.json();
  
  const webhook = await prisma.webhookRegistry.update({
    where: { id },
    data: {
      name: body.name,
      url: body.url,
      events: body.events,
      isActive: body.isActive,
    },
  });

  return createApiResponse({ ...webhook, secret: undefined });
}
