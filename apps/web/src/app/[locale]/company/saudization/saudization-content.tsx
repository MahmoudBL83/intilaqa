'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { PageHeader, KPICard, SimpleBarChart, StatusDistributionChart, StatRow } from '@intilaqa/ui';
import {
  Users, Globe, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Target, ArrowUp, Calculator, BarChart3,
} from 'lucide-react';
import type { SaudizationStatus, SaudizedProfession, NitaqatLevel } from '../../../../server/services/saudization-service';
import { SaudizationSimulatorContent } from './simulator-content';

interface SaudizationContentProps {
  locale: string;
  companyName: string;
  companyId: string;
  status: SaudizationStatus | null;
  professions: SaudizedProfession[];
  savedScenarios: Array<{ id: string; name: string; currentSaudis: number; currentExpats: number; newSaudisToHire: number; newExpatsToHire: number; projectedPercentage: number; createdAt: string }>;
  error: string | null;
}

const nitaqatColors: Record<NitaqatLevel, { bg: string; text: string; badge: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-500' },
  low_green: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-500' },
  medium_green: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  high_green: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-500' },
  platinum: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-500' },
};

export function SaudizationContent({ locale, companyName, companyId, status, professions, savedScenarios, error }: SaudizationContentProps) {
  const t = useTranslations('saudization');
  const td = useTranslations('dashboard');
  const tc = useTranslations("common");

  const [activeTab, setActiveTab] = useState<'overview' | 'professions' | 'simulator'>('overview');

  const tabs = [
    { key: 'overview' as const, label: t('overview'), icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'professions' as const, label: t('professions'), icon: <Users className="w-4 h-4" /> },
    { key: 'simulator' as const, label: t('simulator'), icon: <Calculator className="w-4 h-4" /> },
  ];

  if (error) {
    return (
      <div>
        <PageHeader title={t('title')} breadcrumbs={[{ label: td('overview'), href: `/${locale}/company` }, { label: t('title') }]} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-1">{tc("errorTitle")}</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${t('title')} - ${companyName}`}
        breadcrumbs={[
          { label: td('overview'), href: `/${locale}/company` },
          { label: t('title') },
        ]}
      />

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && <OverviewTab status={status} t={t} locale={locale} />}
      {activeTab === 'professions' && <ProfessionsTab professions={professions} t={t} />}
      {activeTab === 'simulator' && status && (
        <SaudizationSimulatorContent
          currentSaudis={status.saudiCount}
          currentExpats={status.expatCount}
          companyId={companyId}
          savedScenarios={savedScenarios}
        />
      )}
    </div>
  );
}

function OverviewTab({ status, t, locale }: { status: SaudizationStatus | null; t: (key: string) => string; locale: string }) {
  if (!status) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-12 text-center">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t('noData')}</p>
      </div>
    );
  }

  const levelColors = nitaqatColors[status.currentNitaqatLevel];
  const nextColors = status.nextNitaqatLevel ? nitaqatColors[status.nextNitaqatLevel] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('currentPercentage')}
          value={status.saudizationPercentage}
          suffix="%"
          icon={<Globe className="w-6 h-6" />}
          color="emerald"
          trend={status.saudizationPercentage >= status.targetPercentage ? 'up' : 'down'}
          change={Math.round(status.saudizationPercentage / status.targetPercentage * 100)}
        />

        <KPICard
          title={t('saudiEmployees')}
          value={status.saudiCount}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />

        <KPICard
          title={t('expatEmployees')}
          value={status.expatCount}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />

        <KPICard
          title={t('totalEmployees')}
          value={status.totalCount}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('currentLevel')}</h3>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${levelColors.bg} ${levelColors.text} font-bold text-lg`}>
            <span className={`w-3 h-3 rounded-full ${levelColors.badge}`} />
            {status.currentNitaqatLabelEn}
          </div>

          {status.nextNitaqatLevel && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">{t('nextLevel')}</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${nextColors!.bg} ${nextColors!.text} font-semibold`}>
                <span className={`w-3 h-3 rounded-full ${nextColors!.badge}`} />
                {status.nextNitaqatLabelEn}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {t('targetPercentage')}: {status.targetPercentage}%
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('requiredHires')}</h3>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-primary" />
            <span className="text-3xl font-bold text-gray-900">{status.requiredSaudiHires}</span>
          </div>
          {status.requiredSaudiHires > 0 ? (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {t('requiredToReach')}: {status.nextNitaqatLabelEn}
            </p>
          ) : (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {t("atHighestLevel")}
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href={`/${locale}/company/saudization`}
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
            >
              <Calculator className="w-4 h-4" />
              {t('viewSimulator')}
            </Link>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('qiwaPlaceholder')}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("qiwaPlaceholder")}
          </p>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-xs text-gray-600">
              {/* TODO: Qiwa integration */}
              QiwaService.syncNitaqatLevel(companyId)
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfessionsTab({ professions, t }: { professions: SaudizedProfession[]; t: (key: string) => string }) {
  if (professions.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t('noData')}</p>
      </div>
    );
  }

  const compliant = professions.filter((p) => p.isCompliant).length;
  const nonCompliant = professions.length - compliant;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title={t('professions')} value={professions.length} icon={<Users className="w-6 h-6" />} color="blue" />
        <KPICard title={t('compliant')} value={compliant} icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
        <KPICard title={t('nonCompliant')} value={nonCompliant} icon={<XCircle className="w-6 h-6" />} color="red" />
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">{t('profession')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('requiredPct')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('currentPct')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('saudiEmployees')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('expatEmployees')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('complianceStatus')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{t('missingSaudis')}</th>
              </tr>
            </thead>
            <tbody>
              {professions.map((p) => (
                <tr key={p.professionEn} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.professionEn}</td>
                  <td className="px-4 py-3 text-center">{p.requiredPercentage}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.currentPercentage >= p.requiredPercentage
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {p.currentPercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{p.currentSaudis}</td>
                  <td className="px-4 py-3 text-center">{p.currentExpats}</td>
                  <td className="px-4 py-3 text-center">
                    {p.isCompliant ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        {t('compliant')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        {t('nonCompliant')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.missingSaudis > 0 ? (
                      <span className="font-bold text-amber-600">{p.missingSaudis}</span>
                    ) : (
                      <span className="text-green-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
