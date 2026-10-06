import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  const emp = await prisma.employee.findFirst({ where: { userId } });
  if (!emp?.companyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const cert = await prisma.professionalCertificate.create({
    data: {
      name: body.name,
      certificateNumber: body.certificateNumber || null,
      issuingAuthority: body.issuingAuthority || null,
      issueDate: body.issueDate ? new Date(body.issueDate) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      profession: body.profession || null,
      qiwaProfessionCode: body.qiwaProfessionCode || null,
      employeeId: body.employeeId,
      companyId: emp.companyId,
    },
  });

  return NextResponse.json({ success: true, data: cert });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.professionalCertificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
