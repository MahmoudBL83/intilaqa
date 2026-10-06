import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { prisma } from "@intilaqa/db";
import { createCompanyAction } from "../actions";

export default async function NewCompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("companies");
  const tc = await getTranslations("common");
  const td = await getTranslations("dashboard");

  const sp = await searchParams;
  const { error } = sp;

  // We need to fetch all clients to allow allocating the new company to an existing client.
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title={t("addCompany")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("title"), href: `/${locale}/admin/companies` },
          { label: t("addCompany") },
        ]}
      />

      <div className="max-w-2xl mt-6">
        <FormSection title={t("addCompany")} description={""}>
          <form action={createCompanyAction} className="flex flex-col gap-6">
            <input type="hidden" name="locale" value={locale} />
            
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
                  placeholder={t("name")}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("client")}</label>
                <select
                  name="clientId"
                  required
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
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{tc("address", { fallback: "Address" })}</label>
                <input
                  name="address"
                  type="text"
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 px-2 mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked
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
                {tc("cancel")}
              </a>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-[14px] font-bold shadow-lg shadow-primary/20 transition-all"
              >
                {tc("save")}
              </button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
}
