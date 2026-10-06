import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { updateEmployeeAction, deleteEmployeeAction } from "../actions";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("employees");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const [employee, companies, departments] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: p.id },
      include: {
        user: true,
        documents: { where: { status: "active" }, take: 5 },
        _count: { select: { violations: true, attendanceRecords: true, requests: true } },
      },
    }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const pendingViolations = employee
    ? await prisma.employeeViolation.count({ where: { employeeId: employee.id, status: "pending" } })
    : 0;

  if (!employee) {
    notFound();
  }

  const updateActionWithId = updateEmployeeAction.bind(null, employee.id);
  const deleteActionWithId = deleteEmployeeAction.bind(null, employee.id);

  return (
    <div>
      <PageHeader
        title={t("editEmployee", { fallback: "Edit Employee" })}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${p.locale}/admin` },
          { label: t("title"), href: `/${p.locale}/admin/employees` },
          { label: employee.user.name },
        ]}
        actions={
          <form action={deleteActionWithId} onSubmit={(e) => { if(!confirm(commonT("confirmDelete", { fallback: "Are you sure?" }))) e.preventDefault(); }}>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Attendance", value: employee._count.attendanceRecords },
          { label: "Requests", value: employee._count.requests },
          { label: "Violations", value: employee._count.violations },
          { label: "Pending", value: pendingViolations },
        ].map((s) => (
          <div key={s.label} className="floating-glass rounded-xl p-3 text-center">
            <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{s.label}</p>
            <p className="text-on-surface text-[18px] font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl">
        <FormSection title={t("employeeDetails", { fallback: "Employee Details" })} description={t("employeeDescription", { fallback: "Update employee and user account information" })}>
          <form action={updateActionWithId} className="space-y-6">
            <input type="hidden" name="locale" value={p.locale} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("name")}
                </label>
                <input
                  name="name"
                  defaultValue={employee.user.name}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("email")}
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={employee.user.email}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("password", { fallback: "Change Password (optional)" })}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={commonT("leaveBlankToKeep", { fallback: "Leave blank to keep unchanged" })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div className="flex items-center mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={employee.isActive}
                    className="w-4 h-4 rounded text-primary border-white/40 bg-white/50 focus:ring-primary/30"
                  />
                  <div className="text-[13px] font-bold text-on-surface">
                    {commonT("active", { fallback: "Active Status" })}
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("company")}
                </label>
                <select
                  name="companyId"
                  required
                  defaultValue={employee.companyId}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="">{commonT("select", { fallback: "Select..." })}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("department", { fallback: "Department" })}
                </label>
                <select
                  name="departmentId"
                  defaultValue={employee.departmentId || ""}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                >
                  <option value="">{commonT("none", { fallback: "None" })}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("position")}
                </label>
                <input
                  name="position"
                  defaultValue={employee.position || ""}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("salary", { fallback: "Salary" })}
                </label>
                <input
                  name="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={employee.salary}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("employeeId", { fallback: "Employee ID" })}
                </label>
                <input
                  name="employeeId"
                  defaultValue={employee.employeeId || ""}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href={`/${p.locale}/admin/employees`}
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
