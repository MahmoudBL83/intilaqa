import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, createApiResponse, createApiError } from "@/server/api/middleware/auth";
import { prisma } from "@intilaqa/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const body = await req.json();
  const secret = randomBytes(32).toString("hex");

  const webhook = await prisma.webhookRegistry.create({
    data: {
      name: body.name,
      url: body.url,
      secret,
      events: body.events || [],
      clientId: auth.apiKey?.clientId,
    },
  });

  return createApiResponse({ ...webhook, secret }, 201);
}

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const webhooks = await prisma.webhookRegistry.findMany({
    where: auth.apiKey?.clientId ? { clientId: auth.apiKey.clientId } : {},
    orderBy: { createdAt: "desc" },
  });

  return createApiResponse(webhooks.map((w) => ({ ...w, secret: undefined })));
}
