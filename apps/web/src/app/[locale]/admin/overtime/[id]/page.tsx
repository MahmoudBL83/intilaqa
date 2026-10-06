import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { deleteOvertimeAction, setOvertimeStatusAction, updateOvertimeAction } from "../actions";

export default async function EditOvertimePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("overtime");
  const commonT = await getTranslations("common");
  const statusT = await getTranslations("status");
  const dashboardT = await getTranslations("dashboard");

  const [record, employees] = await Promise.all([
    prisma.overtimeRecord.findUnique({
      where: { id: p.id },
      include: {
        employee: {
          include: { user: { select: { name: true } }, company: { select: { name: true } } },
        },
      },
    }),
    prisma.employee.findMany({
      include: {
        user: { select: { name: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!record) notFound();

  const updateActionWithId = updateOvertimeAction.bind(null, record.id);
  const deleteActionWithId = deleteOvertimeAction.bind(null, record.id);
  const approveActionWithId = setOvertimeStatusAction.bind(null, record.id, "approved");
  const rejectActionWithId = setOvertimeStatusAction.bind(null, record.id, "rejected");

  return (
    <div>
      <PageHeader
        title={t("editOvertime", { fallback: "Edit Overtime" })}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${p.locale}/admin` },
          { label: t("title", { fallback: "Overtime" }), href: `/${p.locale}/admin/overtime` },
          { label: record.employee.user.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <form action={approveActionWithId}>
              <input type="hidden" name="locale" value={p.locale} />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary hover:text-white transition-all"
              >
                {statusT("approved")}
              </button>
            </form>
            <form action={rejectActionWithId}>
              <input type="hidden" name="locale" value={p.locale} />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-error/10 text-error text-[13px] font-bold hover:bg-error hover:text-white transition-all"
              >
                {statusT("rejected")}
              </button>
            </form>
            <form
              action={deleteActionWithId}
              onSubmit={(event) => {
                if (!confirm(commonT("confirmDelete", { fallback: "Are you sure?" }))) event.preventDefault();
              }}
            >
              <input type="hidden" name="locale" value={p.locale} />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-red-500/10 text-red-500 text-[13px] font-bold hover:bg-red-500/20 transition-all"
              >
                {commonT("delete", { fallback: "Delete" })}
              </button>
            </form>
          </div>
        }
      />

      <div className="max-w-3xl">
        <FormSection
          title={t("overtimeDetails", { fallback: "Overtime Details" })}
          description={t("overtimeDescription", { fallback: "Log employee overtime entries and status" })}
        >
          <form action={updateActionWithId} className="space-y-6">
            <input type="hidden" name="locale" value={p.locale} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("employee", { fallback: "Employee" })}
                </label>
                <select
                  name="employeeId"
                  required
                  defaultValue={record.employeeId}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="">{commonT("select", { fallback: "Select" })}</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user.name} ({employee.company.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("date", { fallback: "Date" })}
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={record.date.toISOString().slice(0, 10)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("hours", { fallback: "Hours" })}
                </label>
                <input
                  type="number"
                  name="hours"
                  min="0"
                  step="0.25"
                  required
                  defaultValue={record.hours}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("rate", { fallback: "Rate" })}
                </label>
                <input
                  type="number"
                  name="rate"
                  min="0"
                  step="0.01"
                  defaultValue={record.rate}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("status", { fallback: "Status" })}
                </label>
                <select
                  name="status"
                  defaultValue={record.status}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="pending">{statusT("pending")}</option>
                  <option value="approved">{statusT("approved")}</option>
                  <option value="rejected">{statusT("rejected")}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href={`/${p.locale}/admin/overtime`}
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
