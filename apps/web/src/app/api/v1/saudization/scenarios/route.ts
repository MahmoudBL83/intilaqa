import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const scenario = await prisma.saudizationScenario.create({
    data: {
      name: body.name,
      companyId: body.companyId,
      currentSaudis: body.currentSaudis,
      currentExpats: body.currentExpats,
      newSaudisToHire: body.newSaudisToHire,
      newExpatsToHire: body.newExpatsToHire,
      projectedPercentage: body.currentSaudis + body.currentExpats > 0
        ? Math.round(((body.currentSaudis + body.newSaudisToHire) / (body.currentSaudis + body.currentExpats + body.newSaudisToHire + body.newExpatsToHire)) * 100)
        : 0,
    },
  });

  return NextResponse.json({
    id: scenario.id,
    name: scenario.name,
    currentSaudis: scenario.currentSaudis,
    currentExpats: scenario.currentExpats,
    newSaudisToHire: scenario.newSaudisToHire,
    newExpatsToHire: scenario.newExpatsToHire,
    projectedPercentage: scenario.projectedPercentage,
    createdAt: scenario.createdAt.toISOString(),
  });
}
