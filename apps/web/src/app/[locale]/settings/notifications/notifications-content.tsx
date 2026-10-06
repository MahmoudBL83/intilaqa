'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FormSection, PageHeader, LoadingState } from '@intilaqa/ui';
import { Loader2 } from 'lucide-react';

interface NotificationPreference { type: string; email: boolean; sms: boolean; inApp: boolean; }

const NOTIFICATION_TYPES = [
  { id: 'loan_approved', labelKey: 'loanApproved' },
  { id: 'loan_rejected', labelKey: 'loanRejected' },
  { id: 'attendance_alert', labelKey: 'attendanceAlert' },
  { id: 'payslip_generated', labelKey: 'payslipGenerated' },
  { id: 'document_expiry', labelKey: 'documentExpiry' },
  { id: 'compliance_alert', labelKey: 'complianceAlert' },
];

const CHANNEL_KEYS = ['email', 'sms', 'inApp'] as const;

export default function NotificationSettingsContent() {
  const t = useTranslations('settings');
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/notifications/preferences');
        if (res.ok) {
          const data = await res.json();
          if (data.preferences) setPrefs(data.preferences);
          else setPrefs(NOTIFICATION_TYPES.map(nt => ({ type: nt.id, email: true, sms: false, inApp: true })));
        }
      } catch { setPrefs(NOTIFICATION_TYPES.map(nt => ({ type: nt.id, email: true, sms: false, inApp: true }))); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggle = (typeId: string, ch: 'email'|'sms'|'inApp') => {
    setPrefs(prefs.map(p => p.type === typeId ? { ...p, [ch]: !p[ch] } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/v1/notifications/preferences', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(t('savedError'));
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('notifications')} subtitle={t('notificationsDescription')} />
      <FormSection title={t('notifications')} description={t('notificationsDescription')}>
        <div className="space-y-3">
          {NOTIFICATION_TYPES.map(nt => {
            const p = prefs.find(x => x.type === nt.id);
            if (!p) return null;
            return (
              <div key={nt.id} className="floating-glass rounded-2xl p-5">
                <h3 className="font-bold text-on-surface mb-3 text-sm">{t(nt.labelKey)}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {CHANNEL_KEYS.map(ch => {
                    const channelLabel = ch === 'email' ? t('emailChannel') : ch === 'sms' ? t('smsChannel') : t('inAppChannel');
                    return (
                      <label key={ch} className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={p[ch]}
                            onChange={() => toggle(nt.id, ch)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-outline-variant/30 rounded-full peer-checked:bg-primary transition-colors" />
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                        </div>
                        <span className="text-sm text-on-surface-variant font-medium">{channelLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-error/10 text-error text-sm font-medium">
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-4 p-3 rounded-2xl bg-success/10 text-success text-sm font-medium">
            {t('savedSuccess')}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? t('saving') : t('saveSettings')}
          </button>
        </div>
      </FormSection>
    </div>
  );
}
