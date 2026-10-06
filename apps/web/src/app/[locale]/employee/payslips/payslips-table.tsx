"use client";

import { DataTable } from "@intilaqa/ui";
import { Download } from "lucide-react";

type Row = { id: string; period: string; netPay: string; statusDisplay: string; issuedAt: string };

export function PayslipsTable({ rows, labels }: { rows: Row[]; labels: Record<string, string> }) {
  return (
    <DataTable
      columns={[
        { key: "period", header: labels.period || "Period" },
        { key: "netPay", header: labels.netPay || "Net Pay" },
        { key: "statusDisplay", header: labels.status || "Status", type: "status" },
        { key: "issuedAt", header: labels.issuedAt || "Issued At" },
        {
          key: "download",
          header: "",
          render: (item: Row) => (
            <a href={`/api/v1/payslips/download?id=${item.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all">
              <Download className="w-3 h-3" />
              {labels.download || "Download"}
            </a>
          ),
        },
      ]}
      data={rows}
      emptyTitle={labels.noData || "No data"}
      emptyDescription=""
    />
  );
}
