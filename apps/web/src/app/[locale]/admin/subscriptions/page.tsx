import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Plus, ListTree } from "lucide-react";
import { SubscriptionsContent } from "./subscriptions-content";

export default async function SubscriptionsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ search?: string; page?: string; created?: string; updated?: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");
  const td = await getTranslations("dashboard");
  const ts = await getTranslations("subscriptions");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const created = sp.created === "1";
  const updated = sp.updated === "1";
  const pageSize = 10;

  const where = search
    ? {
        OR: [
          { client: { name: { contains: search, mode: "insensitive" as const } } },
          { plan: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
        plan: { select: { name: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  const data = subscriptions.map((s) => ({
    id: s.id,
    clientName: s.client.name,
    planName: s.plan.name,
    startDate: new Date(s.startDate).toLocaleDateString(),
    endDate: new Date(s.endDate).toLocaleDateString(),
    status: s.status,
  }));

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const queryString = queryParts.join("&");

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? ts("createdSuccess") : ts("updatedSuccess")}
        </div>
      )}

      <PageHeader
        title={t("subscriptions")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("subscriptions") },
        ]}
        actions={
          <>
            <Link href={`/${locale}/admin/subscriptions/plans`} className="px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-on-surface text-[14px] font-bold hover:bg-white/60 hover:scale-[1.02] transition-all flex items-center gap-2">
              <ListTree className="w-4 h-4" />
              {ts("managePlans")}
            </Link>
            <Link href={`/${locale}/admin/subscriptions/new`} className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {ts("addSubscription")}
            </Link>
          </>
        }
      />

      <form method="GET" className="mb-6 max-w-md">
        <div className="flex gap-2">
          <input name="search" defaultValue={search} placeholder={ts("searchPlaceholder")} className="flex-1 px-4 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          <button type="submit" className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all">{tc("search")}</button>
          {search && <a href="?" className="px-4 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface-variant/60 text-[13px] font-medium hover:bg-white/50 transition-all flex items-center">{tc("clear")}</a>}
        </div>
      </form>

      <SubscriptionsContent
        subscriptions={data}
        total={total}
        locale={locale}
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        queryString={queryString}
        emptyTitle={t("subscriptions")}
        emptyDescription={ts("emptyDescription")}
      />
    </div>
  );
}
