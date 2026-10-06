"use client";

import React from "react";
import { DataTable } from "@intilaqa/ui";
import Link from "next/link";
import { Edit2 } from "lucide-react";

type Column = {
  key: string;
  header: string;
  type?: "status" | "avatar";
  render?: (item: DataRow) => React.ReactNode;
  subtitleKey?: string;
  className?: string;
};

type DataRow = Record<string, unknown>;

export function DataTableWithActions({
  columns,
  data,
  page,
  totalPages,
  emptyTitle,
  emptyDescription,
  editPath,
  locale,
}: {
  columns: Column[];
  data: DataRow[];
  page?: number;
  totalPages?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  editPath: string;
  locale: string;
}) {
  return (
    <DataTable
      columns={[
        ...columns,
        {
          key: "actions",
          header: "",
          className: "w-20 text-end",
          render: (item: DataRow) => (
            <div className="flex justify-end gap-2">
              <Link
                href={`/${locale}${editPath}/${item.id}`}
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
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
}
