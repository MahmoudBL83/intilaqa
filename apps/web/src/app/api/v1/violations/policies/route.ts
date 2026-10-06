import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (!employee?.companyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const policy = await prisma.violationPolicy.create({
    data: {
      name: body.name,
      description: body.description || null,
      deductionType: body.deductionType,
      deductionValue: body.deductionValue,
      companyId: employee.companyId,
    },
  });

  return NextResponse.json({ success: true, data: policy });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.employeeViolation.deleteMany({ where: { policyId: id } });
  await prisma.violationPolicy.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
