'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Clock, FileText } from 'lucide-react';

interface ExpiryAlert {
  id: string;
  name: string;
  type: string;
  expiryDate: Date | string;
  daysRemaining: number;
  entityName: string;
  entityType: 'company' | 'employee';
}

interface DocumentExpiryAlertsProps {
  alerts: ExpiryAlert[];
  onAction?: (alertId: string, action: 'update' | 'renew') => void;
  maxItems?: number;
}

export function DocumentExpiryAlerts({
  alerts,
  onAction,
  maxItems = 5,
}: DocumentExpiryAlertsProps) {
  const t = useTranslations('dashboard');

  const sortedAlerts = [...alerts]
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, maxItems);

  const getAlertLevel = (daysRemaining: number) => {
    if (daysRemaining <= 7) return { level: 'critical', color: 'text-error', bg: 'bg-error/10' };
    if (daysRemaining <= 30) return { level: 'warning', color: 'text-warning', bg: 'bg-warning/10' };
    return { level: 'info', color: 'text-primary', bg: 'bg-primary/10' };
  };

  if (alerts.length === 0) {
    return (
      <div className="floating-glass rounded-[2rem] p-6">
        <h3 className="text-[16px] font-bold text-on-surface mb-4">
          {t('complianceAlerts')}
        </h3>
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-on-surface-variant/50 text-[14px] font-medium">
            {t('noExpiringDocuments')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="floating-glass rounded-[2rem] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[18px] font-bold text-on-surface">
            {t('complianceAlerts')}
          </h3>
          <p className="text-on-surface-variant/50 text-[13px] mt-0.5">
            {t('trackExpiring')}
          </p>
        </div>
        {alerts.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest border border-error/10">
            {alerts.length} {t('actionsRequired')}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {sortedAlerts.map((alert) => {
          const { level, color, bg } = getAlertLevel(alert.daysRemaining);
          const alertDate = new Date(alert.expiryDate);

          return (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-[1.5rem] border border-white/40 hover:bg-white/50 transition-all ${
                level === 'critical' ? 'bg-error/5' : level === 'warning' ? 'bg-warning/5' : 'bg-white/30'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}
              >
                {level === 'critical' ? (
                  <AlertTriangle className={`w-5 h-5 ${color}`} />
                ) : (
                  <Clock className={`w-5 h-5 ${color}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-on-surface text-[14px] truncate">
                  {alert.name}
                </h4>
                <p className="text-on-surface-variant/50 text-[12px] mt-0.5">
                  {alert.entityName} • {alert.type}
                </p>
                <p className="text-on-surface-variant/40 text-[11px] mt-1">
                  {t('expiresOn')}: {alertDate.toLocaleDateString()}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className={`text-[13px] font-bold ${color}`}>
                  {alert.daysRemaining} {t('daysBadge')}
                </div>
                <div className="text-on-surface-variant/40 text-[11px]">
                  {level === 'critical' ? t('expiringSoon') : t('upcomingExpiry')}
                </div>
              </div>

              <button
                onClick={() => onAction?.(alert.id, 'renew')}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all shrink-0"
              >
                {t('renew')}
              </button>
            </div>
          );
        })}
      </div>

      {alerts.length > maxItems && (
        <button className="w-full mt-4 py-2 rounded-xl border border-white/60 bg-white/30 text-on-surface text-[13px] font-bold hover:bg-white/50 transition-all">
          {t('viewAllAlerts')} →
        </button>
      )}
    </div>
  );
}
