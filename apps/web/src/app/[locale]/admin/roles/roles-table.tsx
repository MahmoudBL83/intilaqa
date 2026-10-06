"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { DataTable } from "@intilaqa/ui";

type RoleRow = {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
};

export function RolesDataTable({
  data,
  page,
  totalPages,
  locale,
}: {
  data: RoleRow[];
  page: number;
  totalPages: number;
  locale: string;
}) {
  const router = useRouter();

  return (
    <DataTable
      columns={[
        { key: "name", header: "Role Name" },
        { key: "description", header: "Description" },
        { key: "permissionsCount", header: "Permissions" },
        {
          key: "actions",
          header: "Actions",
          className: "w-24 text-end",
          render: (item) => (
            <div className="flex justify-end gap-2">
              <Link
                href={`/${locale}/admin/roles/${item.id}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/30 border border-white/40 text-on-surface hover:bg-white/50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
            </div>
          ),
        },
      ]}
      data={data}
      page={page}
      totalPages={totalPages}
      emptyTitle="Roles"
      emptyDescription="Roles and permissions will be available here."
    />
  );
}
