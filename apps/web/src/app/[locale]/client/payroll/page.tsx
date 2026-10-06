import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable, StatCard } from "@intilaqa/ui";
import { DollarSign, FileText, Activity, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default async function PayrollPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const client = await prisma.client.findFirst({ where: { userId } });
  if (!client) redirect(`/${locale}/login`);

  const t = await getTranslations("payroll");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));

  const where = { company: { clientId: client.id } };

  const [data, total, draftCount] = await Promise.all([
    prisma.payrollRecord.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
    prisma.payrollRecord.count({ where }),
    prisma.payrollRecord.count({ where: { company: { clientId: client.id }, status: "draft" } }),
  ]);

  const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"] as const;

  const rows = data.map((r) => ({
    id: r.id,
    companyName: r.company?.name ?? "\u2014",
    periodFormatted: `${tc(monthKeys[r.month - 1])} ${r.year}`,
    baseSalaryFormatted: `${r.baseSalary.toLocaleString()} ${tc("currency")}`,
    allowancesFormatted: `${r.allowances.toLocaleString()} ${tc("currency")}`,
    deductionsFormatted: `${r.deductions.toLocaleString()} ${tc("currency")}`,
    netPayFormatted: `${r.netPay.toLocaleString()} ${tc("currency")}`,
    statusDisplay: r.status,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p: number) => `?page=${p}`;

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/client` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title={t("title")} value={total} icon={DollarSign} variant="primary" />
        <StatCard title={t("draft")} value={draftCount} icon={FileText} variant="secondary" />
        <StatCard title={t("totalPayroll")} value={`${data.reduce((acc, r) => acc + r.netPay, 0).toLocaleString()} ${tc("currency")}`} icon={DollarSign} variant="neutral" />
        <StatCard title={td("status")} value={String(total)} icon={Activity} variant="primary" />
      </div>

      <DataTable
        columns={[
          { key: "companyName", header: t("employee") },
          { key: "periodFormatted", header: t("period") },
          { key: "baseSalaryFormatted", header: t("salary") },
          { key: "allowancesFormatted", header: t("allowances") },
          { key: "deductionsFormatted", header: t("deductions") },
          { key: "netPayFormatted", header: t("netPay") },
          { key: "statusDisplay", header: t("status"), type: "status" },
        ]}
        data={rows}
        emptyTitle={t("noRuns")}
        emptyDescription={t("noRunsDesc")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {tc("page")} {page} {tc("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a href={buildUrl(page - 1)} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </span>
            )}
            {page < totalPages ? (
              <a href={buildUrl(page + 1)} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
