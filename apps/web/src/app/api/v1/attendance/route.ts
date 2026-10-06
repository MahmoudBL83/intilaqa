import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey, createApiResponse, createApiError } from "@/server/api/middleware/auth";
import * as attendanceService from "@/server/services/attendance-service";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return createApiError(auth.error!, 401);

  const take = parseInt(req.nextUrl.searchParams.get("take") || "10");
  const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0");
  const employeeId = req.nextUrl.searchParams.get("employeeId") || undefined;

  const result = await attendanceService.getAttendanceRecords({ take, skip, employeeId });
  return createApiResponse(result);
}
