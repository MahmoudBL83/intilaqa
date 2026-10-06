import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@intilaqa/db";

export async function validateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const key = authHeader.slice(7);
  const prefix = key.slice(0, 10);

  const apiKey = await prisma.apiKey.findFirst({
    where: { prefix, isActive: true },
    include: { client: true, company: true },
  });

  if (!apiKey || apiKey.key !== key) {
    return { valid: false, error: "Invalid API key" };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: "API key expired" };
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    valid: true,
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      clientId: apiKey.clientId,
      companyId: apiKey.companyId,
      client: apiKey.client,
      company: apiKey.company,
    },
  };
}

export function createApiResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function createApiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function hasApiPermission(apiKey: { permissions: string[] }, permission: string): boolean {
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes("*");
}
