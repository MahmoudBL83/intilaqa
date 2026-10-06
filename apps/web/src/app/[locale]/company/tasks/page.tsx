import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { TasksContent } from "./tasks-content";

export default async function CompanyTasksPage({
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
  const emp = await prisma.employee.findFirst({ where: { userId } });
  if (!emp?.companyId) redirect(`/${locale}/login`);

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 12;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: { employee: { companyId: emp.companyId } },
      include: { employee: { include: { user: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    }),
    prisma.task.count({ where: { employee: { companyId: emp.companyId } } }),
  ]);

  return (
    <TasksContent
      locale={locale}
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        employeeName: t.employee?.user.name || "Unassigned",
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate?.toISOString() || null,
      }))}
      total={total}
      page={page}
      totalPages={Math.ceil(total / pageSize)}
    />
  );
}
