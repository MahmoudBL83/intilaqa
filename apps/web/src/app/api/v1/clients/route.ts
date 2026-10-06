import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, createApiResponse, createApiError } from "@/server/api/middleware/auth";
import * as clientService from "@/server/services/client-service";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const take = parseInt(req.nextUrl.searchParams.get("take") || "10");
  const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0");
  const search = req.nextUrl.searchParams.get("search") || undefined;

  const result = await clientService.getClients({ take, skip, search });
  return createApiResponse(result);
}

export async function POST(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const body = await req.json();
  const client = await clientService.createClient(body);
  return createApiResponse(client, 201);
}
