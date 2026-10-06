import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TasksContent } from "./tasks-content";

export default async function TasksPage({ searchParams, params: localeParams }: { searchParams: Promise<{ search?: string; page?: string; created?: string; updated?: string }>; params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await localeParams;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");
  const td = await getTranslations("dashboard");
  const tt = await getTranslations("tasks");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const created = sp.created === "1";
  const updated = sp.updated === "1";
  const pageSize = 10;

  const where = search
    ? { title: { contains: search, mode: "insensitive" as const } }
    : {};

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const data = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    employeeName: task.employee?.user?.name || tt("unassigned"),
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—",
    priority: task.priority,
    status: task.status,
  }));

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const queryString = queryParts.join("&");

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? tc("createdSuccess") : tc("updatedSuccess")}
        </div>
      )}

      <PageHeader
        title={t("tasks")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("tasks") },
        ]}
        actions={
          <Link
            href={`/${locale}/admin/tasks/new`}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {td("myTasks")}
          </Link>
        }
      />

      <form method="GET" className="mb-6 max-w-md">
        <div className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder={tt("searchPlaceholder")}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button type="submit" className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all">
            {tc("search")}
          </button>
          {search && (
            <a href="?" className="px-4 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface-variant/60 text-[13px] font-medium hover:bg-white/50 transition-all flex items-center">
              {tc("clear")}
            </a>
          )}
        </div>
      </form>

      <TasksContent
        tasks={data}
        total={total}
        locale={locale}
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        queryString={queryString}
        emptyTitle={t("tasks")}
        emptyDescription={tt("emptyDescription")}
      />
    </div>
  );
}
