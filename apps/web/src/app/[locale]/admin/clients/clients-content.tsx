"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Users, Building2, CreditCard, Globe, ChevronLeft, ChevronRight } from "lucide-react";

type ClientData = {
  id: string;
  name: string;
  domain: string;
  companyCount: string;
  planName: string;
  statusDisplay: string;
};

function ClientCard({ client, locale }: { client: ClientData; locale: string }) {
  const t = useTranslations("clients");
  const isActive = client.statusDisplay === "active";

  return (
    <Link href={`/${locale}/admin/clients/${client.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${isActive ? "from-blue-400 to-blue-600" : "from-gray-300 to-gray-500"}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-700/10 flex items-center justify-center text-[14px] font-bold text-primary shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-on-surface truncate leading-tight">{client.name}</h3>
                <p className="text-[12px] text-on-surface-variant/50 truncate">{client.domain}</p>
              </div>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-blue-500" : "bg-gray-400"}`} />
              {t(client.statusDisplay as "active" | "inactive")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-on-surface-variant/5 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-on-surface-variant/40" />
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("companyCount")}</span>
              </div>
              <p className="text-[18px] font-extrabold text-on-surface">{client.companyCount}</p>
            </div>
            <div className="rounded-xl bg-on-surface-variant/5 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-on-surface-variant/40" />
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{t("plan")}</span>
              </div>
              <p className="text-[13px] font-bold text-on-surface truncate">{client.planName}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ClientsContent({
  clients,
  total,
  activeCount,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  clients: ClientData[];
  total: number;
  activeCount: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("clients");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");

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
              <Users className="w-5 h-5 text-blue-700" />
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
              <Globe className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700/70 mb-1">{t("inactive")}</p>
              <p className="text-3xl font-bold text-purple-900">{total - activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-200/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} locale={locale} />
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
