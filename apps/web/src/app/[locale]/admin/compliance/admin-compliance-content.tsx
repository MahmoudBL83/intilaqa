"use client";

import { useTranslations, useLocale } from "next-intl";
import { Shield, ShieldAlert, AlertTriangle, Building2, FileCheck } from "lucide-react";
import { PageHeader, Pagination } from "@intilaqa/ui";

type CompanyAlert = {
  id: string;
  name: string;
  expired: number;
  pending30: number;
  pending60: number;
  pending90: number;
  total: number;
};

export function AdminComplianceContent({
  companyAlerts, totalExpired, totalPending, totalCompanies, error,
  currentPage = 1, totalPages = 1,
}: {
  companyAlerts: CompanyAlert[];
  totalExpired: number;
  totalPending: number;
  totalCompanies: number;
  error: string | null;
  currentPage?: number;
  totalPages?: number;
}) {
  const tc = useTranslations("compliance");
  const td = useTranslations("dashboard");
  const locale = useLocale();

  if (error) {
    return (
      <div>
        <PageHeader title={tc("title")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: tc("title") }]} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={tc("title")}
        subtitle={`${tc("allClear")} — ${totalCompanies} ${totalCompanies === 1 ? tc("company") : tc("companies")}`}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: tc("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("alertLevels.expired")}</p>
              <p className="text-on-surface text-[24px] font-bold">{totalExpired}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("pending")}</p>
              <p className="text-on-surface text-[24px] font-bold">{totalPending}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("companies")}</p>
              <p className="text-on-surface text-[24px] font-bold">{totalCompanies}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("documents")}</p>
              <p className="text-on-surface text-[24px] font-bold">
                {companyAlerts.reduce((s, c) => s + c.total, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-glass rounded-[2rem] p-6">
        <h3 className="text-[18px] font-bold text-on-surface mb-5">{tc("companyComplianceStatus")}</h3>
        {companyAlerts.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-on-surface-variant font-medium text-[14px]">{tc("noCompanies")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("company")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("totalDocs")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("alertLevels.expired")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("alertLevels.30_days")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("alertLevels.60_days")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("alertLevels.90_days")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{tc("status")}</th>
                </tr>
              </thead>
              <tbody>
                {companyAlerts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-center">{c.total}</td>
                    <td className="px-4 py-3 text-center">
                      {c.expired > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{c.expired}</span>
                      ) : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.pending30 > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{c.pending30}</span>
                      ) : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.pending60 > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">{c.pending60}</span>
                      ) : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.pending90 > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{c.pending90}</span>
                      ) : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.expired > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          <ShieldAlert className="w-3 h-3" /> {tc("expired")}
                        </span>
                      ) : c.pending30 > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                          <AlertTriangle className="w-3 h-3" /> {tc("critical")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <FileCheck className="w-3 h-3" /> {tc("compliant")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
