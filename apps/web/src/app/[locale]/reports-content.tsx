'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  KPICard,
  SimpleBarChart,
  StatusDistributionChart,
  StatRow,
  LoadingCard,
  PageHeader,
} from '@intilaqa/ui';
import {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Shield,
  Download,
  Calendar,
  UserCheck,
  UserX,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import type { DashboardSummary } from '../../server/services/reports-service';

interface ReportsContentProps {
  data: DashboardSummary | null;
  error?: string | null;
  title: string;
  breadcrumbs: { label: string; href?: string }[];
}

type ReportTab = 'overview' | 'attendance' | 'payroll' | 'compliance' | 'employees';

export function ReportsContent({ data, error, title, breadcrumbs }: ReportsContentProps) {
  const t = useTranslations('reports');
  const tc = useTranslations('common');
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  const tabs: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: t('overview'), icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'attendance', label: t('attendance'), icon: <Clock className="w-4 h-4" /> },
    { key: 'payroll', label: t('payroll'), icon: <DollarSign className="w-4 h-4" /> },
    { key: 'compliance', label: t('compliance'), icon: <Shield className="w-4 h-4" /> },
    { key: 'employees', label: t('employees'), icon: <Users className="w-4 h-4" /> },
  ];

  const handleExportCsv = () => {
    if (!data) return;
    const rows: string[] = [];

    switch (activeTab) {
      case 'attendance':
        rows.push('Month,Present,Absent,Late,Total');
        data.attendance.monthlyAttendance.forEach((m) => {
          rows.push(`${m.month},${m.present},${m.absent},${m.late},${m.total}`);
        });
        break;
      case 'payroll':
        rows.push('Month,Gross,Deductions,Net');
        data.payroll.monthlyPayroll.forEach((m) => {
          rows.push(`${m.month},${m.gross},${m.deductions},${m.net}`);
        });
        break;
      case 'compliance':
        rows.push('Type,Count,Expired');
        data.compliance.byType.forEach((t) => {
          rows.push(`${t.type},${t.count},${t.expired}`);
        });
        break;
      case 'employees':
        rows.push('Department,Count');
        data.employees.byDepartment.forEach((d) => {
          rows.push(`${d.department},${d.count}`);
        });
        rows.push('');
        rows.push('Nationality,Count');
        data.employees.byNationality.forEach((n) => {
          rows.push(`${n.nationality},${n.count}`);
        });
        break;
      default:
        rows.push('Metric,Value');
        rows.push(`Total Employees,${data.employees.total}`);
        rows.push(`Present Today,${data.attendance.presentToday}`);
        rows.push(`Total Payroll,${data.payroll.totalPayroll}`);
        rows.push(`Compliance Valid,${data.compliance.valid}`);
    }

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div>
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-1">{tc('error')}</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={title}
        breadcrumbs={breadcrumbs}
        actions={
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            {t('exportCSV')}
          </button>
        }
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

      {activeTab === 'overview' && <OverviewTab data={data} t={t} onNavigate={setActiveTab} />}
      {activeTab === 'attendance' && <AttendanceTab data={data.attendance} t={t} />}
      {activeTab === 'payroll' && <PayrollTab data={data.payroll} t={t} />}
      {activeTab === 'compliance' && <ComplianceTab data={data.compliance} t={t} />}
      {activeTab === 'employees' && <EmployeeTab data={data.employees} t={t} />}
    </div>
  );
}

