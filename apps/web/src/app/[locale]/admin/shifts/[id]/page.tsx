import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { deleteShiftAction, updateShiftAction } from "../actions";
import { EditShiftForm } from "./edit-shift-form";

export default async function EditShiftPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  const p = await params;
  if (!session?.user) redirect(`/${p.locale}/login`);

  const t = await getTranslations("shifts");
  const commonT = await getTranslations("common");
  const dashboardT = await getTranslations("dashboard");

  const [shift, companies, assignments] = await Promise.all([
    prisma.shift.findUnique({ where: { id: p.id }, include: { company: { select: { name: true } } } }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.shiftAssignment.findMany({
      where: { shiftId: p.id },
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { startDate: "desc" },
      take: 20,
    }),
  ]);

  if (!shift) notFound();

  const updateActionWithId = updateShiftAction.bind(null, shift.id);
  const deleteActionWithId = deleteShiftAction.bind(null, shift.id);

  return (
    <div>
      <PageHeader
        title={t("editShift")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${p.locale}/admin` },
          { label: t("title"), href: `/${p.locale}/admin/shifts` },
          { label: shift.name },
        ]}
        actions={
          <form action={deleteActionWithId} onSubmit={(e) => { if (!confirm(commonT("confirmDelete"))) e.preventDefault(); }}>
            <input type="hidden" name="locale" value={p.locale} />
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
              {commonT("delete")}
            </button>
          </form>
        }
      />
      <div className="max-w-3xl">
        <form action={updateActionWithId} className="space-y-6">
          <input type="hidden" name="locale" value={p.locale} />
          <EditShiftForm
            shift={{
              id: shift.id,
              name: shift.name,
              type: shift.type,
              startTime: shift.startTime,
              endTime: shift.endTime,
              workingDays: shift.workingDays,
              breakMinutes: shift.breakMinutes,
              companyId: shift.companyId,
              isActive: shift.isActive,
            }}
            companies={companies}
            assignments={assignments.map((a) => ({
              id: a.id,
              employeeName: a.employee.user.name,
              startDate: a.startDate.toISOString().split("T")[0] ?? "",
            }))}
            locale={p.locale}
          />
        </form>
      </div>
    </div>
  );
}
