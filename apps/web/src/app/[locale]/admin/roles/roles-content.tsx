"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, Shield, Edit2, ChevronRight, X } from "lucide-react";
import { KPICard } from "@intilaqa/ui";

type RoleRow = {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
};

const roleColors = [
  "from-primary/15 to-primary/5 border-primary/15",
  "from-blue-50 to-blue-100/50 border-blue-200/50",
  "from-purple-50 to-purple-100/50 border-purple-200/50",
  "from-amber-50 to-amber-100/50 border-amber-200/50",
  "from-emerald-50 to-emerald-100/50 border-emerald-200/50",
  "from-rose-50 to-rose-100/50 border-rose-200/50",
];

const roleIconColors = [
  "bg-primary/15 text-primary",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
];

export function RolesContent({
  data,
  page,
  totalPages,
  total,
  totalPermissions,
}: {
  data: RoleRow[];
  page: number;
  totalPages: number;
  total: number;
  totalPermissions: number;
}) {
  const t = useTranslations("roles");
  const locale = useLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search
    ? data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  const customRoles = data.filter((r) => !["admin", "client", "employee", "company_admin"].includes(r.name));

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title={t("totalRoles")} value={total} icon={<Shield className="w-6 h-6" />} color="blue" />
        <KPICard title={t("customRoles")} value={customRoles.length} icon={<Shield className="w-6 h-6" />} color="purple" />
        <KPICard title={t("totalPermissions")} value={totalPermissions} icon={<Shield className="w-6 h-6" />} color="emerald" />
      </div>

      {/* Search + Create */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full ps-11 pe-10 py-2.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-on-surface-variant/10 flex items-center justify-center hover:bg-on-surface-variant/20 transition-colors"
            >
              <X className="w-3 h-3 text-on-surface-variant/60" />
            </button>
          )}
        </div>
        <Link
          href={`/${locale}/admin/roles/new`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          {t("newRole")}
        </Link>
      </div>

      {/* Roles Grid */}
      {filtered.length === 0 ? (
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-dashed border-outline-variant/30 p-12 text-center">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-outline-variant/10" />
          <Shield className="w-14 h-14 text-on-surface-variant/15 mx-auto mb-4" />
          <h3 className="text-[18px] font-bold text-on-surface mb-1">{t("noRoles")}</h3>
          <p className="text-[13px] text-on-surface-variant/50 max-w-sm mx-auto">{t("noRolesDesc")}</p>
          <Link
            href={`/${locale}/admin/roles/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
          >
            <Plus className="w-4 h-4" />
            {t("newRole")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((role, i) => {
            const colorIdx = i % roleColors.length;
            const initial = role.name.charAt(0).toUpperCase();
            return (
              <Link
                key={role.id}
                href={`/${locale}/admin/roles/${role.id}`}
                className="group block"
              >
                <div className={`relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br backdrop-blur-xl border shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 ${roleColors[colorIdx]}`}>
                  {/* Top accent bar */}
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary/40 to-primary/10 group-hover:from-primary group-hover:to-primary/60 transition-all" />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold ${roleIconColors[colorIdx]}`}>
                          {initial}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                            {role.name}
                          </h3>
                          {role.description && role.description !== "—" && (
                            <p className="text-[12px] text-on-surface-variant/50 mt-0.5 line-clamp-1">{role.description}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Permission Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span className="text-[12px] font-medium text-on-surface-variant/50">
                          {t("permissionsCount", { count: role.permissionsCount })}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/60 border border-white/80 text-on-surface-variant/40 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}${search ? `&search=${search}` : ""}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all ${
                p === page
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/60 border border-white/60 text-on-surface-variant/60 hover:bg-white/80"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
