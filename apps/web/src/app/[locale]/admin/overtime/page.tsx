import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { OvertimeContent } from "./overtime-content";

export default async function OvertimePage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string; company?: string; created?: string; updated?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("overtime");
  const ct = await getTranslations("common");
  const dt = await getTranslations("dashboard");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const companyFilter = sp.company || "";
  const created = sp.created === "1";
  const updated = sp.updated === "1";
  const pageSize = 10;

  const [companies] = await Promise.all([
    prisma.company.findMany({ select: { id: true, name: true, client: { select: { id: true, name: true } } }, orderBy: { name: "asc" } }),
  ]);

  const where: Record<string, unknown> = {};
  if (search) where.employee = { user: { name: { contains: search, mode: "insensitive" as const } } };
  if (companyFilter) where.employee = { ...(where.employee as any || {}), companyId: companyFilter };

  const [records, total, totalHoursAgg] = await Promise.all([
    prisma.overtimeRecord.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { employee: { include: { user: { select: { name: true } }, company: { select: { name: true } } } } },
    }),
    prisma.overtimeRecord.count({ where }),
    prisma.overtimeRecord.aggregate({ where, _sum: { hours: true } }),
  ]);

  const data = records.map((r) => ({
    id: r.id,
    employeeName: r.employee.user.name,
    companyName: r.employee.company.name,
    date: new Date(r.date).toLocaleDateString(locale),
    hours: r.hours,
    rate: `${r.rate}x`,
    status: r.status,
  }));

  const companyList = companies.map((c) => ({ id: c.id, name: c.name, clientName: (c.client as any)?.name ?? "" }));

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (companyFilter) queryParts.push(`company=${encodeURIComponent(companyFilter)}`);
  const queryString = queryParts.join("&");

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? ct("createdSuccess") : ct("updatedSuccess")}
        </div>
      )}

      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: dt("overview"), href: `/${locale}/admin` }, { label: t("title") }]}
        actions={
          <Link href={`/${locale}/admin/overtime/new`} className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t("addOvertime")}
          </Link>
        }
      />

      <AdminFilterBar clients={[]} companies={companyList} currentCompany={companyFilter} locale={locale} />

      <OvertimeContent
        records={data}
        total={total}
        totalHours={totalHoursAgg._sum.hours ?? 0}
        locale={locale}
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        queryString={queryString}
        emptyTitle={t("title")}
        emptyDescription={t("emptyDescription")}
      />
    </div>
  );
}
