import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";
import {
  getCompanyAlerts, resolveAlert, dismissAlert,
  scanComplianceAlerts, createComplianceDocument, getCompanyComplianceDocuments,
} from "../../../../server/services/compliance-service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");
  const type = url.searchParams.get("type"); // "alerts" | "documents"

  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  if (type === "documents") {
    const documents = await getCompanyComplianceDocuments(companyId);
    return NextResponse.json({ documents });
  }

  const alerts = await getCompanyAlerts(companyId);
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, alertId, companyId, name, type, ownerType, ownerId, documentNumber, issuingAuthority, issueDate, expiryDate, fileUrl, notes } = body;

  if (action === "scan" && companyId) {
    const alerts = await scanComplianceAlerts(companyId);
    return NextResponse.json({ alerts });
  }

  if (action === "resolve" && alertId) {
    const alert = await resolveAlert(alertId);
    return NextResponse.json({ alert });
  }

  if (action === "dismiss" && alertId) {
    const alert = await dismissAlert(alertId);
    return NextResponse.json({ alert });
  }

  if (action === "create" && companyId && name && type && ownerType) {
    const document = await createComplianceDocument({
      companyId,
      name,
      type,
      ownerType,
      ownerId: ownerId || "",
      documentNumber,
      issuingAuthority,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      fileUrl,
      notes,
    });
    return NextResponse.json({ document });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
