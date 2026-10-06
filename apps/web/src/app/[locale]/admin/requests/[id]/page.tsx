import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection } from "@intilaqa/ui";
import { deleteRequestAction, updateRequestStatusAction } from "../actions";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("requests");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");
  const statusT = await getTranslations("status");

  const record = await prisma.employeeRequest.findUnique({
    where: { id: p.id },
    include: {
      employee: {
        include: { user: { select: { name: true } }, company: { select: { name: true } } },
      },
    },
  });

  if (!record) notFound();

  const deleteActionWithId = deleteRequestAction.bind(null, record.id);
  const approveActionWithId = updateRequestStatusAction.bind(null, record.id, "approved");
  const rejectActionWithId = updateRequestStatusAction.bind(null, record.id, "rejected");

  const typeMap: Record<string, string> = {
    leave: t("leave"),
    expense: t("expense"),
    overtime: t("overtime"),
  };

  const requestType = typeMap[record.type] || record.type;

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${p.locale}/admin` },
          { label: t("title"), href: `/${p.locale}/admin/requests` },
          { label: record.title },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            {record.status === "pending" && (
              <>
                <form action={approveActionWithId}>
                  <input type="hidden" name="locale" value={p.locale} />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary hover:text-white transition-all"
                  >
                    {statusT("approved")}
                  </button>
                </form>
                <form action={rejectActionWithId}>
                  <input type="hidden" name="locale" value={p.locale} />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-error/10 text-error text-[13px] font-bold hover:bg-error hover:text-white transition-all"
                  >
                    {statusT("rejected")}
                  </button>
                </form>
              </>
            )}
            <form
              action={deleteActionWithId}
              onSubmit={(event) => {
                if (!confirm(commonT("confirmDelete", { fallback: "Are you sure?" }))) event.preventDefault();
              }}
            >
              <input type="hidden" name="locale" value={p.locale} />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-red-500/10 text-red-500 text-[13px] font-bold hover:bg-red-500/20 transition-all"
              >
                {commonT("delete")}
              </button>
            </form>
          </div>
        }
      />

      <div className="max-w-3xl">
        <FormSection
          title={t("title", { fallback: "Request Details" })}
          description={t("type", { fallback: "Review the request information" })}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("employee")}
                </label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">
                  {record.employee.user.name} ({record.employee.company.name})
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("type")}
                </label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">
                  {requestType}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("requestTitle")}
                </label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">
                  {record.title}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {t("status")}
                </label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">
                  {statusT(record.status)}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("startDate")}
                </label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">
                  {record.startDate ? new Date(record.startDate).toLocaleDateString(p.locale) : "—"}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("endDate")}
                </label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">
                  {record.endDate ? new Date(record.endDate).toLocaleDateString(p.locale) : "—"}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-on-surface mb-1">
                  {commonT("description")}
                </label>
                <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px] min-h-[100px] whitespace-pre-wrap">
                  {record.description || "—"}
                </div>
              </div>
            </div>

            {record.reason && (
              <div className="mt-4">
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("reason")}</label>
                <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px] whitespace-pre-wrap">{record.reason}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("createdAt")}</label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">{new Date(record.createdAt).toLocaleDateString(p.locale)}</div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-on-surface mb-1">{t("updatedAt")}</label>
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-on-surface text-[14px]">{new Date(record.updatedAt).toLocaleDateString(p.locale)}</div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href={`/${p.locale}/admin/requests`}
                className="px-6 py-2.5 rounded-2xl bg-white/30 border border-white/40 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all"
              >
                {commonT("back")}
              </a>
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}
