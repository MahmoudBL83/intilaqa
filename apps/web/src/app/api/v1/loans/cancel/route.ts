import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const loan = await prisma.employeeRequest.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (loan.status !== "pending") return NextResponse.json({ error: "Can only cancel pending loans" }, { status: 400 });

  await prisma.employeeRequest.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ success: true });
}
