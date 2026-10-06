import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@intilaqa/ui";
import { Download, Plus, Search } from "lucide-react";
import * as userService from "@/server/services/user-service";
import { UsersContent } from "./users-content";

export default async function UsersPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string; created?: string; updated?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("users");
  const rolesT = await getTranslations("roles");
  const dashboardT = await getTranslations("dashboard");
  const commonT = await getTranslations("common");

  const query = await searchParams;
  const search = query.search ?? "";
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const created = query.created === "1";
  const updated = query.updated === "1";
  const take = 10;
  const skip = (page - 1) * take;

  const { data: users, total } = await userService.getUsers({ take, skip, search });

  const totalPages = Math.ceil(total / take);

  const roleKeyMap: Record<string, string> = {
    admin: "admin",
    client: "client",
    company_admin: "companyAdmin",
    employee: "employee",
  };

  const rows = users.map((u) => {
    const roleKey = roleKeyMap[u.role] ?? "unknown";
    const scopeLabel =
      u.role === "client"
        ? u.client?.name || "—"
        : u.employee?.company?.name || "—";

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      roleLabel: rolesT(roleKey),
      statusDisplay: u.isActive ? "active" : "inactive",
      scopeLabel,
    };
  });

  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const queryString = queryParts.join("&");

  return (
    <div>
      {(created || updated) && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-primary">
          {created ? commonT("createdSuccess", { fallback: commonT("save") }) : commonT("updatedSuccess", { fallback: commonT("save") })}
        </div>
      )}

      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: dashboardT("overview"), href: `/${locale}/admin` },
          { label: t("title") },
        ]}
        actions={
          <>
            <button className="px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-on-surface text-[14px] font-bold hover:bg-white/60 hover:scale-[1.02] transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              {commonT("export")}
            </button>
            <Link
              href={`/${locale}/admin/users/new`}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("createAction")}
            </Link>
          </>
        }
      />

      <form method="GET" className="mb-6">
        <div className="flex items-center bg-white/40 border border-white/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-11 px-4 w-full max-w-md">
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

      <UsersContent
        users={rows}
        total={total}
        activeCount={users.filter((u) => u.isActive).length}
        locale={locale}
        page={page}
        totalPages={totalPages}
        queryString={queryString}
        emptyTitle={commonT("noData")}
        emptyDescription={commonT("noResults")}
      />
    </div>
  );
}
