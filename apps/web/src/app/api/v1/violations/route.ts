import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, action } = body;

  if (!id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const violation = await prisma.employeeViolation.findUnique({ where: { id }, include: { employee: true } });
  if (!violation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = action === "approve" ? "applied" : "rejected";

  const updated = await prisma.employeeViolation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true, data: updated });
}
