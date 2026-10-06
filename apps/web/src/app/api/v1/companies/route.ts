import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, createApiResponse, createApiError } from "@/server/api/middleware/auth";
import * as companyService from "@/server/services/company-service";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const take = parseInt(req.nextUrl.searchParams.get("take") || "10");
  const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0");
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const clientId = req.nextUrl.searchParams.get("clientId") || undefined;

  const result = await companyService.getCompanies({ take, skip, search, clientId });
  return createApiResponse(result);
}
