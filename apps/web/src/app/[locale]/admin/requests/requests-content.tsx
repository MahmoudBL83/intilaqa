"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, XCircle, User, Building2, Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";

type RequestData = {
  id: string;
  employeeName: string;
  companyName: string;
  requestType: string;
  title: string;
  dateFormatted: string;
  status: string;
};

const statusConfig: Record<string, { color: string; bg: string; text: string; icon: React.ElementType }> = {
  pending: { color: "from-amber-400 to-amber-600", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  approved: { color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  rejected: { color: "from-red-400 to-red-600", bg: "bg-red-50", text: "text-red-700", icon: XCircle },
};

const typeColors: Record<string, string> = {
  leave: "bg-blue-50 text-blue-700",
  permission: "bg-purple-50 text-purple-700",
  overtime: "bg-orange-50 text-orange-700",
  expense: "bg-pink-50 text-pink-700",
  loan: "bg-cyan-50 text-cyan-700",
  salary_letter: "bg-indigo-50 text-indigo-700",
  document: "bg-teal-50 text-teal-700",
  other: "bg-gray-50 text-gray-700",
};

function RequestCard({ request, locale }: { request: RequestData; locale: string }) {
  const t = useTranslations("requests");
  const cfg = statusConfig[request.status] as typeof statusConfig[string] ?? statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <Link href={`/${locale}/admin/requests/${request.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${cfg.color}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${typeColors[request.requestType] || typeColors.other}`}>
                <Tag className="w-3 h-3" />
                {request.requestType}
              </span>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
              <StatusIcon className="w-3 h-3" />
              {t(request.status as "pending" | "approved" | "rejected")}
            </span>
          </div>

          <h3 className="text-[14px] font-bold text-on-surface leading-tight mb-3">{request.title}</h3>

          <div className="space-y-1.5 text-[12px] text-on-surface-variant/60">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{request.employeeName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{request.companyName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{request.dateFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function RequestsContent({
  requests,
  total,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  requests: RequestData[];
  total: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("requests");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const grouped = requests.reduce<Record<string, RequestData[]>>((acc, req) => {
    if (!acc[req.status]) acc[req.status] = [];
    acc[req.status]!.push(req);
    return acc;
  }, {});

  const statusOrder = ["pending", "approved", "rejected"];
  const sortedStatuses = statusOrder.filter((s) => (grouped[s] ?? []).length > 0);

  const statusLabels: Record<string, string> = {
    pending: t("pending"),
    approved: t("approved"),
    rejected: t("rejected"),
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700/70 mb-1">{t("pending")}</p>
              <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-200/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/70 mb-1">{t("approved")}</p>
              <p className="text-3xl font-bold text-emerald-900">{approvedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700/70 mb-1">{t("rejected")}</p>
              <p className="text-3xl font-bold text-red-900">{rejectedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-200/50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedStatuses.map((status) => {
            const statusRequests = grouped[status]!;
            const cfg = statusConfig[status] as typeof statusConfig[string] ?? statusConfig.pending;
            return (
              <div key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${cfg.color}`} />
                  <h3 className="text-[15px] font-bold text-on-surface">{statusLabels[status]}</h3>
                  <span className="text-[11px] font-bold text-on-surface-variant/40 bg-on-surface-variant/8 px-2.5 py-0.5 rounded-full">
                    {statusRequests.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {statusRequests.map((req) => (
                    <RequestCard key={req.id} request={req} locale={locale} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 mt-8 floating-glass rounded-[2rem]">
          <span className="text-on-surface-variant/60 text-[13px] font-medium">
            {tc("page")} {page} {tc("of")} {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a href={`?${[queryString, `page=${page - 1}`].filter(Boolean).join("&")}`} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </a>
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </span>
            )}
            {page < totalPages ? (
              <a href={`?${[queryString, `page=${page + 1}`].filter(Boolean).join("&")}`} className="w-9 h-9 rounded-xl bg-white/30 border border-white/40 flex items-center justify-center hover:bg-white/50 transition-all">
                <ChevronRight className="w-4 h-4" />
              </a>
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
