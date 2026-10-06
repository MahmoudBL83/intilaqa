import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { createDocumentAction } from "../actions";

export default async function NewDocumentPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("documents");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  return (
    <div>
      <PageHeader title={t("newDocument")} breadcrumbs={[{ label: dashboardT("overview"), href: `/${locale}/admin` }, { label: t("title"), href: `/${locale}/admin/documents` }, { label: t("newDocument") }]} />
      <div className="max-w-3xl">
        <FormSection title={t("newDocument")} description={commonT("description")}>
          <form action={createDocumentAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{commonT("name")}</label>
                <input name="name" required className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("type")}</label>
                <select name="type" className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="COMMERCIAL_REGISTRATION">{t("cr")}</option>
                  <option value="MUNICIPALITY_LICENSE">{t("municipality")}</option>
                  <option value="ZAKAT_CERTIFICATE">{t("zakat")}</option>
                  <option value="IQAMA">{t("iqama")}</option>
                  <option value="PASSPORT">{t("passport")}</option>
                  <option value="WORK_LICENSE">{t("workLicense")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("upload")}</label>
                <input type="url" name="url" placeholder="https://..." className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("expiryDate")}</label>
                <input type="date" name="expiryDate" className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("status")}</label>
                <select name="status" defaultValue="active" className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]">
                  <option value="active">{t("valid")}</option>
                  <option value="expired">{t("expired")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <a href={`/${locale}/admin/documents`} className="px-6 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all">{commonT("cancel")}</a>
              <button type="submit" className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all">{commonT("save")}</button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
}
