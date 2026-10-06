"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DataTable } from "@intilaqa/ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  scopeLabel: string;
  statusDisplay: string;
};

export function UsersTable({ rows, basePath }: { rows: UserRow[]; basePath: string }) {
  const t = useTranslations("users");
  const commonT = useTranslations("common");

  return (
    <DataTable
      columns={[
        {
          key: "name",
          header: t("name"),
          type: "avatar",
          subtitleKey: "email",
        },
        { key: "roleLabel", header: t("role") },
        { key: "scopeLabel", header: t("scope") },
        {
          key: "statusDisplay",
          header: t("status"),
          type: "status",
        },
        {
          key: "actions",
          header: commonT("actions"),
          className: "text-end",
          render: (item) => (
            <Link
              href={`${basePath}/${item.id}`}
              className="inline-flex items-center rounded-xl border border-white/40 bg-white/30 px-3 py-1.5 text-[12px] font-bold text-on-surface hover:bg-white/50 transition-all"
            >
              {commonT("edit")}
            </Link>
          ),
        },
      ]}
      data={rows}
      emptyTitle={commonT("noData")}
      emptyDescription={commonT("noResults")}
    />
  );
}
