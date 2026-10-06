import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@intilaqa/ui";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@intilaqa/db";
import * as userService from "@/server/services/user-service";
import { UsersTable } from "../../admin/users/users-table";

type UserRow = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  scopeLabel: string;
  statusDisplay: string;
};

export default async function CompanyUsersPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string; created?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect(`/${locale}/login`);

  const employee = await prisma.employee.findFirst({
    where: { userId },
    include: { company: true },
  });
  if (!employee?.companyId) redirect(`/${locale}/login`);

  const t = await getTranslations("users");
  const rolesT = await getTranslations("roles");
  const dashboardT = await getTranslations("dashboard");
  const commonT = await getTranslations("common");

  const query = await searchParams;
  const search = query.search ?? "";
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const take = 10;
  const skip = (page - 1) * take;

  const { data: users, total } = await userService.getUsers({
    take,
    skip,
    search,
    companyId: employee.companyId,
    role: "employee",
  });

  const totalPages = Math.ceil(total / take);

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    roleLabel: rolesT("employee"),
    statusDisplay: u.isActive ? "active" : "inactive",
    scopeLabel: u.employee?.department?.name || employee.company?.name || "—",
  }));

  const basePath = `/${locale}/company/users`;
  const paramsData = await searchParams;
  const created = paramsData.created === "1";

  return (
    <div>
      {created && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {t("createdSuccess")}
        </div>
      )}

      <PageHeader
            title={t("title")}
            breadcrumbs={[
              { label: dashboardT("overview"), href: `/${locale}/company` },
              { label: t("title") },
            ]}
            actions={
          <Link
            href={`${basePath}/new`}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("createAction")}
          </Link>
        }
      />

      <form method="GET" className="mb-6">
        <div className="flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-11 px-4 w-full max-w-md">
          <Search className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder={commonT("search")}
            className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium px-2"
          />
          <button type="submit" className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[12px] font-bold hover:bg-primary hover:text-white transition-all">
            {commonT("search")}
          </button>
        </div>
      </form>

      <UsersTable rows={rows} basePath={basePath} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 mt-4 floating-glass rounded-[2rem]">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {commonT("page")} {page} {commonT("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`?search=${encodeURIComponent(search)}&page=${page - 1}`}
                className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`?search=${encodeURIComponent(search)}&page=${page + 1}`}
                className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
