import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { updateRoleAction, deleteRoleAction } from "../actions";
import { PermissionPicker } from "../permission-picker";

export default async function EditRolePage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const session = await auth();
  const p = await params;
  const { locale } = p;
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("sidebar");
  const td = await getTranslations("dashboard");
  const rolesT = await getTranslations("roles");

  const role = await prisma.role.findUnique({
    where: { id: p.id },
    include: { permissions: true }
  });

  if (!role) notFound();

  const permissions = await prisma.permission.findMany({
    orderBy: { key: "asc" },
  });

  const selectedPermissionIds = role.permissions.map((rp) => rp.permissionId);
  const updateActionWithId = updateRoleAction.bind(null, role.id);

  return (
    <div>
      <PageHeader
        title={rolesT("editRole")}
        breadcrumbs={[
          { label: td("overview"), href: `/${locale}/admin` },
          { label: t("roles"), href: `/${locale}/admin/roles` },
          { label: role.name },
        ]}
      />

      <form action={updateActionWithId} className="space-y-6 max-w-3xl">
        <input type="hidden" name="locale" value={locale} />

        {/* Basic Info Card */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
          <div className="p-6">
            <h2 className="text-[16px] font-bold text-on-surface mb-1">{rolesT("basicInfo")}</h2>
            <p className="text-[13px] text-on-surface-variant/50 mb-5">{rolesT("updateRoleDescription")}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">
                  {rolesT("roleName")}
                </label>
                <input
                  name="name"
                  defaultValue={role.name}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] placeholder:text-on-surface-variant/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">
                  {rolesT("description")}
                </label>
                <textarea
                  name="description"
                  defaultValue={role.description || ""}
                  placeholder={rolesT("descriptionPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] placeholder:text-on-surface-variant/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-purple-400 to-purple-600" />
          <div className="p-6">
            <h2 className="text-[16px] font-bold text-on-surface mb-1">{rolesT("assignPermissions")}</h2>
            <p className="text-[13px] text-on-surface-variant/50 mb-5">{rolesT("selectPermissionsDesc")}</p>

            {permissions.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant/50 py-4">{rolesT("noPermissions")}</p>
            ) : (
              <PermissionPicker
                permissions={permissions}
                selectedIds={selectedPermissionIds}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between">
          <form action={deleteRoleAction.bind(null, role.id)}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-error/10 text-error text-[13px] font-bold hover:bg-error/20 border border-error/15 transition-all"
            >
              {rolesT("deleteRole")}
            </button>
          </form>
          <div className="flex gap-3">
            <a
              href={`/${locale}/admin/roles`}
              className="px-6 py-2.5 rounded-2xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-bold hover:bg-white/80 transition-all"
            >
              {rolesT("cancel")}
            </a>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {rolesT("updateRole")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
