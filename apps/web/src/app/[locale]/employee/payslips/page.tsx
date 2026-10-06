import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { PayslipsTable } from "./payslips-table";

export default async function EmployeePayslipsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const employee = await prisma.employee.findFirst({ where: { userId }, include: { user: true } });
  if (!employee) redirect(`/${locale}/login`);

  const t = await getTranslations("payslips");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  let payslips: any[] = [];
  let error = false;
  try {
    payslips = await prisma.payslip.findMany({
      where: { employeeId: employee.id }, include: { payrollRecord: true },
      orderBy: { issuedAt: "desc" }, take: 20,
    });
  } catch { error = true; }

  const rows = error ? [] : payslips.map((p) => {
    const d = new Date(2024, p.payrollRecord.month - 1, 1);
    const monthName = d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "long" });
    return {
      id: p.id, period: `${monthName} ${p.payrollRecord.year}`,
      netPay: new Intl.NumberFormat(locale, { style: "currency", currency: "SAR" }).format(p.payrollRecord.netPay),
      statusDisplay: p.payrollRecord.status,
      issuedAt: p.issuedAt?.toLocaleDateString(locale) || "—",
    };
  });

  // Pre-resolve translation strings for client component
  const labels = { period: t("period"), netPay: t("netPay"), status: t("status"), issuedAt: t("issuedAt"), noData: t("noData"), download: t("download") };

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/employee` }, { label: t("title") }]} />
      <PayslipsTable rows={rows} labels={labels} />
    </div>
  );
}
