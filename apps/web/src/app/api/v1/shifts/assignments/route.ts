import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const assignment = await prisma.shiftAssignment.create({
    data: {
      employeeId: body.employeeId,
      shiftId: body.shiftId,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
    include: { shift: true, employee: { include: { user: true } } },
  });

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      shiftName: assignment.shift.name,
      employeeName: assignment.employee.user.name,
      employeeId: assignment.employee.id,
      shiftId: assignment.shift.id,
      startDate: assignment.startDate.toISOString(),
      endDate: assignment.endDate?.toISOString() ?? null,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.shiftAssignment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
