'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { FormSection, EmptyState } from '@intilaqa/ui';

interface LoanRequest {
  id: string;
  amount: number;
  purpose: string;
  expectedRepaymentMonths: number;
  monthlyDeduction: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'completed';
  createdAt: string;
}

interface LoanRequestFormContentProps {
  employeeId: string;
  salary?: number;
  existingLoans?: LoanRequest[];
}

export function LoanRequestFormContent({
  employeeId,
  salary = 0,
  existingLoans = [],
}: LoanRequestFormContentProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    expectedRepaymentMonths: '12',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const maxLoan = salary * 3;
  const amount = parseFloat(formData.amount) || 0;
  const months = parseInt(formData.expectedRepaymentMonths) || 1;
  const monthlyDeduction = amount / months;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const validateForm = (): string | null => {
    if (!formData.amount) return t('amountRequired');
    if (amount <= 0) return t('amountMustBePositive');
    if (amount > maxLoan)
      return t('loanExceedsMaximum', {
        max: Math.floor(maxLoan),
      });
    if (!formData.purpose) return t('purposeRequired');
    if (formData.purpose.length < 5) return t('purposeTooShort');
    if (months < 1 || months > 24) return t('invalidRepaymentPeriod');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/loans/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          expectedRepaymentMonths: parseInt(formData.expectedRepaymentMonths),
          description: formData.description,
        }),
      });

      if (response.ok) {
        setSuccessMessage(t('loanRequestSubmitted'));
        setFormData({
          amount: '',
          purpose: '',
          expectedRepaymentMonths: '12',
          description: '',
        });
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || t('failedToSubmitLoanRequest'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLoans = existingLoans.filter(
    (l) => l.status === 'disbursed' || l.status === 'approved'
  );
  const totalActiveDeductions = activeLoans.reduce(
    (sum, l) => sum + l.monthlyDeduction,
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'disbursed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-200 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <div className="floating-glass rounded-[2rem] p-6">
        <h2 className="text-[18px] font-bold text-on-surface mb-6">
          {t('requestEmployeeLoan')}
        </h2>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-100 border border-green-300 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-[13px]">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-100 border border-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-[13px]">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title={t('loanDetails')}
            description={t('enterLoanInformation')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  {t('loanAmount')} *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder={t('enterAmount')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  step="100"
                />
                <p className="text-[11px] text-on-surface-variant/50 mt-1">
                  {t('maximumLoan')}: {Math.floor(maxLoan).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  {t('repaymentMonths')} *
                </label>
                <select
                  name="expectedRepaymentMonths"
                  value={formData.expectedRepaymentMonths}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m} {t('months')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {amount > 0 && months > 0 && (
              <div className="p-4 rounded-xl bg-primary/10 mb-4">
                <p className="text-[12px] text-on-surface-variant mb-2">
                  {t('monthlyDeduction')}
                </p>
                <p className="text-[20px] font-bold text-on-surface">
                  {new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'SAR',
                  }).format(monthlyDeduction)}
                </p>
              </div>
            )}
          </FormSection>

          <FormSection
            title={t('loanPurpose')}
            description={t('describeYourLoanNeed')}
          >
            <div className="mb-4">
              <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                {t('purpose')} *
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder={t('enterLoanPurpose')}
                className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                minLength={5}
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                {t('additionalDetails')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('enterAdditionalDetails')}
                className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
              />
            </div>
          </FormSection>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-primary text-white text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? t('submitting') : t('submitLoanRequest')}
          </button>
        </form>
      </div>

      {/* Active Loans Summary */}
      {activeLoans.length > 0 && (
        <div className="floating-glass rounded-[2rem] p-6">
          <h3 className="text-[16px] font-bold text-on-surface mb-4">
            {t('activeLoanDeductions')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-primary/10">
              <p className="text-[12px] text-on-surface-variant/50 uppercase tracking-wider font-bold mb-1">
                {t('activeLoans')}
              </p>
              <p className="text-[24px] font-bold text-on-surface">
                {activeLoans.length}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primary/10">
              <p className="text-[12px] text-on-surface-variant/50 uppercase tracking-wider font-bold mb-1">
                {t('totalActive')}
              </p>
              <p className="text-[24px] font-bold text-on-surface">
                {new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'SAR',
                    maximumFractionDigits: 0,
                  }).format(activeLoans.reduce((sum, l) => sum + l.amount, 0))}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primary/10">
              <p className="text-[12px] text-on-surface-variant/50 uppercase tracking-wider font-bold mb-1">
                {t('monthlyDeductions')}
              </p>
              <p className="text-[24px] font-bold text-on-surface">
                {new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: 'SAR',
                  maximumFractionDigits: 0,
                }).format(totalActiveDeductions)}
              </p>
            </div>
          </div>

          {/* Active Loans List */}
          <div className="space-y-2">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-xl bg-white/20 border border-white/30 flex items-start justify-between"
              >
                <div className="flex-1">
                  <p className="font-bold text-[13px] text-on-surface">
                    {loan.purpose}
                  </p>
                  <p className="text-[12px] text-on-surface-variant/50 mt-1">
                    {new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(loan.amount)}{' '}
                    • {loan.expectedRepaymentMonths} {t('months')}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-[11px] font-bold ${getStatusColor(
                      loan.status
                    )}`}
                  >
                    {t(loan.status)}
                  </span>
                  <p className="text-[12px] text-on-surface-variant/50 mt-2">
                    {t('monthly')}: {new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(loan.monthlyDeduction)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loan History */}
      {existingLoans.length > 0 && (
        <div className="floating-glass rounded-[2rem] p-6">
          <h3 className="text-[16px] font-bold text-on-surface mb-4">
            {t('loanHistory')}
          </h3>

          {existingLoans.length === 0 ? (
            <EmptyState
              title={t('noLoans')}
              description={t('youHaveNotRequestedAnyLoans')}
            />
          ) : (
            <div className="space-y-2">
              {existingLoans.map((loan) => (
                <div key={loan.id} className="p-3 rounded-lg bg-white/10 border border-white/20 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-[12px] text-on-surface">{loan.purpose}</p>
                    <p className="text-[11px] text-on-surface-variant/50">{new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR' }).format(loan.amount)} • {new Date(loan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold ${getStatusColor(loan.status)}`}>{t(loan.status)}</span>
                    {loan.status === "pending" && <button onClick={async () => { if (confirm(t("cancel"))) { await fetch("/api/v1/loans/cancel", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: loan.id }) }); window.location.reload(); } }} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold hover:bg-red-200">{t("cancel")}</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
