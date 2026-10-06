import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { createTaskAction } from "../actions";

export default async function NewTaskPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("tasks");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const employees = await prisma.employee.findMany({
    include: {
      user: { select: { name: true } },
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title={commonT("create", { fallback: "Create Task" })}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: dashboardT("myTasks", { fallback: "Tasks" }), href: `/${locale}/admin/tasks` },
          { label: commonT("create", { fallback: "Create Task" }) },
        ]}
      />

      <div className="max-w-3xl">
        <FormSection
          title={commonT("details", { fallback: "Task Details" })}
          description={commonT("description", { fallback: "Describe the task and assign an optional owner" })}
        >
          <form action={createTaskAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {dashboardT("task", { fallback: "Title" })}
                </label>
                <input
                  name="title"
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("priority", { fallback: "Priority" })}
                </label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="low">{t("low")}</option>
                  <option value="medium">{t("medium")}</option>
                  <option value="high">{t("high")}</option>
                  <option value="urgent">{t("urgent")}</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("status", { fallback: "Status" })}
                </label>
                <select
                  name="status"
                  defaultValue="todo"
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
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href={`/${locale}/admin/tasks`}
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
