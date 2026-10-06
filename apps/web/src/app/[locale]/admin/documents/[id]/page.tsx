import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { deleteDocumentAction, updateDocumentAction } from "../actions";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("documents");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const document = await prisma.document.findUnique({ where: { id: p.id } });
  if (!document) notFound();

  const updateActionWithId = updateDocumentAction.bind(null, document.id);
  const deleteActionWithId = deleteDocumentAction.bind(null, document.id);

  return (
    <div>
      <PageHeader title={document.name} breadcrumbs={[{ label: dashboardT("overview"), href: `/${p.locale}/admin` }, { label: t("title"), href: `/${p.locale}/admin/documents` }, { label: document.name }]}
        actions={<form action={deleteActionWithId} onSubmit={(e) => { if (!confirm(commonT("confirmDelete"))) e.preventDefault(); }}>
          <input type="hidden" name="locale" value={p.locale} />
          <button type="submit" className="px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-500 text-[14px] font-bold hover:bg-red-500/20 transition-all">{commonT("delete")}</button>
        </form>} />
      <div className="max-w-3xl">
        <FormSection title={t("title")} description={commonT("description")}>
          <form action={updateActionWithId} className="space-y-6">
            <input type="hidden" name="locale" value={p.locale} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{commonT("name")}</label>
                <input name="name" defaultValue={document.name} required className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("type")}</label>
                <select name="type" defaultValue={document.type} className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]">
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
                <input type="url" name="url" defaultValue={document.url} placeholder="https://..." className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("expiryDate")}</label>
                <input type="date" name="expiryDate" defaultValue={document.expiryDate?.toISOString().substring(0, 10) || ""} className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("status")}</label>
                <select name="status" defaultValue={document.status} className="w-full px-4 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/40 text-on-surface text-[14px]">
                  <option value="active">{t("valid")}</option>
                  <option value="expired">{t("expired")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <a href={`/${p.locale}/admin/documents`} className="px-6 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all">{commonT("cancel")}</a>
              <button type="submit" className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] transition-all">{commonT("save")}</button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
}
