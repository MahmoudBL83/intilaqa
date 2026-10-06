import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { createUserAction } from "../actions";

export default async function NewUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("users");
  const rolesT = await getTranslations("roles");
  const dashboardT = await getTranslations("dashboard");
  const commonT = await getTranslations("common");

  const [clients, companies, departments] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.company.findMany({
      select: { id: true, name: true, client: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      select: { id: true, name: true, company: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const paramsData = searchParams ? await searchParams : {};
  const errorKey = typeof paramsData.error === "string" ? paramsData.error : "";

  const errorMessages: Record<string, string> = {
    emailExists: t("errors.emailExists"),
    missingClient: t("errors.missingClient"),
    missingCompany: t("errors.missingCompany"),
    invalidClient: t("errors.invalidClient"),
    invalidCompany: t("errors.invalidCompany"),
    invalidDepartment: t("errors.invalidDepartment"),
    clientAssigned: t("errors.clientAssigned"),
    missingFields: t("errors.missingFields"),
  };

  const errorMessage = errorKey ? errorMessages[errorKey] || t("errors.unknown") : "";

  return (
    <div>
      <PageHeader
        title={t("createTitle")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/users` },
          { label: t("createTitle") },
        ]}
        actions={
          <Link
            href={`/${locale}/admin/users`}
            className="px-5 py-2.5 rounded-2xl bg-white/30 border border-white/60 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all"
          >
            {commonT("back")}
          </Link>
        }
      />

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13px] font-semibold text-error">
          {errorMessage}
        </div>
      )}

      <form action={createUserAction} className="space-y-8">
        <input type="hidden" name="locale" value={locale} />

        <FormSection title={t("detailsTitle")} description={t("detailsDescription")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("name")}
              </label>
              <input
                name="name"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("email")}
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("role")}
              </label>
              <select
                name="role"
                required
                defaultValue="employee"
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="admin">{rolesT("admin")}</option>
                <option value="client">{rolesT("client")}</option>
                <option value="company_admin">{rolesT("companyAdmin")}</option>
                <option value="employee">{rolesT("employee")}</option>
              </select>
            </div>

            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("status")}
              </label>
              <select
                name="isActive"
                defaultValue="true"
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="true">{t("active")}</option>
                <option value="false">{t("inactive")}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("temporaryPassword")}
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <p className="mt-2 text-[12px] text-on-surface-variant/60">{t("temporaryPasswordHint")}</p>
            </div>
          </div>
        </FormSection>

        <FormSection title={t("assignmentTitle")} description={t("assignmentDescription")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("client")}
              </label>
              <select
                name="clientId"
                defaultValue=""
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">{t("selectClient")}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[12px] text-on-surface-variant/60">{t("requiredForClient")}</p>
            </div>

            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("company")}
              </label>
              <select
                name="companyId"
                defaultValue=""
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">{t("selectCompany")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}{company.client ? ` (${company.client.name})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[12px] text-on-surface-variant/60">{t("requiredForCompany")}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("department")}
              </label>
              <select
                name="departmentId"
                defaultValue=""
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">{t("selectDepartment")}</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}{department.company ? ` (${department.company.name})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[12px] text-on-surface-variant/60">{t("optionalDepartment")}</p>
            </div>
          </div>
        </FormSection>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t("createAction")}
          </button>
          <Link
            href={`/${locale}/admin/users`}
            className="px-6 py-3.5 rounded-2xl border border-white/50 bg-white/30 text-[14px] font-bold text-on-surface hover:bg-white/50 transition-all"
          >
            {commonT("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
