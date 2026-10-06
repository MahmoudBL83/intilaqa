import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const employeeId = url.searchParams.get("employeeId");
  const id = url.searchParams.get("id");

  if (id) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ url: doc.url, name: doc.name, type: doc.type });
  }

  if (!employeeId) return NextResponse.json({ error: "employeeId required" }, { status: 400 });

  const docs = await prisma.document.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ documents: docs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, employeeId, name, type, fileUrl, expiryDate, documentId } = body;

  if (action === "create" && employeeId && name && type) {
    const doc = await prisma.document.create({
      data: {
        name,
        type,
        url: fileUrl || "",
        status: "active",
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        employeeId,
      },
    });
    return NextResponse.json({ document: doc });
  }

  if (action === "delete" && documentId) {
    await prisma.document.delete({ where: { id: documentId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
