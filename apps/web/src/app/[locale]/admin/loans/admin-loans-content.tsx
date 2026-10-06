"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, Send, Ban,
} from "lucide-react";
import { PageHeader, StatusBadge, Pagination } from "@intilaqa/ui";

type LoanRequest = {
  id: string;
  employeeName: string;
  companyName: string;
  amount: number;
  purpose: string;
  expectedRepaymentMonths: number;
  monthlyDeduction: number;
  status: string;
  createdAt: Date;
};

export function AdminLoansContent({
  loanRequests, error, currentPage = 1, totalPages = 1,
}: {
  loanRequests: LoanRequest[];
  error: string | null;
  currentPage?: number;
  totalPages?: number;
}) {
  const t = useTranslations("loans");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const [loans, setLoans] = useState<LoanRequest[]>(loanRequests);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = useCallback(async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch("/api/v1/loans/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanRequestId: id, action, reason: action === "reject" ? "Rejected by admin" : undefined }),
      });
      if (res.ok) {
        setLoans((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: action === "approve" ? "approved" : "rejected" } : l))
        );
      }
    } catch {
      // silently fail
    } finally {
      setProcessing(null);
    }
  }, []);

  const pending = loans.filter((l) => l.status === "pending").length;
  const approved = loans.filter((l) => l.status === "approved" || l.status === "disbursed").length;
  const rejected = loans.filter((l) => l.status === "rejected").length;
  const totalAmount = loans.reduce((s, l) => s + l.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3.5 h-3.5" />;
      case "approved": case "disbursed": return <CheckCircle className="w-3.5 h-3.5" />;
      case "rejected": return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title={t("title")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("title") }]} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("title") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{t("pending")}</p>
              <p className="text-on-surface text-[24px] font-bold">{pending}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{t("approved")}</p>
              <p className="text-on-surface text-[24px] font-bold">{approved}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><XCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{t("rejected")}</p>
              <p className="text-on-surface text-[24px] font-bold">{rejected}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{t("totalAmount")}</p>
              <p className="text-on-surface text-[24px] font-bold">{totalAmount.toLocaleString()} SAR</p>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-glass rounded-[2rem] p-6">
        <h3 className="text-[18px] font-bold text-on-surface mb-5">{t("allLoans")}</h3>
        {loans.length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-on-surface-variant font-medium text-[14px]">{t("noLoans")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("employee")}</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("company")}</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("purpose")}</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("amount")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("monthly")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("months")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("status")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("date")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase tracking-wider">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3 font-medium text-gray-900">{loan.employeeName}</td>
                    <td className="px-3 py-3 text-gray-600">{loan.companyName}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-[200px] truncate">{loan.purpose}</td>
                    <td className="px-3 py-3 text-right font-semibold">{loan.amount.toLocaleString()} SAR</td>
                    <td className="px-3 py-3 text-center">{loan.monthlyDeduction.toLocaleString()} SAR</td>
                    <td className="px-3 py-3 text-center">{loan.expectedRepaymentMonths}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        loan.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        loan.status === "approved" || loan.status === "disbursed" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {getStatusIcon(loan.status)}
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500 text-[12px]">{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {loan.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(loan.id, "approve")}
                              disabled={processing === loan.id}
                              className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-[11px] font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> {t("approve")}
                            </button>
                            <button
                              onClick={() => handleAction(loan.id, "reject")}
                              disabled={processing === loan.id}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-[11px] font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> {t("reject")}
                            </button>
                          </>
                        )}
                        {loan.status !== "pending" && (
                          <span className="text-[11px] text-on-surface-variant/50">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
