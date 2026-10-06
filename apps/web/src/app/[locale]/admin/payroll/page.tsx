import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, KPICard } from "@intilaqa/ui";
import { Plus, DollarSign, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PayrollContent } from "./payroll-content";

type SearchParams = { search?: string; status?: string };

export default async function PayrollPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("payroll");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const statusFilter = sp.status || "";

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;

  const [records, total, agg] = await Promise.all([
    prisma.payrollRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { payslips: true } },
      },
    }),
    prisma.payrollRecord.count({ where }),
    prisma.payrollRecord.aggregate({ _sum: { netPay: true }, _avg: { netPay: true } }),
  ]);

  const totalNet = agg._sum.netPay || 0;
  const avgSalary = agg._avg.netPay || 0;

  const employeeCount = await prisma.employee.count({ where: { isActive: true } });

  const formatMonth = (month: number) => {
    const d = new Date(2024, month - 1, 1);
    return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "long" });
  };

  const data = records.map((r) => ({
    id: r.id,
    period: `${formatMonth(r.month)} ${r.year}`,
    baseSalary: r.baseSalary,
    allowances: r.allowances,
    deductions: r.deductions,
    netPay: r.netPay,
    status: r.status,
    employeeCount,
    payslipCount: r._count.payslips,
    paidAt: r.paidAt?.toISOString() || null,
  }));

  const statusOptions = [
    { value: "draft", label: t("draft") },
    { value: "paid", label: t("paid") },
  ];

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("title") }]}
        actions={
          <Link
            href={`/${locale}/admin/payroll/new`}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("newRun")}
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={t("totalPayroll")} value={totalNet.toLocaleString()} icon={<DollarSign className="w-6 h-6" />} color="emerald" suffix={tc("currency")} />
        <KPICard title={t("employees")} value={employeeCount} icon={<Users className="w-6 h-6" />} color="blue" />
        <KPICard title={t("averageSalary")} value={avgSalary.toLocaleString()} icon={<TrendingUp className="w-6 h-6" />} color="purple" suffix={tc("currency")} />
      </div>

      <form method="GET" className="flex gap-2 mb-6">
        <select
          name="status"
          defaultValue={statusFilter}
          className="px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        >
          <option value="">{t("allStatuses")}</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          {tc("search")}
        </button>
        {statusFilter && (
          <a
            href={`/${locale}/admin/payroll`}
            className="px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-bold hover:bg-white/80 transition-all flex items-center"
          >
            {tc("clear")}
          </a>
        )}
      </form>

      <PayrollContent
        records={data}
        emptyTitle={t("noPayrollRuns")}
        emptyDescription={t("noPayrollRunsDesc")}
      />
    </div>
  );
}
