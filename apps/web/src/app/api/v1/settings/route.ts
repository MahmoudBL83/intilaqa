import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import { createAuditLog } from "@/server/services/audit-service";

export async function GET() {
  let settings = await prisma.appSettings.findFirst();
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        appArabicName: "انطلاقة",
        appEnglishName: "Intilaqa",
        primaryColor: "#3a6758",
        defaultLanguage: "ar",
      },
    });
  }
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { appArabicName, appEnglishName, primaryColor, logoUrl, defaultLanguage } = body;

  let settings = await prisma.appSettings.findFirst();

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        appArabicName: appArabicName ?? "انطلاقة",
        appEnglishName: appEnglishName ?? "Intilaqa",
        primaryColor: primaryColor ?? "#3a6758",
        logoUrl: logoUrl ?? null,
        defaultLanguage: defaultLanguage ?? "ar",
      },
    });
  } else {
    settings = await prisma.appSettings.update({
      where: { id: settings.id },
      data: {
        appArabicName: appArabicName ?? settings.appArabicName,
        appEnglishName: appEnglishName ?? settings.appEnglishName,
        primaryColor: primaryColor ?? settings.primaryColor,
        logoUrl: logoUrl ?? settings.logoUrl,
        defaultLanguage: defaultLanguage ?? settings.defaultLanguage,
      },
    });
  }

  await createAuditLog({
    userId: (session.user as { id: string }).id,
    action: "update_settings",
    entityType: "AppSettings",
    entityId: settings.id,
  });

  return NextResponse.json({ success: true, settings });
}
