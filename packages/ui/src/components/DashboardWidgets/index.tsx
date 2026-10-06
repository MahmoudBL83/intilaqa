'use client';

import { cn } from "../../lib/utils";

// ─── Color Maps ──────────────────────────────────────────────────
const colorClasses = {
  blue: 'from-blue-50 to-blue-100 border-blue-200',
  green: 'from-green-50 to-green-100 border-green-200',
  red: 'from-red-50 to-red-100 border-red-200',
  yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
  emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
  purple: 'from-purple-50 to-purple-100 border-purple-200',
};

const textClasses = {
  blue: 'text-blue-900',
  green: 'text-green-900',
  red: 'text-red-900',
  yellow: 'text-yellow-900',
  emerald: 'text-emerald-900',
  purple: 'text-purple-900',
};

const trendClasses = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
};

// ─── KPICard ──────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'emerald' | 'purple';
  suffix?: string;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  color = 'emerald',
  suffix = '',
  loading = false,
}: KPICardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textClasses[color]} mb-1`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${textClasses[color]}`}>
            {loading ? '...' : value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
          {change !== undefined && (
            <div className={`text-xs mt-2 font-semibold flex items-center gap-1 ${trendClasses[trend]}`}>
              {trend === 'up' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 1.414L9.414 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {Math.abs(change)}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'change'}
            </div>
          )}
        </div>
        {icon && <div className={`${textClasses[color]} opacity-50`}>{icon}</div>}
      </div>
    </div>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────
interface StatRowProps {
  label: string;
  value: string | number;
  percentage?: number;
  color?: string;
}

export function StatRow({ label, value, percentage, color = 'bg-emerald-500' }: StatRowProps) {
  return (
    <div className="py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-lg font-bold text-gray-900">{value}</span>
      </div>
      {percentage !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── SimpleBarChart ───────────────────────────────────────────────
interface ChartData {
  labels: string[];
  data: number[];
  color?: string;
}

export function SimpleBarChart({ labels, data, color = 'bg-emerald-600' }: ChartData) {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="space-y-3">
      {labels.map((label, idx) => {
        const value = data[idx] || 0;
        return (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <span className="text-sm font-bold text-gray-900">{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────
interface ProgressRingProps {
  percentage: number;
  label: string;
  size?: number;
  color?: string;
}

export function ProgressRing({
  percentage,
  label,
  size = 120,
  color = '#10b981',
}: ProgressRingProps) {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="text-center mt-2">
        <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}

// ─── StatusDistribution ──────────────────────────────────────────
export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
  percentage: number;
}

export function StatusDistributionChart({ data }: { data: StatusDistribution[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.status}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", item.color)} />
              <span className="text-sm font-medium text-gray-700">{item.status}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all duration-500", item.color)}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LoadingCard ──────────────────────────────────────────────────
export function LoadingCard() {
  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-7 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ─── EmptyCard ────────────────────────────────────────────────────
export function EmptyCard({ message }: { message: string }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="mt-3 text-sm text-gray-500">{message}</p>
    </div>
  );
}
