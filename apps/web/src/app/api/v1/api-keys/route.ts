import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const key = `intilaqa_${crypto.randomBytes(32).toString("hex")}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      name: body.name,
      key,
      prefix: key.substring(0, 12),
      clientId: body.clientId || null,
      permissions: body.permissions || ["*"],
    },
  });

  return NextResponse.json({ success: true, data: apiKey });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const body = await req.json();

  const updated = await prisma.apiKey.update({ where: { id: id! }, data: { isActive: body.isActive } });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await prisma.apiKey.delete({ where: { id: id! } });
  return NextResponse.json({ success: true });
}
