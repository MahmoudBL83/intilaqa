import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { createShift, getCompanyShifts, updateShift } from "@/server/services/shift-service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const shifts = await getCompanyShifts(companyId);
  return NextResponse.json({ shifts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companyId, name, type, startTime, endTime, workingDays, breakMinutes } = body;

  if (!companyId || !name) {
    return NextResponse.json({ error: "companyId and name required" }, { status: 400 });
  }

  const shift = await createShift({
    companyId,
    name,
    type: type || "fixed",
    startTime: startTime || "08:00",
    endTime: endTime || "17:00",
    workingDays: workingDays || 5,
    breakMinutes: breakMinutes || 60,
  });

  return NextResponse.json({ shift });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const shift = await updateShift(id, data);
  return NextResponse.json({ shift });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.shift.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
