import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable, StatCard } from "@intilaqa/ui";
import { CreditCard, Calendar, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default async function SubscriptionsPage({
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

  const t = await getTranslations("subscriptions");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));

  const where = { clientId: client.id };

  const [data, total, activeCount] = await Promise.all([
    prisma.subscription.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { plan: { select: { name: true, price: true } } },
    }),
    prisma.subscription.count({ where }),
    prisma.subscription.count({ where: { clientId: client.id, status: "active" } }),
  ]);

  const rows = data.map((s) => ({
    id: s.id,
    planName: s.plan.name,
    price: `${s.plan.price} ${tc("currency")}`,
    startDate: new Date(s.startDate).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }),
    endDate: new Date(s.endDate).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }),
    statusDisplay: s.status,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => `?page=${p}`;

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/client` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title={t("subscriptionsCount")} value={total} icon={CreditCard} variant="primary" />
        <StatCard title={td("activeSubscriptions")} value={activeCount} icon={Calendar} variant="secondary" />
        <StatCard title={t("currentPlan")} value={data[0]?.plan.name ?? "\u2014"} icon={CalendarClock} variant="neutral" />
      </div>

      <DataTable
        columns={[
          { key: "planName", header: t("planName") },
          { key: "price", header: t("price") },
          { key: "startDate", header: td("startDate") },
          { key: "endDate", header: td("endDate") },
          { key: "statusDisplay", header: td("status"), type: "status" },
        ]}
        data={rows}
        emptyTitle={t("noSubscriptions")}
        emptyDescription={t("noSubscriptionsDesc")}
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
