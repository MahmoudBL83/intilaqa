'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface SaudizationRingProps {
  current: number;
  target: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SaudizationRing({
  current,
  target,
  label,
  size = 'md',
}: SaudizationRingProps) {
  const t = useTranslations();
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  let ringColor = '#ef4444'; // red
  if (percentage >= target) {
    ringColor = '#10b981'; // green
  } else if (percentage >= target * 0.75) {
    ringColor = '#f59e0b'; // amber
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`${textSizeClasses[size]} font-bold text-on-surface`}>
            {percentage}%
          </div>
          <div className="text-[12px] text-on-surface-variant/50">
            {current}/{target}
          </div>
        </div>
      </div>

      {label && (
        <div className="text-center">
          <h4 className="font-bold text-on-surface text-[14px]">{label}</h4>
          <p className="text-on-surface-variant/50 text-[12px] mt-1">
            {t('saudiPercentage')}
          </p>
        </div>
      )}

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-[12px]">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: ringColor }}
        />
        <span className="text-on-surface-variant/70">
          {percentage >= target ? t('compliant') : t('belowTarget')}
        </span>
      </div>
    </div>
  );
}
