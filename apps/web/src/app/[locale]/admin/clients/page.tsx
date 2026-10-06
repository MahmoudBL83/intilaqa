import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Plus } from "lucide-react";
import { ClientsContent } from "./clients-content";

const PAGE_SIZE = 10;

export default async function ClientsPage({ 
  searchParams,
  params
}: { 
  searchParams: Promise<{ search?: string; page?: string; created?: string; updated?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("clients");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" as const };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { companies: true } },
        subscriptions: {
          where: { status: "active" },
          take: 1,
          include: { plan: { select: { name: true } } },
        },
      },
    }),
    prisma.client.count({ where }),
  ]);

  const rows = data.map((item) => ({
    id: item.id,
    name: item.name,
    domain: item.domain || "",
    companyCount: String((item._count as { companies: number })?.companies ?? 0),
    planName: (item.subscriptions?.[0] as { plan?: { name: string } } | undefined)?.plan?.name || "—",
    statusDisplay: item.isActive ? "active" : "inactive",
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const queryString = queryParts.join("&");

  const created = sp.created === "1";
  const updated = sp.updated === "1";

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? t("createdSuccess", { fallback: tc("save") }) : t("updatedSuccess", { fallback: tc("save") })}
        </div>
      )}

      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("title") },
        ]}
        actions={
          <Link
            href={`/${locale}/admin/clients/new`}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("addClient")}
          </Link>
        }
      />

      <form method="GET" className="mb-6 max-w-md">
        <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl h-11 px-4 transition-all">
          <input
            name="search"
            defaultValue={search}
            placeholder={`${tc("search")}...`}
            className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium"
          />
          <button type="submit" className="text-on-surface-variant/40 hover:text-on-surface-variant/70 transition-colors shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </form>

      <ClientsContent
        clients={rows}
        total={total}
        activeCount={data.filter((c) => c.isActive).length}
        locale={locale}
        page={page}
        totalPages={totalPages}
        queryString={queryString}
        emptyTitle={t("noClients")}
        emptyDescription={t("noClientsDesc")}
      />
    </div>
  );
}
