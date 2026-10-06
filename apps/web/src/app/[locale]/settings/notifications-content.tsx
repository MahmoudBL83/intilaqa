'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FormSection, SettingsCard } from '@intilaqa/ui';

interface NotificationPreference {
  type: string;
  email: boolean;
  sms: boolean;
  label: string;
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    type: 'loan_approved',
    email: true,
    sms: true,
    label: 'Loan Approval',
  },
  {
    type: 'loan_rejected',
    email: true,
    sms: false,
    label: 'Loan Rejection',
  },
  {
    type: 'attendance_alert',
    email: true,
    sms: false,
    label: 'Attendance Alerts',
  },
  {
    type: 'payroll_ready',
    email: true,
    sms: false,
    label: 'Payroll Ready',
  },
  {
    type: 'payslip_generated',
    email: true,
    sms: false,
    label: 'Payslip Generated',
  },
  {
    type: 'document_expiry',
    email: true,
    sms: true,
    label: 'Document Expiry',
  },
  {
    type: 'compliance_alert',
    email: true,
    sms: false,
    label: 'Compliance Alert',
  },
];

export function NotificationSettingsContent() {
  const t = useTranslations('dashboard');
  const [preferences, setPreferences] = useState<NotificationPreference[]>(
    DEFAULT_PREFERENCES
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleToggle = (index: number, channel: 'email' | 'sms') => {
    const updated = [...preferences];
    if (updated[index]) {
      updated[index][channel] = !updated[index][channel];
      setPreferences(updated);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: t('notificationsSaved') || 'Preferences saved',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving preferences' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async (type: string) => {
    try {
      const response = await fetch('/api/v1/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Test notification sent',
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to send test notification',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <FormSection
        title={t('notifications') || 'Notifications'}
        description={t('notificationSettings') || 'Manage your notification preferences'}
      >
        <div className="space-y-4">
          {preferences.map((pref, index) => (
            <SettingsCard
              key={pref.type}
              title={pref.label}
              description={`Receive ${pref.label.toLowerCase()} notifications`}
            >
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.email}
                    onChange={() => handleToggle(index, 'email')}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('emailNotifications') || 'Email'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.sms}
                    onChange={() => handleToggle(index, 'sms')}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('smsNotifications') || 'SMS'}
                  </span>
                </label>

                <button
                  onClick={() => handleSendTest(pref.type)}
                  className="ml-auto px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors"
                >
                  Test
                </button>
              </div>
            </SettingsCard>
          ))}
        </div>
      </FormSection>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>

        <button
          onClick={() => setPreferences(DEFAULT_PREFERENCES)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

export default NotificationSettingsContent;