function OverviewTab({ data, t, onNavigate }: { data: DashboardSummary; t: (key: string) => string; onNavigate: (tab: ReportTab) => void }) {
  const attendanceRate = data.attendance.totalEmployees > 0
    ? Math.round((data.attendance.presentToday / data.attendance.totalEmployees) * 100)
    : 0;
  const complianceRate = data.compliance.totalDocuments > 0
    ? Math.round((data.compliance.valid / data.compliance.totalDocuments) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('employees')} className="cursor-pointer text-left w-full">
          <KPICard
            title={t('totalEmployees')}
            value={data.employees.total}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
        </button>
        <button onClick={() => onNavigate('attendance')} className="cursor-pointer text-left w-full">
          <KPICard
            title={t('presentToday')}
            value={data.attendance.presentToday}
            suffix={`/ ${data.attendance.totalEmployees}`}
            icon={<UserCheck className="w-6 h-6" />}
            color="emerald"
            trend={attendanceRate >= 80 ? 'up' : attendanceRate >= 50 ? 'neutral' : 'down'}
            change={attendanceRate}
          />
        </button>
        <button onClick={() => onNavigate('payroll')} className="cursor-pointer text-left w-full">
          <KPICard
            title={t('totalPayroll')}
            value={data.payroll.totalPayroll.toLocaleString()}
            suffix="SAR"
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
          />
        </button>
        <button onClick={() => onNavigate('compliance')} className="cursor-pointer text-left w-full">
          <KPICard
            title={t('totalDocuments')}
            value={data.compliance.totalDocuments}
            icon={<Shield className="w-6 h-6" />}
            color="yellow"
            trend={complianceRate >= 80 ? 'up' : complianceRate >= 50 ? 'neutral' : 'down'}
            change={complianceRate}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('monthlyAttendance')}</h3>
          <SimpleBarChart
            labels={data.attendance.monthlyAttendance.map((m) => m.month)}
            data={data.attendance.monthlyAttendance.map((m) => m.present)}
            color="bg-emerald-500"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('departmentBreakdown')}</h3>
          <SimpleBarChart
            labels={data.employees.byDepartment.map((d) => d.department)}
            data={data.employees.byDepartment.map((d) => d.count)}
            color="bg-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function AttendanceTab({ data, t }: { data: DashboardSummary['attendance']; t: (key: string) => string }) {
  const todayDist = [
    { status: t('presentToday'), count: data.presentToday, color: 'bg-emerald-500', percentage: data.totalEmployees > 0 ? Math.round((data.presentToday / data.totalEmployees) * 100) : 0 },
    { status: t('absentToday'), count: data.absentToday, color: 'bg-red-500', percentage: data.totalEmployees > 0 ? Math.round((data.absentToday / data.totalEmployees) * 100) : 0 },
    { status: t('lateToday'), count: data.lateToday, color: 'bg-yellow-500', percentage: data.totalEmployees > 0 ? Math.round((data.lateToday / data.totalEmployees) * 100) : 0 },
    { status: t('onLeaveToday'), count: data.onLeaveToday, color: 'bg-blue-500', percentage: data.totalEmployees > 0 ? Math.round((data.onLeaveToday / data.totalEmployees) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t('totalEmployees')} value={data.totalEmployees} icon={<Users className="w-6 h-6" />} color="blue" />
        <KPICard title={t('presentToday')} value={data.presentToday} icon={<UserCheck className="w-6 h-6" />} color="emerald" />
        <KPICard title={t('absentToday')} value={data.absentToday} icon={<UserX className="w-6 h-6" />} color="red" />
        <KPICard title={t('lateToday')} value={data.lateToday} icon={<AlertTriangle className="w-6 h-6" />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('monthlyAttendance')}</h3>
          <SimpleBarChart
            labels={data.monthlyAttendance.map((m) => m.month)}
            data={data.monthlyAttendance.map((m) => m.present)}
            color="bg-emerald-500"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('overview')}</h3>
          <StatusDistributionChart data={todayDist} />
        </div>
      </div>
    </div>
  );
}

