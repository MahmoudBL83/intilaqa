import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { updateClientAction } from "../actions";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      _count: { select: { companies: true } },
      subscriptions: { include: { plan: true }, orderBy: { endDate: "desc" }, take: 1 },
    },
  });

  const totalEmployees = client
    ? (await prisma.employee.count({ where: { company: { clientId: client.id } } }))
    : 0;

  if (!client) {
    redirect(`/${locale}/admin/clients`);
  }

  const t = await getTranslations("clients");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const sp = await searchParams;
  const errorKey = typeof sp.error === "string" ? sp.error : "";
  const updated = sp.updated === "1";

  return (
    <div>
      <PageHeader
        title={t("edit", { fallback: "Edit Client" })}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/clients` },
          { label: client.name },
        ]}
      />

      {updated && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {t("updatedSuccess", { fallback: commonT("save") })}
        </div>
      )}

      {errorKey && (
        <div className="mb-6 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13px] font-semibold text-error">
          {errorKey === "missingFields" && t("errors.missingFields", { fallback: "Please fill all required fields." })}
          {errorKey === "emailExists" && t("errors.emailExists", { fallback: "Email already exists." })}
          {errorKey === "notFound" && commonT("noData")}
          {errorKey === "unknown" && commonT("error")}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="floating-glass rounded-xl p-4 text-center">
          <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">Companies</p>
          <p className="text-on-surface text-[20px] font-bold">{client._count.companies}</p>
        </div>
        <div className="floating-glass rounded-xl p-4 text-center">
          <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">Employees</p>
          <p className="text-on-surface text-[20px] font-bold">{totalEmployees}</p>
        </div>
        <div className="floating-glass rounded-xl p-4 text-center">
          <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">Subscription</p>
          <p className="text-on-surface text-[14px] font-bold">{client.subscriptions[0]?.plan.name || "—"}</p>
        </div>
      </div>

      <form action={updateClientAction} className="space-y-8 max-w-3xl">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="clientId" value={client.id} />
        
        <FormSection title={t("clientDetails", { fallback: "Client Details" })}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("name")} *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={client.name}
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("domain")}
              </label>
              <input
                type="text"
                name="domain"
                defaultValue={client.domain || ""}
                placeholder="example.com"
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title={t("adminAccount", { fallback: "Primary Admin Account" })}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {t("contactEmail")} / {commonT("email")} *
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={client.contactEmail}
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-on-surface-variant/60 text-[12px] font-bold uppercase tracking-wider mb-2">
                {commonT("password", { fallback: "New Password" })}
              </label>
              <input
                type="password"
                name="password"
                placeholder={t("newPasswordHint", { fallback: "Leave blank to keep current password" })}
                className="w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={client.isActive}
              className="w-5 h-5 rounded-md border-outline-variant/60 bg-white/40 text-primary focus:ring-primary/20 transition-all"
            />
            <label htmlFor="isActive" className="text-[14px] font-bold text-on-surface">
              {t("active")}
            </label>
          </div>
        </FormSection>

        <div className="flex justify-end gap-3 pt-6">
          <a
            href={`/${locale}/admin/clients`}
            className="px-6 py-3 rounded-2xl bg-white/40 text-on-surface text-[14px] font-bold border border-white/60 hover:bg-white/60 transition-all"
          >
            {commonT("cancel")}
          </a>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {commonT("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
