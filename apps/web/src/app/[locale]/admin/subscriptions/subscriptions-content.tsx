"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { CreditCard, Users, Calendar, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

type SubscriptionData = {
  id: string;
  clientName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
};

const statusConfig = {
  active: { color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  suspended: { color: "from-amber-400 to-amber-600", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  expired: { color: "from-red-400 to-red-600", bg: "bg-red-50", text: "text-red-700", icon: XCircle },
  canceled: { color: "from-gray-400 to-gray-500", bg: "bg-gray-50", text: "text-gray-600", icon: XCircle },
};

function SubscriptionCard({ subscription, locale }: { subscription: SubscriptionData; locale: string }) {
  const t = useTranslations("subscriptions");
  const cfg = statusConfig[subscription.status as keyof typeof statusConfig] ?? statusConfig.active;
  const StatusIcon = cfg.icon;

  return (
    <Link href={`/${locale}/admin/subscriptions/${subscription.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${cfg.color}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-700/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-on-surface truncate leading-tight">{subscription.clientName}</h3>
                <p className="text-[12px] text-on-surface-variant/50 truncate">{subscription.planName}</p>
              </div>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
              <StatusIcon className="w-3 h-3" />
              {t(subscription.status as "active" | "suspended" | "expired" | "canceled")}
            </span>
          </div>

          <div className="flex items-center justify-between text-[12px] text-on-surface-variant/50 pt-3 border-t border-on-surface-variant/10">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{subscription.startDate}</span>
            </div>
            <span className="text-on-surface-variant/30">→</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{subscription.endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SubscriptionsContent({
  subscriptions,
  total,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  subscriptions: SubscriptionData[];
  total: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("subscriptions");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const expiredCount = subscriptions.filter((s) => s.status === "expired").length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700/70 mb-1">{t("subscriptions")}</p>
              <p className="text-3xl font-bold text-blue-900">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-200/50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/70 mb-1">{t("active")}</p>
              <p className="text-3xl font-bold text-emerald-900">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700/70 mb-1">{t("expired")}</p>
              <p className="text-3xl font-bold text-red-900">{expiredCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-200/50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} locale={locale} />
          ))}
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
