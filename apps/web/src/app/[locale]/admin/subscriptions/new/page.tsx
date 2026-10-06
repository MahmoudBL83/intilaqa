import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { prisma } from "@intilaqa/db";
import { createSubscriptionAction } from "../actions";

export default async function NewSubscriptionPage({
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

  const [clients, plans] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.subscriptionPlan.findMany({ select: { id: true, name: true, price: true }, where: { isActive: true }, orderBy: { price: "asc" } })
  ]);

  return (
    <div>
      <PageHeader
        title={t("addSubscription")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("subscriptions"), href: `/${locale}/admin/subscriptions` },
          { label: tc("add", { fallback: "Add" }) },
        ]}
      />

      <div className="max-w-2xl mt-6">
        <FormSection title={t("assignmentDetails")} description={""}>
          <form action={createSubscriptionAction} className="flex flex-col gap-6">
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
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("client", { fallback: "Client" })}</label>
                <select
                  name="clientId"
                  required
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all appearance-none"
                >
                  <option value="">{t("selectClient")}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("plan")}</label>
                <select
                  name="planId"
                  required
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all appearance-none"
                >
                  <option value="">{t("selectPlan")}</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} SAR)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 p-[2px]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("startDate")}</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("endDate")}</label>
                  <input
                    name="endDate"
                    type="date"
                    required
                    className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-[2px]">
                <label className="text-[13px] font-bold text-on-surface/70 px-2">{t("status")}</label>
                <select
                  name="status"
                  required
                  defaultValue="active"
                  className="w-full bg-white/40 border-outline-variant/60 focus:bg-white/70 focus:border-primary/30 rounded-2xl h-11 px-4 text-[14px] text-on-surface outline-none transition-all appearance-none"
                >
                  <option value="active">{t("active")}</option>
                  <option value="suspended">{t("suspended")}</option>
                  <option value="expired">{t("expired")}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-6 border-t border-on-surface/5">
              <a
                href={`/${locale}/admin/subscriptions`}
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