import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { createEmployeeAction } from "../actions";

export default async function NewEmployeePage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("employees");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const [companies, departments] = await Promise.all([
    prisma.company.findMany({ select: { id: true, name: true, clientId: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ select: { id: true, name: true, companyId: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title={t("addEmployee")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/employees` },
          { label: t("addEmployee") },
        ]}
      />

      <div className="max-w-3xl">
        <FormSection title={t("employeeDetails", { fallback: "Employee Details" })} description={t("employeeDescription", { fallback: "Enter employee and user account information" })}>
          <form action={createEmployeeAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("name")}
                </label>
                <input
                  name="name"
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
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("password")}
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("employeeId", { fallback: "Employee ID" })}
                </label>
                <input
                  name="employeeId"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href={`/${locale}/admin/employees`}
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
