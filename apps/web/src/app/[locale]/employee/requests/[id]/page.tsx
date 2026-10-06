import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader, FormSection, StatusBadge } from "@intilaqa/ui";
import { ArrowLeft, CalendarDays, Clock, FileText, User } from "lucide-react";

export default async function EmployeeRequestDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (!employee) redirect(`/${locale}/login`);

  const request = await prisma.employeeRequest.findUnique({
    where: { id },
  });

  if (!request || request.employeeId !== employee.id) notFound();

  const t = await getTranslations("requests");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  return (
    <div>
      <PageHeader
        title={request.title}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/employee` }, { label: t("title"), href: `/${locale}/employee/requests` }, { label: request.title }]}
        actions={
          <Link href={`/${locale}/employee/requests`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all">
            <ArrowLeft className="w-4 h-4" />
            {t("title")}
          </Link>
        }
      />
      <div className="max-w-2xl">
        <FormSection title={request.title}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase">{t("type")}</p>
                <p className="text-on-surface text-[14px] font-bold capitalize">{request.type.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase">{tc("startDate")}</p>
                <p className="text-on-surface text-[14px] font-bold">{new Date(request.startDate).toLocaleDateString(locale)}</p>
              </div>
            </div>
            {request.endDate && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/40">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase">{tc("endDate")}</p>
                  <p className="text-on-surface text-[14px] font-bold">{new Date(request.endDate).toLocaleDateString(locale)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase">{t("status")}</p>
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase">{td("created")}</p>
                <p className="text-on-surface text-[14px] font-bold">{new Date(request.createdAt).toLocaleDateString(locale)}</p>
              </div>
            </div>
            {request.description && (
              <div className="p-4 rounded-xl bg-white/30 border border-white/40">
                <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase mb-2">{tc("description")}</p>
                <p className="text-on-surface text-[14px] whitespace-pre-wrap">{request.description}</p>
              </div>
            )}
            {request.reason && (
              <div className="p-4 rounded-xl bg-white/30 border border-white/40">
                <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase mb-2">{t("reason")}</p>
                <p className="text-on-surface text-[14px] whitespace-pre-wrap">{request.reason}</p>
              </div>
            )}
          </div>
        </FormSection>
      </div>
    </div>
  );
}
