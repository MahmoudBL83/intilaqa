import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { createPlanAction } from "../actions";

export default async function NewPlanPage({
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

  const t = await getTranslations("subscriptions");
  const tc = await getTranslations("common");
  const td = await getTranslations("dashboard");

  const sp = await searchParams;
  const { error } = sp;

  return (
    <div>
      <PageHeader
        title={tc("add", { fallback: "Add Plan" })}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("plansTitle", { fallback: "Plans" }), href: `/${locale}/admin/subscriptions/plans` },
          { label: tc("add", { fallback: "Add Plan" }) },
        ]}
      />

      <div className="max-w-2xl mt-6">
        <FormSection title={tc("details", { fallback: "Details" })} description={""}>
          <form action={createPlanAction} className="flex flex-col gap-6">
            <input type="hidden" name="locale" value={locale} />
            
            {error === "missingFields" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-600">
                {tc("missingFields", { fallback: "Please fill all required fields" })}
              </div>
            )}
            {error === "unknown" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-600">
                {tc("unknownError", { fallback: "An unexpected error occurred" })}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{tc("name", { fallback: "Name" })}</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={tc("name", { fallback: "Name" })}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{tc("description", { fallback: "Description" })}</label>
                <textarea
                  name="description"
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl p-4 text-[14px] text-on-surface outline-none transition-all min-h-[100px] resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{tc("price", { fallback: "Price (SAR)" })}</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={0}
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2 mb-2">{tc("features", { fallback: "Features" })}</label>
                <div className="grid grid-cols-2 gap-2 px-2">
                  {["attendance", "payroll", "requests", "documents", "tasks", "reports", "compliance", "saudization", "shifts"].map((f) => (
                    <label key={f} className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/30 border border-white/40 cursor-pointer hover:bg-white/50">
                      <input type="checkbox" name="features" value={f} className="w-4 h-4 rounded text-primary" />
                      <span className="text-[13px] font-medium text-on-surface capitalize">{f}</span>
                    </label>
                  ))}
                </div>
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
                href={`/${locale}/admin/subscriptions/plans`}
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