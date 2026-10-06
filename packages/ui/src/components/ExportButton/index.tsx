'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ExportButtonProps {
  type:
    | 'employees'
    | 'payroll'
    | 'documents'
    | 'attendance'
    | 'violations'
    | 'loans';
  filename?: string;
  companyId?: string;
  month?: string;
  year?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function ExportButton({
  type,
  filename,
  companyId,
  month,
  year,
  disabled = false,
  className = '',
  variant = 'secondary',
}: ExportButtonProps) {
  const t = useTranslations('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [showMenu, setShowMenu] = useState(false);

  const formats = [
    { value: 'xlsx', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'pdf', label: 'PDF' },
    { value: 'json', label: 'JSON' },
    { value: 'tsv', label: 'TSV' },
    { value: 'html', label: 'HTML' },
    { value: 'markdown', label: 'Markdown' },
  ];

  const handleExport = async (format: string) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        type,
        format,
        ...(companyId && { companyId }),
        ...(month && { month }),
        ...(year && { year }),
      });

      const response = await fetch(`/api/v1/export?${params}`);

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      // Get filename from headers
      const contentDisposition = response.headers.get('content-disposition');
      const match = contentDisposition?.match(/filename="?([^"]+)"?/);
      const downloadFilename = match?.[1] || filename || `export-${Date.now()}`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('exportFailed') || 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg',
    secondary:
      'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300',
    outline:
      'bg-transparent hover:bg-emerald-50 text-emerald-700 border border-emerald-300',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isLoading}
        className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {t('export') || 'Export'}
        {isLoading && (
          <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full ml-1" />
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-600 px-3 py-2 uppercase tracking-wide">
              {t('exportFormat') || 'Export Format'}
            </div>

            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => handleExport(format.value)}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 rounded hover:bg-emerald-100 text-sm text-gray-700 hover:text-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <span>{format.label}</span>
                {isLoading && selectedFormat === format.value && (
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
