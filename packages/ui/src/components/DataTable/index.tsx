"use client";

import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, Download, FileJson, FileText } from "lucide-react";
import { cn } from "../../lib/utils";
import { EmptyState } from "../EmptyState";
import { LoadingState } from "../LoadingState";
import { StatusBadge } from "../StatusBadge";

type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  type?: "status" | "avatar";
  subtitleKey?: string;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  exportable?: boolean;
  tableName?: string;
};

function cellContent<T extends Record<string, unknown>>(col: Column<T>, item: T): React.ReactNode {
  if (col.render) return col.render(item);
  if (col.type === "status") return <StatusBadge status={String(item[col.key] ?? "")} />;
  if (col.type === "avatar") {
    const name = String(item[col.key as keyof T] ?? "");
    const subtitle = col.subtitleKey ? String(item[col.subtitleKey as keyof T] ?? "") : "";
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px] border border-white/30 shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-on-surface text-[14px]">{name}</div>
          {subtitle && <div className="text-on-surface-variant/50 text-[12px]">{subtitle}</div>}
        </div>
      </div>
    );
  }
  return String(item[col.key as keyof T] ?? "");
}

const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns: Column<T>[],
  tableName: string = "export"
) => {
  const headers = columns.map((col) => col.header).join(",");
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key as keyof T];
        const stringValue = String(value ?? "");
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tableName}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const exportToJSON = <T extends Record<string, unknown>>(
  data: T[],
  tableName: string = "export"
) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tableName}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyTitle,
  emptyDescription,
  page = 1,
  totalPages = 1,
  onPageChange,
  exportable = true,
  tableName = "data",
}: DataTableProps<T>) {
  const tc = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (loading) return <LoadingState />;
  if (!data.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div>
      {exportable && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => exportToCSV(data, columns, tableName)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold text-on-surface bg-white/30 hover:bg-white/50 border border-white/40 transition-all"
            title={tc("downloadAsCsv") || "Download as CSV"}
          >
            <Download className="w-4 h-4" />
            {tc("csv") || "CSV"}
          </button>
          <button
            onClick={() => exportToJSON(data, tableName)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold text-on-surface bg-white/30 hover:bg-white/50 border border-white/40 transition-all"
            title={tc("downloadAsJson") || "Download as JSON"}
          >
            <FileJson className="w-4 h-4" />
            {tc("json") || "JSON"}
          </button>
        </div>
      )}
      <div className="floating-glass rounded-[2rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/20 text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-[0.12em]">
              {columns.map((col) => (
                <th key={col.key} className={cn("py-4 px-6 text-start font-bold", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-white/10 hover:bg-white/20 transition-colors last:border-b-0">
                {columns.map((col) => (
                  <td key={col.key} className={cn("py-4 px-6", col.className)}>
                    {cellContent(col, item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/20">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {tc("page")} {page} {tc("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 disabled:opacity-30 transition-all"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 disabled:opacity-30 transition-all"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
