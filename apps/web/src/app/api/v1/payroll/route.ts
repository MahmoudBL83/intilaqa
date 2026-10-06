import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import {
  createPayrollRun,
  getPayrollRuns,
  getPayrollRun,
  updatePayrollRunStatus,
  recalculatePayrollRun,
} from "@/server/services/payroll-engine";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const runId = url.searchParams.get("id");
  const companyId = url.searchParams.get("companyId");

  if (runId) {
    const run = await getPayrollRun(runId);
    if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ run });
  }

  if (companyId) {
    const runs = await getPayrollRuns(companyId);
    return NextResponse.json({ runs });
  }

  return NextResponse.json({ error: "id or companyId required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companyId, payrollMonth } = body;

  if (!companyId || !payrollMonth) {
    return NextResponse.json({ error: "companyId and payrollMonth required" }, { status: 400 });
  }

  const existing = await prisma.payrollRun.findUnique({
    where: { companyId_payrollMonth: { companyId, payrollMonth } },
  });

  if (existing) {
    return NextResponse.json({ error: "A payroll run for this month already exists" }, { status: 409 });
  }

  try {
    const run = await createPayrollRun(companyId, payrollMonth);
    return NextResponse.json({ run });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { runId, status, action } = body;

  if (!runId) return NextResponse.json({ error: "runId required" }, { status: 400 });

  if (action === "recalculate") {
    const run = await recalculatePayrollRun(runId);
    return NextResponse.json({ run });
  }

  if (status && ["draft", "calculated", "approved", "exported", "paid"].includes(status)) {
    const run = await updatePayrollRunStatus(runId, status as any);
    return NextResponse.json({ run });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
