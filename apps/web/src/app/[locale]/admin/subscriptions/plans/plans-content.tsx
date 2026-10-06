"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Crown, Users, CreditCard, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

type PlanData = {
  id: string;
  name: string;
  price: string;
  subscriptionsCount: string;
  statusDisplay: string;
};

function PlanCard({ plan, locale }: { plan: PlanData; locale: string }) {
  const t = useTranslations("subscriptions");
  const tc = useTranslations("common");
  const isActive = plan.statusDisplay === "active";

  return (
    <Link href={`/${locale}/admin/subscriptions/plans/${plan.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${isActive ? "from-purple-400 to-purple-600" : "from-gray-300 to-gray-500"}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-purple-700" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-on-surface truncate leading-tight">{plan.name}</h3>
              </div>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-purple-50 text-purple-700" : "bg-gray-50 text-gray-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-purple-500" : "bg-gray-400"}`} />
              {tc(plan.statusDisplay as "active" | "inactive")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-on-surface-variant/5 p-3 text-center">
              <CreditCard className="w-4 h-4 text-on-surface-variant/40 mx-auto mb-1" />
              <p className="text-[16px] font-extrabold text-on-surface">{plan.price}</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{tc("price")}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-3 text-center">
              <Users className="w-4 h-4 text-on-surface-variant/40 mx-auto mb-1" />
              <p className="text-[16px] font-extrabold text-on-surface">{plan.subscriptionsCount}</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("subscriptionsCount")}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PlansContent({
  plans,
  total,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  plans: PlanData[];
  total: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("subscriptions");
  const tc = useTranslations("common");

  const activeCount = plans.filter((p) => p.statusDisplay === "active").length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700/70 mb-1">{t("plansTitle")}</p>
              <p className="text-3xl font-bold text-purple-900">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-200/50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/70 mb-1">{tc("active")}</p>
              <p className="text-3xl font-bold text-emerald-900">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16">
          <Crown className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} locale={locale} />
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
