import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { deleteTaskAction, updateTaskAction } from "../actions";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("tasks");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const [task, employees] = await Promise.all([
    prisma.task.findUnique({
      where: { id: p.id },
    }),
    prisma.employee.findMany({
      include: {
        user: { select: { name: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!task) notFound();

  const updateActionWithId = updateTaskAction.bind(null, task.id);
  const deleteActionWithId = deleteTaskAction.bind(null, task.id);

  return (
    <div>
      <PageHeader
        title={commonT("edit", { fallback: "Edit Task" })}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${p.locale}/admin` },
          { label: dashboardT("myTasks", { fallback: "Tasks" }), href: `/${p.locale}/admin/tasks` },
          { label: task.title },
        ]}
        actions={
          <form
            action={deleteActionWithId}
            onSubmit={(event) => {
              if (!confirm(commonT("confirmDelete", { fallback: "Are you sure?" }))) event.preventDefault();
            }}
          >
            <input type="hidden" name="locale" value={p.locale} />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-500 text-[14px] font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              {commonT("delete", { fallback: "Delete" })}
            </button>
          </form>
        }
      />

      <div className="max-w-3xl">
        <FormSection
          title={commonT("details", { fallback: "Task Details" })}
          description={commonT("description", { fallback: "Describe the task and assign an optional owner" })}
        >
          <form action={updateActionWithId} className="space-y-6">
            <input type="hidden" name="locale" value={p.locale} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {dashboardT("task", { fallback: "Title" })}
                </label>
                <input
                  name="title"
                  defaultValue={task.title}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {dashboardT("manageUsers", { fallback: "Assignee" })}
                </label>
                <select
                  name="employeeId"
                  defaultValue={task.employeeId || ""}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="">{commonT("none", { fallback: "None" })}</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user.name} ({employee.company.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {dashboardT("dueDate", { fallback: "Due Date" })}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("status", { fallback: "Status" })}
                </label>
                <select
                  name="status"
                  defaultValue={task.status}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("description", { fallback: "Description" })}
                </label>
                <textarea
                  name="description"
                  defaultValue={task.description || ""}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href={`/${p.locale}/admin/tasks`}
                className="px-6 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all"
              >
                {commonT("cancel")}
              </a>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow"
              >
                {commonT("save")}
              </button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
}
