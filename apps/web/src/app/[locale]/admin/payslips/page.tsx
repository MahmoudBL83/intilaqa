import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, KPICard } from "@intilaqa/ui";
import { ReceiptText, DollarSign, TrendingUp } from "lucide-react";
import { getPayslips } from "@/server/services/payslip-service";
import { PayslipsContent } from "./payslips-content";

const PAGE_SIZE = 20;

export default async function PayslipsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("payslips");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");

  const sp = await searchParams;
  const search = sp.search || "";

  const [[payslipData, payslipTotal], _, payrollAgg] = await Promise.all([
    getPayslips({ take: PAGE_SIZE, skip: 0, search }),
    prisma.payslip.count(),
    prisma.payrollRecord.aggregate({ _sum: { netPay: true } }),
  ]);

  const total = payslipTotal;
  const totalNet = payrollAgg._sum.netPay || 0;
  const avg = total > 0 ? Math.round(totalNet / total) : 0;

  const currency = tc("currency");

  const formatMonth = (month: number) => {
    const d = new Date(2024, month - 1, 1);
    return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "long" });
  };

  const rows = payslipData.map((item) => {
    const period = `${formatMonth(item.payrollRecord.month)} ${item.payrollRecord.year}`;
    const monthYear = `${formatMonth(item.payrollRecord.month)} ${item.payrollRecord.year}`;
    const netPay = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "currency", currency: "SAR", maximumFractionDigits: 0,
    }).format(item.payrollRecord.netPay);

    return {
      id: item.id,
      employeeName: item.employee?.user?.name || "—",
      employeeEmail: item.employee?.user?.email || "",
      period,
      monthYear,
      netPay: `${netPay} ${currency}`,
      status: item.payrollRecord.status,
      issuedAt: item.issuedAt ? new Date(item.issuedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "—",
      hasFile: !!item.fileUrl,
      fileUrl: item.fileUrl,
    };
  });

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: tn("items.payslips") }]} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={t("title")} value={total} icon={<ReceiptText className="w-6 h-6" />} color="blue" />
        <KPICard title={t("totalNet")} value={totalNet.toLocaleString()} icon={<DollarSign className="w-6 h-6" />} color="emerald" suffix={currency} />
        <KPICard title={t("average")} value={avg.toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} color="purple" suffix={currency} />
      </div>

      <PayslipsContent
        payslips={rows}
        emptyTitle={t("noPayslips")}
        emptyDescription={t("noPayslipsDesc")}
        locale={locale}
      />
    </div>
  );
}
