import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { prisma } from "@intilaqa/db";
import { updateCompanyAction } from "../actions";

export default async function EditCompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const company = await prisma.company.findUnique({
    where: { id },
    include: { _count: { select: { employees: true, departments: true } } },
  });

  const [saudiCount, expatCount] = company ? await Promise.all([
    prisma.employee.count({ where: { companyId: company.id, isSaudi: true } }),
    prisma.employee.count({ where: { companyId: company.id, isSaudi: false } }),
  ]) : [0, 0];

  if (!company) {
    redirect(`/${locale}/admin/companies?error=notFound`);
  }

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const t = await getTranslations("companies");
  const tc = await getTranslations("common");
  const td = await getTranslations("dashboard");

  const sp = await searchParams;
  const { error, updated } = sp;

  return (
    <div>
      {updated === "1" && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {tc("updatedSuccess", { fallback: "Saved successfully" })}
        </div>
      )}

      <PageHeader
        title={company.name}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/companies` },
          { label: tc("edit", { fallback: "Edit" }) },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Employees", value: company._count.employees },
          { label: "Saudi", value: saudiCount },
          { label: "Expat", value: expatCount },
          { label: "Saudization", value: `${company.saudizationPercent}%` },
        ].map((s) => (
          <div key={s.label} className="floating-glass rounded-xl p-3 text-center">
            <p className="text-on-surface-variant/50 text-[10px] uppercase tracking-wider font-bold">{s.label}</p>
            <p className="text-on-surface text-[18px] font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mt-6">
        <FormSection title={tc("edit", { fallback: "Edit" })} description={""}>
          <form action={updateCompanyAction} className="flex flex-col gap-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="companyId" value={company.id} />
            
            {error === "missingFields" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-600">
                {tc("missingFields", { fallback: "Please fill all required fields" })}
              </div>
            )}
            {error === "invalidClient" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-600">
                Invalid Client selected
              </div>
            )}
            {error === "unknown" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-600">
                {tc("unknownError", { fallback: "An unexpected error occurred" })}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("name")}</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={company.name}
                  placeholder={t("name")}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("client")}</label>
                <select
                  name="clientId"
                  required
                  defaultValue={company.clientId}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all appearance-none"
                >
                  <option value="">-- {t("client")} --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("industry", { fallback: "Industry" })}</label>
                <input
                  name="industry"
                  type="text"
                  defaultValue={company.industry || ""}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{tc("address", { fallback: "Address" })}</label>
                <input
                  name="address"
                  type="text"
                  defaultValue={company.address || ""}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 px-2 mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={company.isActive}
                  id="isActive"
                  className="w-5 h-5 rounded-lg border-outline-variant/60 text-primary focus:ring-primary/20 bg-white/40"
                />
                <label htmlFor="isActive" className="text-[14px] font-bold text-on-surface">
                  {tc("active", { fallback: "Active" })}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-6 border-t border-on-surface/5">
              <a
                href={`/${locale}/admin/companies`}
                className="px-5 py-2.5 rounded-2xl border border-white/60 bg-white/40 hover:bg-white/60 text-[14px] font-bold text-on-surface transition-all"
              >
                {tc("cancel", { fallback: "Cancel" })}
              </a>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-[14px] font-bold shadow-lg shadow-primary/20 transition-all"
              >
                {tc("save", { fallback: "Save changes" })}
              </button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
}
