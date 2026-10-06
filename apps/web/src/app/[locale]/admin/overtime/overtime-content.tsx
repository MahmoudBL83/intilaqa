"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Clock, Users, Timer, TrendingUp, User, Building2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type OvertimeData = {
  id: string;
  employeeName: string;
  companyName: string;
  date: string;
  hours: number;
  rate: string;
  status: string;
};

const statusConfig: Record<string, { color: string; bg: string; text: string }> = {
  pending: { color: "from-amber-400 to-amber-600", bg: "bg-amber-50", text: "text-amber-700" },
  approved: { color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  rejected: { color: "from-red-400 to-red-600", bg: "bg-red-50", text: "text-red-700" },
};

const companyColors = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-emerald-400 to-emerald-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-cyan-400 to-cyan-600",
];

function getCompanyColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return companyColors[Math.abs(hash) % companyColors.length];
}

function OvertimeCard({ record, locale }: { record: OvertimeData; locale: string }) {
  const t = useTranslations("overtime");
  const cfg = statusConfig[record.status] as typeof statusConfig[string] ?? statusConfig.pending;

  return (
    <Link href={`/${locale}/admin/overtime/${record.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${cfg.color}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-700/10 flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                {record.employeeName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-on-surface truncate leading-tight">{record.employeeName}</h3>
                <p className="text-[12px] text-on-surface-variant/50 truncate">{record.companyName}</p>
              </div>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
              {t(record.status as "pending" | "approved" | "rejected")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-xl bg-on-surface-variant/5 p-2.5 text-center">
              <Timer className="w-4 h-4 text-on-surface-variant/40 mx-auto mb-1" />
              <p className="text-[16px] font-extrabold text-on-surface">{record.hours}</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("hours")}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-2.5 text-center">
              <TrendingUp className="w-4 h-4 text-on-surface-variant/40 mx-auto mb-1" />
              <p className="text-[16px] font-extrabold text-on-surface">{record.rate}</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("rate")}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-2.5 text-center">
              <Calendar className="w-4 h-4 text-on-surface-variant/40 mx-auto mb-1" />
              <p className="text-[13px] font-bold text-on-surface">{record.date}</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("date")}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OvertimeContent({
  records,
  total,
  totalHours,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  records: OvertimeData[];
  total: number;
  totalHours: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("overtime");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");

  const pendingCount = records.filter((r) => r.status === "pending").length;
  const approvedCount = records.filter((r) => r.status === "approved").length;

  const grouped = records.reduce<Record<string, OvertimeData[]>>((acc, rec) => {
    if (!acc[rec.companyName]) acc[rec.companyName] = [];
    acc[rec.companyName]!.push(rec);
    return acc;
  }, {});

  const sortedCompanies = Object.keys(grouped).sort();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700/70 mb-1">{t("title")}</p>
              <p className="text-3xl font-bold text-blue-900">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-200/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/70 mb-1">{tc("total")}</p>
              <p className="text-3xl font-bold text-emerald-900">{totalHours}h</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center">
              <Timer className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700/70 mb-1">{t("approved")}</p>
              <p className="text-3xl font-bold text-purple-900">{approvedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-200/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCompanies.map((companyName) => {
            const companyRecords = grouped[companyName]!;
            const colorGradient = getCompanyColor(companyName);
            const companyHours = companyRecords.reduce((sum, r) => sum + r.hours, 0);
            return (
              <div key={companyName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${colorGradient}`} />
                  <h3 className="text-[15px] font-bold text-on-surface">{companyName}</h3>
                  <span className="text-[11px] font-bold text-on-surface-variant/40 bg-on-surface-variant/8 px-2.5 py-0.5 rounded-full">
                    {companyRecords.length} · {companyHours}h
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {companyRecords.map((rec) => (
                    <OvertimeCard key={rec.id} record={rec} locale={locale} />
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
