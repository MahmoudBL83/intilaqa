import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable } from "@intilaqa/ui";
import { NewRequestDialog } from "./new-request-dialog";
import { ExternalLink, Filter } from "lucide-react";

export default async function EmployeeRequestsPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (!employee) redirect(`/${locale}/login`);

  const t = await getTranslations("requests");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const where: Record<string, unknown> = { employeeId: employee.id };
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.status) where.status = searchParams.status;

  const requests = await prisma.employeeRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const rows = requests.map((r) => ({
    id: r.id,
    type: r.type.replace("_", " "),
    title: r.title.length > 40 ? r.title.substring(0, 40) + "..." : r.title,
    statusDisplay: r.status,
    createdAt: r.createdAt.toLocaleDateString(locale),
  }));

  const requestTypes = ["leave", "loan", "document", "attendance", "overtime", "other"];
  const statuses = ["pending", "approved", "rejected"];

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/employee` }, { label: t("title") }]}
        actions={<NewRequestDialog />}
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4" />{tc("filter")}
        </div>
        <div className="flex gap-2">
          {requestTypes.map((type) => (
            <Link
              key={type}
              href={`/${locale}/employee/requests${searchParams.type === type ? "" : `?type=${type}`}${searchParams.status ? `&status=${searchParams.status}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${searchParams.type === type ? "bg-primary text-white" : "floating-glass text-on-surface-variant/70 hover:text-on-surface"}`}
            >
              {type.replace("_", " ")}
            </Link>
          ))}
          {searchParams.type && (
            <Link
              href={`/${locale}/employee/requests${searchParams.status ? `?status=${searchParams.status}` : ""}`}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold floating-glass text-red-500 hover:text-red-700"
            >
              {tc("clear")}
            </Link>
          )}
        </div>
        <div className="w-px h-6 bg-outline-variant/30" />
        <div className="flex gap-2">
          {statuses.map((status) => (
            <Link
              key={status}
              href={`/${locale}/employee/requests${searchParams.status === status ? "" : `?status=${status}`}${searchParams.type ? `?type=${searchParams.type}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${searchParams.status === status ? "bg-primary text-white" : "floating-glass text-on-surface-variant/70 hover:text-on-surface"}`}
            >
              {status}
            </Link>
          ))}
          {searchParams.status && (
            <Link
              href={`/${locale}/employee/requests${searchParams.type ? `?type=${searchParams.type}` : ""}`}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold floating-glass text-red-500 hover:text-red-700"
            >
              {tc("clear")}
            </Link>
          )}
        </div>
      </div>

      <DataTable
        columns={[
          { key: "type", header: t("type") },
          { key: "title", header: t("title"), render: (row: any) => (
            <Link href={`/${locale}/employee/requests/${row.id}`} className="text-primary hover:underline flex items-center gap-1">
              {row.title}<ExternalLink className="w-3 h-3" />
            </Link>
          )},
          { key: "createdAt", header: td("date") },
          { key: "statusDisplay", header: t("status"), type: "status" },
        ]}
        data={rows}
        emptyTitle={tc("noData")}
        emptyDescription={tc("noResults")}
      />
    </div>
  );
}
