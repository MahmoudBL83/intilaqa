"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Building2, Users, UserCheck, MapPin, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

type CompanyData = {
  id: string;
  name: string;
  industry: string;
  clientName: string;
  employeesCount: string;
  statusDisplay: string;
};

const clientColors = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-emerald-400 to-emerald-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-cyan-400 to-cyan-600",
  "from-indigo-400 to-indigo-600",
  "from-teal-400 to-teal-600",
];

function getClientColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return clientColors[Math.abs(hash) % clientColors.length];
}

function CompanyCard({ company, locale }: { company: CompanyData; locale: string }) {
  const t = useTranslations("companies");
  const isActive = company.statusDisplay === "active";

  return (
    <Link href={`/${locale}/admin/companies/${company.id}`}>
      <div className="group relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${isActive ? "from-emerald-400 to-emerald-600" : "from-gray-300 to-gray-500"}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-700/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-on-surface truncate leading-tight">{company.name}</h3>
                <p className="text-[12px] text-on-surface-variant/50">{company.industry || t("industry")}</p>
              </div>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
              {t(company.statusDisplay as "active" | "inactive")}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[12px]">
              <MapPin className="w-3.5 h-3.5 text-on-surface-variant/40 shrink-0" />
              <span className="text-on-surface-variant/70">{company.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <Users className="w-3.5 h-3.5 text-on-surface-variant/40 shrink-0" />
              <span className="text-on-surface-variant/70">{company.employeesCount} {t("employeesCount")}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CompaniesContent({
  companies,
  total,
  totalEmployees,
  activeCount,
  locale,
  page,
  totalPages,
  queryString,
  emptyTitle,
  emptyDescription,
}: {
  companies: CompanyData[];
  total: number;
  totalEmployees: number;
  activeCount: number;
  locale: string;
  page: number;
  totalPages: number;
  queryString: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const t = useTranslations("companies");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");

  const grouped = companies.reduce<Record<string, CompanyData[]>>((acc, comp) => {
    if (!acc[comp.clientName]) acc[comp.clientName] = [];
    acc[comp.clientName]!.push(comp);
    return acc;
  }, {});

  const sortedClients = Object.keys(grouped).sort();

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
              <Building2 className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/70 mb-1">{td("employees")}</p>
              <p className="text-3xl font-bold text-emerald-900">{totalEmployees}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700/70 mb-1">{td("activeCompanies")}</p>
              <p className="text-3xl font-bold text-purple-900">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-200/50 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-on-surface-variant/15 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-on-surface mb-1">{emptyTitle}</p>
          <p className="text-[13px] text-on-surface-variant/50">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedClients.map((clientName) => {
            const clientCompanies = grouped[clientName]!;
            const colorGradient = getClientColor(clientName);
            return (
              <div key={clientName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${colorGradient}`} />
                  <h3 className="text-[15px] font-bold text-on-surface">{clientName}</h3>
                  <span className="text-[11px] font-bold text-on-surface-variant/40 bg-on-surface-variant/8 px-2.5 py-0.5 rounded-full">
                    {clientCompanies.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {clientCompanies.map((comp) => (
                    <CompanyCard key={comp.id} company={comp} locale={locale} />
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
