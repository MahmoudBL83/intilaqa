import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { PayrollDetailContent } from "./payroll-detail-content";
import { MarkPaidForm } from "./mark-paid-form";

export default async function PayrollDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("payroll");
  const td = await getTranslations("dashboard");

  const record = await prisma.payrollRecord.findUnique({
    where: { id: p.id },
    include: {
      payslips: {
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              company: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!record) notFound();

  const formatMonth = (month: number) => {
    const d = new Date(2024, month - 1, 1);
    return d.toLocaleDateString(p.locale === "ar" ? "ar-SA" : "en-US", { month: "long" });
  };

  const periodStr = `${formatMonth(record.month)} ${record.year}`;

  const detailData = {
    id: record.id,
    period: periodStr,
    status: record.status,
    baseSalary: record.baseSalary,
    allowances: record.allowances,
    deductions: record.deductions,
    netPay: record.netPay,
    paidAt: record.paidAt?.toISOString() || null,
    payslips: record.payslips.map((ps) => ({
      id: ps.id,
      employeeName: ps.employee.user.name,
      companyName: ps.employee.company.name,
      salary: ps.employee.salary || 0,
      netPay: record.netPay / (record.payslips.length || 1),
      issuedAt: ps.issuedAt.toISOString(),
      hasFile: !!ps.fileUrl,
    })),
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: td("overview"), href: `/${p.locale}/admin` },
          { label: t("title"), href: `/${p.locale}/admin/payroll` },
          { label: periodStr },
        ]}
      />

      <PayrollDetailContent
        record={detailData}
        locale={p.locale}
        markPaidButton={<MarkPaidForm recordId={record.id} locale={p.locale} />}
      />
    </div>
  );
}
