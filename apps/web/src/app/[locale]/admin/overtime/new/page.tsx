import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { createOvertimeAction } from "../actions";

export default async function NewOvertimePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("overtime");
  const commonT = await getTranslations("common");
  const statusT = await getTranslations("status");
  const dashboardT = await getTranslations("dashboard");

  const sp = await searchParams;
  const error = sp.error;
  const errorMessages: Record<string, string> = { missingFields: commonT("missingFields"), invalidEmployee: commonT("invalidEmployee"), unknown: commonT("unknownError") };

  const employees = await prisma.employee.findMany({
    include: { user: { select: { name: true } }, company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title={t("addOvertime")} breadcrumbs={[{ label: dashboardT("overview"), href: `/${locale}/admin` }, { label: t("title"), href: `/${locale}/admin/overtime` }, { label: t("addOvertime") }]} />
      <div className="max-w-3xl">
        {error && <div className="mb-4 p-3 rounded-2xl bg-error/10 border border-error/20 text-error text-[13px] font-medium">{errorMessages[error] || commonT("unknownError")}</div>}
        <FormSection title={t("overtimeDetails")} description={t("overtimeDescription")}>
          <form action={createOvertimeAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("employee")}</label>
                <select name="employeeId" required className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">{commonT("select")}</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.user.name} ({emp.company.name})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("date")}</label>
                <input type="date" name="date" required className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("hours")}</label>
                <input type="number" name="hours" min="0" step="0.25" required className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("rate")}</label>
                <input type="number" name="rate" min="0" step="0.01" defaultValue={1.5} className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-on-surface mb-1">{commonT("notes")}</label>
                <textarea name="notes" rows={3} className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("status")}</label>
                <select name="status" defaultValue="pending" className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]">
                  <option value="pending">{statusT("pending")}</option>
                  <option value="approved">{statusT("approved")}</option>
                  <option value="rejected">{statusT("rejected")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <a href={`/${locale}/admin/overtime`} className="px-6 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all">{commonT("cancel")}</a>
              <button type="submit" className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all">{commonT("save")}</button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
}
