import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Plus } from "lucide-react";
import { PlansContent } from "./plans-content";

export default async function PlansPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ search?: string; page?: string; created?: string; updated?: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("subscriptions");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const search = sp.search || "";
  const created = sp.created === "1";
  const updated = sp.updated === "1";
  const pageSize = 10;

  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};

  const [plans, total] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { subscriptions: true } } },
    }),
    prisma.subscriptionPlan.count({ where }),
  ]);

  const data = plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", { style: "currency", currency: "SAR" }).format(p.price),
    subscriptionsCount: p._count.subscriptions.toString(),
    statusDisplay: p.isActive ? "active" : "inactive",
  }));

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const queryString = queryParts.join("&");

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? tc("createdSuccess", { fallback: "Created successfully" }) : tc("updatedSuccess", { fallback: "Updated successfully" })}
        </div>
      )}

      <PageHeader
        title={t("plansTitle", { fallback: "Subscription Plans" })}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("subscriptions", { fallback: "Subscriptions" }), href: `/${locale}/admin/subscriptions` },
          { label: t("plansTitle", { fallback: "Plans" }) },
        ]}
        actions={
          <Link href={`/${locale}/admin/subscriptions/plans/new`} className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {tc("add", { fallback: "Add" })}
          </Link>
        }
      />

      <form method="GET" className="mb-6 max-w-md">
        <div className="flex gap-2">
          <input name="search" defaultValue={search} placeholder={`${tc("search", { fallback: "Search" })}...`} className="flex-1 px-4 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" />
          <button type="submit" className="px-5 py-2.5 rounded-2xl bg-primary/10 text-primary text-[14px] font-bold hover:bg-primary hover:text-white transition-all">{tc("search", { fallback: "Search" })}</button>
        </div>
      </form>

      <PlansContent
        plans={data}
        total={total}
        locale={locale}
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        queryString={queryString}
        emptyTitle={tc("noData", { fallback: "No Data" })}
        emptyDescription={t("noPlansDesc", { fallback: "Create your first subscription plan" })}
      />
    </div>
  );
}
