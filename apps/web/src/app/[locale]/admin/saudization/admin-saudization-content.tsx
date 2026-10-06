'use client';

import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { PageHeader, KPICard } from '@intilaqa/ui';
import { Globe, Users, AlertTriangle, Building2, CheckCircle, XCircle } from 'lucide-react';
import type { SaudizationStatus, NitaqatLevel } from '../../../../server/services/saudization-service';

interface CompanySaudizationRow {
  id: string;
  name: string;
  status: SaudizationStatus;
}

interface AdminSaudizationContentProps {
  companyData: CompanySaudizationRow[];
  totalCompanies: number;
  error: string | null;
}

export function AdminSaudizationContent({ companyData, totalCompanies, error }: AdminSaudizationContentProps) {
  const t = useTranslations('saudization');
  const td = useTranslations('dashboard');
  const locale = useLocale();

  const nitaqatBadge: Record<NitaqatLevel, { bg: string; text: string; label: string }> = {
    red: { bg: 'bg-red-100', text: 'text-red-700', label: t('nitaqatLevels.red') },
    low_green: { bg: 'bg-orange-100', text: 'text-orange-700', label: t('nitaqatLevels.lowGreen') },
    medium_green: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t('nitaqatLevels.mediumGreen') },
    high_green: { bg: 'bg-green-100', text: 'text-green-700', label: t('nitaqatLevels.highGreen') },
    platinum: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: t('nitaqatLevels.platinum') },
  };

  const totals = useMemo(() => {
    if (companyData.length === 0) return null;
    return companyData.reduce(
      (acc, c) => ({
        totalEmployees: acc.totalEmployees + c.status.totalCount,
        saudiCount: acc.saudiCount + c.status.saudiCount,
        expatCount: acc.expatCount + c.status.expatCount,
      }),
      { totalEmployees: 0, saudiCount: 0, expatCount: 0 }
    );
  }, [companyData]);

  const overallPercentage = totals && totals.totalEmployees > 0
    ? Math.round((totals.saudiCount / totals.totalEmployees) * 100)
    : 0;

  if (error) {
    return (
      <div>
        <PageHeader title={t('title')} breadcrumbs={[{ label: td('overview'), href: `/${locale}/admin` }, { label: t('title') }]} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-1">Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (companyData.length === 0) {
    return (
      <div>
        <PageHeader title={t('title')} breadcrumbs={[{ label: td('overview'), href: `/${locale}/admin` }, { label: t('title') }]} />
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-12 text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('adminOverview')}
        breadcrumbs={[
{ label: td('overview'), href: `/${locale}/admin` },
          { label: t('title') },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title={t('totalEmployees')} value={totals?.totalEmployees ?? 0} icon={<Users className="w-6 h-6" />} color="blue" />
        <KPICard title={t('saudiEmployees')} value={totals?.saudiCount ?? 0} icon={<Users className="w-6 h-6" />} color="emerald" />
        <KPICard title={t('expatEmployees')} value={totals?.expatCount ?? 0} icon={<Users className="w-6 h-6" />} color="purple" />
        <KPICard title={t('overallCompliance')} value={overallPercentage} suffix="%" icon={<Globe className="w-6 h-6" />} color="emerald" />
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">{t('companyName')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('saudiEmployees')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('expatEmployees')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('currentPercentage')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('currentLevel')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('requiredHires')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('targetPercentage')}</th>
              </tr>
            </thead>
            <tbody>
              {companyData.map((c) => {
                const badge = nitaqatBadge[c.status.currentNitaqatLevel];
                return (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-center">{c.status.saudiCount}</td>
                    <td className="px-4 py-3 text-center">{c.status.expatCount}</td>
                    <td className="px-4 py-3 text-center font-semibold">{c.status.saudizationPercentage}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.status.requiredSaudiHires > 0 ? (
                        <span className="font-bold text-amber-600">{c.status.requiredSaudiHires}</span>
                      ) : (
                        <span className="text-green-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{c.status.targetPercentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {t('qiwaPlaceholder')}
        </p>
      </div>
    </div>
  );
}
