import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { AdminComplianceContent } from "./admin-compliance-content";

const PAGE_SIZE = 20;

export default async function AdminCompliancePage(props: { searchParams: Promise<{ page?: string }>, params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const t = await getTranslations("compliance");

  let error: string | null = null;
  let companyAlerts: { id: string; name: string; expired: number; pending30: number; pending60: number; pending90: number; total: number }[] = [];
  let totalExpired = 0;
  let totalPending = 0;
  let totalCount = 0;

  try {
    const [companies, allDocs] = await Promise.all([
      prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.complianceDocument.findMany({
        select: { companyId: true, expiryDate: true },
      }),
    ]);

    totalCount = companies.length;

    const docsByCompany = new Map<string, { expiryDate: Date | null }[]>();
    for (const doc of allDocs) {
      if (!doc.companyId) continue;
      const arr = docsByCompany.get(doc.companyId) || [];
      arr.push(doc);
      docsByCompany.set(doc.companyId, arr);
    }

    const now = new Date();
    const paginatedCompanies = companies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    for (const company of paginatedCompanies) {
      const docs = docsByCompany.get(company.id) || [];
      const expired = docs.filter((d) => d.expiryDate && d.expiryDate <= now).length;
      const pending30 = docs.filter((d) => {
        if (!d.expiryDate) return false;
        const days = Math.ceil((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 && days <= 30;
      }).length;
      const pending60 = docs.filter((d) => {
        if (!d.expiryDate) return false;
        const days = Math.ceil((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days > 30 && days <= 60;
      }).length;
      const pending90 = docs.filter((d) => {
        if (!d.expiryDate) return false;
        const days = Math.ceil((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days > 60 && days <= 90;
      }).length;

      companyAlerts.push({
        id: company.id,
        name: company.name,
        expired,
        pending30,
        pending60,
        pending90,
        total: docs.length,
      });
      totalExpired += expired;
      totalPending += pending30 + pending60 + pending90;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load compliance data";
  }

  return (
    <AdminComplianceContent
      companyAlerts={companyAlerts}
      totalExpired={totalExpired}
      totalPending={totalPending}
      totalCompanies={totalCount}
      error={error}
      currentPage={page}
      totalPages={Math.ceil(totalCount / PAGE_SIZE)}
    />
  );
}