function PayrollTab({ data, t }: { data: DashboardSummary['payroll']; t: (key: string) => string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t('totalPayroll')} value={data.totalPayroll.toLocaleString()} suffix="SAR" icon={<DollarSign className="w-6 h-6" />} color="purple" />
        <KPICard title={t('averageSalary')} value={data.averageSalary.toLocaleString()} suffix="SAR" icon={<DollarSign className="w-6 h-6" />} color="blue" />
        <KPICard title={t('totalDeductions')} value={data.totalDeductions.toLocaleString()} suffix="SAR" icon={<DollarSign className="w-6 h-6" />} color="red" />
        <KPICard title="Departments" value={data.departmentBreakdown.length} icon={<Users className="w-6 h-6" />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payrollTrend')}</h3>
          <SimpleBarChart
            labels={data.monthlyPayroll.map((m) => m.month)}
            data={data.monthlyPayroll.map((m) => m.net)}
            color="bg-purple-500"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('departmentBreakdown')}</h3>
          <div className="space-y-1">
            {data.departmentBreakdown.map((d) => (
              <StatRow
                key={d.department}
                label={d.department}
                value={`${d.totalSalary.toLocaleString()} SAR`}
                percentage={data.totalPayroll > 0 ? Math.round((d.totalSalary / data.totalPayroll) * 100) : 0}
                color="bg-purple-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceTab({ data, t }: { data: DashboardSummary['compliance']; t: (key: string) => string }) {
  const complianceRate = data.totalDocuments > 0
    ? Math.round((data.valid / data.totalDocuments) * 100)
    : 0;

  const dist = [
    { status: t('validDocuments'), count: data.valid, color: 'bg-emerald-500', percentage: data.totalDocuments > 0 ? Math.round((data.valid / data.totalDocuments) * 100) : 0 },
    { status: t('expiring60Days'), count: data.expiring60, color: 'bg-blue-500', percentage: data.totalDocuments > 0 ? Math.round((data.expiring60 / data.totalDocuments) * 100) : 0 },
    { status: t('expiring30Days'), count: data.expiring30, color: 'bg-yellow-500', percentage: data.totalDocuments > 0 ? Math.round((data.expiring30 / data.totalDocuments) * 100) : 0 },
    { status: t('expiredDocuments'), count: data.expired, color: 'bg-red-500', percentage: data.totalDocuments > 0 ? Math.round((data.expired / data.totalDocuments) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t('totalDocuments')} value={data.totalDocuments} icon={<FileText className="w-6 h-6" />} color="blue" />
        <KPICard title={t('validDocuments')} value={data.valid} icon={<FileText className="w-6 h-6" />} color="emerald" />
        <KPICard title={t('expiredDocuments')} value={data.expired} icon={<AlertTriangle className="w-6 h-6" />} color="red" />
        <KPICard title={t('expiring30Days')} value={data.expiring30} icon={<Calendar className="w-6 h-6" />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('complianceByType')}</h3>
          <SimpleBarChart
            labels={data.byType.map((t) => t.type)}
            data={data.byType.map((t) => t.count)}
            color="bg-emerald-500"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('overview')}</h3>
          <StatusDistributionChart data={dist} />
        </div>
      </div>
    </div>
  );
}

function EmployeeTab({ data, t }: { data: DashboardSummary['employees']; t: (key: string) => string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t('totalEmployees')} value={data.total} icon={<Users className="w-6 h-6" />} color="blue" />
        <KPICard title={t('activeEmployees')} value={data.active} icon={<UserCheck className="w-6 h-6" />} color="emerald" />
        <KPICard title={t('saudiEmployees')} value={data.saudi} icon={<Users className="w-6 h-6" />} color="green" />
        <KPICard title={t('expatEmployees')} value={data.expat} icon={<Users className="w-6 h-6" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('employeesByDepartment')}</h3>
          <SimpleBarChart
            labels={data.byDepartment.map((d) => d.department)}
            data={data.byDepartment.map((d) => d.count)}
            color="bg-blue-500"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('employeesByNationality')}</h3>
          <SimpleBarChart
            labels={data.byNationality.map((n) => n.nationality)}
            data={data.byNationality.map((n) => n.count)}
            color="bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
