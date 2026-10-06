import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, createApiResponse, createApiError } from "@/server/api/middleware/auth";
import * as employeeService from "@/server/services/employee-service";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const take = parseInt(req.nextUrl.searchParams.get("take") || "10");
  const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0");
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const companyId = req.nextUrl.searchParams.get("companyId") || undefined;

  const result = await employeeService.getEmployees({ take, skip, search, companyId });
  return createApiResponse(result);
}
