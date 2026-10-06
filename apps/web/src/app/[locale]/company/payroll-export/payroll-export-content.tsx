'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DataTable,
  EmptyState,
  FormSection,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@intilaqa/ui';
import { Calendar, Download, FileText, ListChecks, MinusCircle, Wallet } from 'lucide-react';

type PayrollRecord = {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: string;
  createdAt: string;
};

interface Props { companyId: string; payrollRecords: PayrollRecord[]; }

type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json' | 'html';

const EXPORT_FORMATS: Array<{ value: ExportFormat; labelKey: string }> = [
  { value: 'csv', labelKey: 'csv' },
  { value: 'xlsx', labelKey: 'xlsx' },
  { value: 'pdf', labelKey: 'pdf' },
  { value: 'json', labelKey: 'json' },
  { value: 'html', labelKey: 'html' },
];

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

function fileNameFromDisposition(disposition: string | null, fallback: string) {
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

export function PayrollExportContent({ companyId, payrollRecords }: Props) {
  const t = useTranslations('payrollExport');
  const commonT = useTranslations('common');
  const statusT = useTranslations('status');
  const locale = useLocale();

  const periodOptions = useMemo(() => {
    const periods = new Map<string, { month: number; year: number }>();
    for (const record of payrollRecords) {
      periods.set(`${record.year}-${record.month}`, { month: record.month, year: record.year });
    }
    return Array.from(periods.values()).sort((a, b) => b.year - a.year || b.month - a.month);
  }, [payrollRecords]);

  const fallbackDate = new Date();
  const fallbackPeriod = `${fallbackDate.getFullYear()}-${fallbackDate.getMonth() + 1}`;
  const [selectedPeriod, setSelectedPeriod] = useState(
    periodOptions[0] ? `${periodOptions[0].year}-${periodOptions[0].month}` : fallbackPeriod
  );
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedYear = 0, selectedMonth = 0] = selectedPeriod.split('-').map(Number);

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }),
    [locale]
  );

  const formatDate = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale]
  );

  const formatPeriod = (month: number, year: number) => {
    const monthKey = MONTH_KEYS[month - 1] ?? 'january';
    return `${commonT(monthKey)} ${year}`;
  };

  const filteredRecords = useMemo(
    () =>
      payrollRecords.filter(
        (record) => record.month === selectedMonth && record.year === selectedYear
      ),
    [payrollRecords, selectedMonth, selectedYear]
  );

  const summary = useMemo(
    () =>
      filteredRecords.reduce(
        (acc, record) => ({
          gross: acc.gross + record.baseSalary + record.allowances,
          deductions: acc.deductions + record.deductions,
          net: acc.net + record.netPay,
        }),
        { gross: 0, deductions: 0, net: 0 }
      ),
    [filteredRecords]
  );

  const tableRows = useMemo(
    () =>
      filteredRecords.map((record) => ({
        ...record,
        period: formatPeriod(record.month, record.year),
        baseSalaryFormatted: formatCurrency.format(record.baseSalary),
        allowancesFormatted: formatCurrency.format(record.allowances),
        deductionsFormatted: formatCurrency.format(record.deductions),
        netPayFormatted: formatCurrency.format(record.netPay),
        createdAtFormatted: formatDate.format(new Date(record.createdAt)),
      })),
    [filteredRecords, formatCurrency, formatDate]
  );

  const statusLabel = (status: string) => {
    try {
      return statusT(status);
    } catch {
      return status;
    }
  };

  const handleExport = async () => {
    setMessage(null);
    setExporting(true);
    try {
      const params = new URLSearchParams({
        type: 'payroll',
        format,
        companyId,
        month: String(selectedMonth),
        year: String(selectedYear),
      });

      const res = await fetch(`/api/v1/export?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || t('exportFailed'));
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNameFromDisposition(
        res.headers.get('content-disposition'),
        `payroll-${selectedMonth}-${selectedYear}.${format}`
      );
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: t('downloadReady') });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('exportFailed'),
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[
          { label: t('dashboard'), href: `/${locale}/company` },
          { label: t('breadcrumb') },
        ]}
      />

      {message && (
        <div
          className={`rounded-[1.5rem] border px-5 py-4 text-[14px] font-bold ${
            message.type === 'success'
              ? 'border-primary/10 bg-primary/10 text-primary'
              : 'border-error/10 bg-error/10 text-error'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title={t('recordsFound')}
          value={filteredRecords.length}
          icon={ListChecks}
          variant="neutral"
        />
        <StatCard
          title={t('totalGross')}
          value={formatCurrency.format(summary.gross)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title={t('totalDeductions')}
          value={formatCurrency.format(summary.deductions)}
          icon={MinusCircle}
          variant="error"
        />
        <StatCard
          title={t('totalNet')}
          value={formatCurrency.format(summary.net)}
          icon={FileText}
          variant="secondary"
        />
      </div>

      <FormSection title={t('exportSettings')} description={t('exportSettingsDesc')}>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              {t('period')}
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/50" />
              <select
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value)}
                className="w-full rounded-2xl border border-white/40 bg-white/60 px-11 py-3 text-[14px] font-bold text-on-surface outline-none transition focus:border-primary focus:bg-white"
              >
                {periodOptions.length > 0 ? (
                  periodOptions.map((period) => (
                    <option key={`${period.year}-${period.month}`} value={`${period.year}-${period.month}`}>
                      {formatPeriod(period.month, period.year)}
                    </option>
                  ))
                ) : (
                  <option value={fallbackPeriod}>{formatPeriod(fallbackDate.getMonth() + 1, fallbackDate.getFullYear())}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              {t('exportFormat')}
            </label>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as ExportFormat)}
              className="w-full rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-[14px] font-bold text-on-surface outline-none transition focus:border-primary focus:bg-white"
            >
              {EXPORT_FORMATS.map((exportFormat) => (
                <option key={exportFormat.value} value={exportFormat.value}>
                  {t(exportFormat.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || filteredRecords.length === 0}
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-bold text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <Download className="h-4 w-4" />
            {exporting ? t('exporting') : t('exportPayroll')}
          </button>
        </div>
      </FormSection>

      {payrollRecords.length === 0 ? (
        <div className="floating-glass rounded-[2rem]">
          <EmptyState title={t('noRecords')} description={t('noRecordsDesc')} />
        </div>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-[22px] font-bold text-on-surface">{t('payrollRecords')}</h2>
            <p className="text-[14px] text-on-surface-variant/60">
              {formatPeriod(selectedMonth, selectedYear)}
            </p>
          </div>
          <DataTable
            columns={[
              { key: 'period', header: t('monthYear') },
              { key: 'baseSalaryFormatted', header: t('baseSalary'), className: 'text-end' },
              { key: 'allowancesFormatted', header: t('allowances'), className: 'text-end' },
              { key: 'deductionsFormatted', header: t('deductions'), className: 'text-end' },
              { key: 'netPayFormatted', header: t('netPay'), className: 'text-end font-bold' },
              {
                key: 'status',
                header: t('status'),
                render: (record) => (
                  <StatusBadge status={String(record.status)} label={statusLabel(String(record.status))} />
                ),
              },
              { key: 'createdAtFormatted', header: t('createdAt') },
            ]}
            data={tableRows}
            exportable={false}
            tableName="payroll-export"
            emptyTitle={t('noRecords')}
            emptyDescription={t('noRecordsDesc')}
          />
        </section>
      )}
    </div>
  );
}
