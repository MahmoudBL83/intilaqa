import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { TasksContent } from "./tasks-content";

export default async function EmployeeTasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const userId = (session.user as { id?: string }).id;
  const emp = await prisma.employee.findFirst({ where: { userId } });
  if (!emp) redirect(`/${locale}/login`);

  const tasks = await prisma.task.findMany({
    where: { employeeId: emp.id },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <TasksContent
      locale={locale}
      tasks={tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, status: t.status, dueDate: t.dueDate?.toISOString() || null }))}
    />
  );
}
