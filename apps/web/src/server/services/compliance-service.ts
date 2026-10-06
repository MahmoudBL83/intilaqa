import { prisma } from "@intilaqa/db";

export type ExpiryStatus = "expired" | "30_days" | "60_days" | "90_days" | "valid";

export function getDocumentExpiryStatus(expiryDate: Date): ExpiryStatus {
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 30) return "30_days";
  if (daysLeft <= 60) return "60_days";
  if (daysLeft <= 90) return "90_days";
  return "valid";
}

export function getAlertSeverity(status: ExpiryStatus): string {
  switch (status) {
    case "expired": return "critical";
    case "30_days": return "high";
    case "60_days": return "medium";
    case "90_days": return "low";
    default: return "low";
  }
}

export async function generateComplianceAlerts(companyId: string) {
  const documents = await prisma.complianceDocument.findMany({
    where: { companyId },
  });

  const createdAlerts: Array<{
    companyId: string;
    documentId: string;
    type: string;
    alertLevel: ExpiryStatus;
    severity: string;
    title: string;
    ownerType: string;
    ownerId: string;
  }> = [];

  for (const doc of documents) {
    if (!doc.expiryDate) continue;
    const status = getDocumentExpiryStatus(doc.expiryDate);
    if (status === "valid") continue;

    createdAlerts.push({
      companyId: doc.companyId,
      documentId: doc.id,
      type: `document_${status}`,
      alertLevel: status,
      severity: getAlertSeverity(status),
      title: `${doc.name} — ${status === "expired" ? "Expired" : `Expires in ${status.replace("_", " ")}`}`,
      ownerType: doc.ownerType,
      ownerId: doc.ownerId,
    });
  }

  const results = [];
  for (const alert of createdAlerts) {
    const existing = await prisma.complianceAlert.findFirst({
      where: {
        documentId: alert.documentId,
        alertLevel: alert.alertLevel,
        status: { not: "dismissed" },
      },
    });
    if (!existing) {
      const created = await prisma.complianceAlert.create({
        data: {
          companyId: alert.companyId,
          documentId: alert.documentId,
          type: alert.type,
          alertLevel: alert.alertLevel,
          severity: alert.severity,
          title: alert.title,
          ownerType: alert.ownerType,
          ownerId: alert.ownerId,
          status: "pending",
          channel: "dashboard",
        },
      });
      results.push(created);
    }
  }

  return results;
}

export async function scanComplianceAlerts(companyId?: string) {
  const where = companyId ? { id: companyId } : {};

  const companies = await prisma.company.findMany({
    where: companyId ? { id: companyId } : {},
    include: {
      complianceDocuments: true,
      employees: {
        include: {
          user: { select: { name: true } },
          contracts: { orderBy: { startDate: "desc" }, take: 1 },
        },
      },
    },
  });

  const now = new Date();
  const createdAlerts: Array<{
    companyId: string;
    type: string;
    severity: string;
    title: string;
    description: string | null;
    ownerType: string;
    ownerId: string;
  }> = [];

  for (const company of companies) {
    for (const doc of company.complianceDocuments) {
      if (!doc.expiryDate) continue;
      const status = getDocumentExpiryStatus(doc.expiryDate);
      if (status === "valid") continue;
      const alertLevel = status;
      const daysLeft = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      createdAlerts.push({
        companyId: company.id,
        type: `document_${status}`,
        severity: getAlertSeverity(status),
        title: `${doc.name}`,
        description: daysLeft <= 0 ? "Expired" : `Expires in ${daysLeft} days`,
        ownerType: doc.ownerType,
        ownerId: doc.ownerId,
      });
    }

    for (const emp of company.employees) {
      if (emp.contractEndDate) {
        const status = getDocumentExpiryStatus(emp.contractEndDate);
        if (status !== "valid") {
          createdAlerts.push({
            companyId: company.id,
            type: `contract_${status}`,
            severity: getAlertSeverity(status),
            title: `Contract — ${emp.user?.name ?? emp.employeeId ?? emp.id}`,
            description: `Contract ${status === "expired" ? "expired" : `expiring ${status.replace("_", " ")}`}`,
            ownerType: "employee",
            ownerId: emp.id,
          });
        }
      }
    }
  }

  const results = [];
  for (const alert of createdAlerts) {
    const existing = await prisma.complianceAlert.findFirst({
      where: {
        companyId: alert.companyId,
        type: alert.type,
        status: { not: "dismissed" },
        title: alert.title,
      },
    });
    if (!existing) {
      const created = await prisma.complianceAlert.create({
        data: {
          companyId: alert.companyId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          ownerType: alert.ownerType,
          ownerId: alert.ownerId,
          status: "pending",
          channel: "dashboard",
        },
      });
      results.push(created);
    }
  }

  return results;
}

export async function getCompanyAlerts(companyId: string) {
  return prisma.complianceAlert.findMany({
    where: { companyId },
    include: { document: { select: { id: true, name: true, type: true, expiryDate: true } } },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });
}

export async function getCompanyComplianceDocuments(companyId: string) {
  return prisma.complianceDocument.findMany({
    where: { companyId },
    orderBy: { expiryDate: "asc" },
  });
}

export async function createComplianceDocument(data: {
  companyId: string;
  name: string;
  type: string;
  ownerType: string;
  ownerId: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: Date;
  expiryDate?: Date;
  fileUrl?: string;
  notes?: string;
}) {
  return prisma.complianceDocument.create({ data });
}

export async function resolveAlert(alertId: string) {
  return prisma.complianceAlert.update({
    where: { id: alertId },
    data: { status: "dismissed", resolvedAt: new Date() },
  });
}

export async function dismissAlert(alertId: string) {
  return prisma.complianceAlert.update({
    where: { id: alertId },
    data: { status: "dismissed" },
  });
}

// Qiwa Integration Placeholder
export class QiwaService {
  static async validateProfession(employeeId: string, professionCode: string): Promise<{ valid: boolean; message: string }> {
    // Placeholder: In production, this would call Qiwa API to validate
    // that the employee's profession code matches their visa/iqama
    console.log(`[QiwaService] Validate profession ${professionCode} for employee ${employeeId}`);
    return { valid: true, message: "Profession code format is valid" };
  }

  static async syncProfessionalCertificate(certificateId: string): Promise<{ synced: boolean; qiwaId?: string }> {
    // Placeholder: In production, this would sync the certificate to Qiwa
    console.log(`[QiwaService] Sync certificate ${certificateId} to Qiwa`);
    return { synced: false, qiwaId: undefined };
  }

  static async getProfessionRequirements(professionCode: string): Promise<{
    minCertificates: number;
    requiredDocuments: string[];
  }> {
    // Placeholder: Return profession requirements from Qiwa
    console.log(`[QiwaService] Get requirements for profession ${professionCode}`);
    return {
      minCertificates: 1,
      requiredDocuments: ["iqama", "professional_certificate"],
    };
  }
}
