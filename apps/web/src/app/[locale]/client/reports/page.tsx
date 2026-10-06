import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, StatCard } from "@intilaqa/ui";
import { BarChart3, Users, Building2, FileText, TrendingUp, DollarSign } from "lucide-react";

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const client = await prisma.client.findFirst({ where: { userId } });
  if (!client) redirect(`/${locale}/login`);

  const t = await getTranslations("reports");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");
  const tr = await getTranslations("requests");

  const [companyCount, employeeCount, activeSubCount, requestCount, payrollCount] = await Promise.all([
    prisma.company.count({ where: { clientId: client.id } }),
    prisma.employee.count({ where: { company: { clientId: client.id } } }),
    prisma.subscription.count({ where: { clientId: client.id, status: "active" } }),
    prisma.employeeRequest.count({ where: { employee: { company: { clientId: client.id } } } }),
    prisma.payrollRecord.count({ where: { company: { clientId: client.id } } }),
  ]);

  const reportCards = [
    { title: t("attendance"), value: companyCount, icon: BarChart3, variant: "primary" as const, desc: td("companies") },
    { title: t("employees"), value: employeeCount, icon: Users, variant: "secondary" as const, desc: td("employees") },
    { title: t("payroll"), value: payrollCount, icon: DollarSign, variant: "neutral" as const, desc: td("payrollOperations") },
    { title: tr("title"), value: requestCount, icon: FileText, variant: "primary" as const, desc: tr("pageTitle") },
    { title: td("activeSubscriptions"), value: activeSubCount, icon: TrendingUp, variant: "secondary" as const, desc: td("subscriptions") },
    { title: td("totalCompanies"), value: companyCount, icon: Building2, variant: "neutral" as const, desc: td("companies") },
  ];

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/client` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reportCards.map((card) => (
          <div key={card.title} className="floating-glass rounded-[2rem] p-6 hover:bg-white/25 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-${card.variant}/10 flex items-center justify-center text-${card.variant}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-on-surface">{card.value}</span>
            </div>
            <h3 className="text-[16px] font-bold text-on-surface mb-1">{card.title}</h3>
            <p className="text-on-surface-variant/50 text-[13px]">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="floating-glass rounded-[2rem] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-[18px] font-bold text-on-surface mb-2">{t("pageTitle")}</h2>
        <p className="text-on-surface-variant/50 text-[14px] max-w-md mx-auto mb-6">{tc("noResults")}</p>
        <button className="px-6 py-3 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          {t("generateReport")}
        </button>
      </div>
    </div>
  );
}
