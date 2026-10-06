"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Shield, ShieldAlert, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle,
  FileText, Building2, User, Filter, Plus, X, Upload, Award,
} from "lucide-react";
import { PageHeader, StatusBadge, DataTable } from "@intilaqa/ui";

type DocumentInfo = {
  id: string;
  name: string;
  type: string;
  expiryDate: string | null;
} | null;

type AlertItem = {
  id: string;
  type: string;
  alertLevel: string;
  severity: string;
  title: string;
  description: string | null;
  status: string;
  channel: string;
  ownerType: string;
  ownerId: string;
  document: DocumentInfo;
  dueDate: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  documentNumber: string | null;
  issuingAuthority: string | null;
  ownerType: string;
  ownerId: string;
  expiryDate: string | null;
  status: string;
};

type Props = {
  locale: string;
  companyId: string;
  initialAlerts: AlertItem[];
  initialDocuments: DocumentItem[];
};

const alertLevelConfig: Record<string, { color: string; icon: typeof ShieldAlert }> = {
  expired: { color: "bg-red-100 text-red-700 border-red-200", icon: ShieldAlert },
  "30_days": { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  "60_days": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertTriangle },
  "90_days": { color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertTriangle },
};

export function CompliancePageContent({ locale, companyId, initialAlerts, initialDocuments }: Props) {
  const tc = useTranslations("compliance");
  const tn = useTranslations("nav");
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [scanning, setScanning] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDocType, setFilterDocType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("commercial_registration");
  const [newDocOwner, setNewDocOwner] = useState("company");
  const [newDocNumber, setNewDocNumber] = useState("");
  const [newDocAuthority, setNewDocAuthority] = useState("");
  const [newDocExpiry, setNewDocExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => tc(`month.${i + 1}` as any));

  const handleScan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/v1/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan", companyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts((prev) => [...data.alerts, ...prev]);
      }
    } catch {
      // silently fail
    } finally {
      setScanning(false);
    }
  }, [companyId]);

  const handleResolve = useCallback(async (alertId: string) => {
    setResolving(alertId);
    try {
      const res = await fetch("/api/v1/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", alertId }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId ? { ...a, status: "dismissed", resolvedAt: new Date().toISOString() } : a
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setResolving(null);
    }
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddDocument = useCallback(async () => {
    if (!newDocName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          companyId,
          name: newDocName,
          type: newDocType,
          ownerType: newDocOwner,
          documentNumber: newDocNumber || undefined,
          issuingAuthority: newDocAuthority || undefined,
          expiryDate: newDocExpiry || undefined,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setDocuments((prev) => [created.document, ...prev]);
        setShowAddDialog(false);
        setNewDocName("");
        setNewDocType("commercial_registration");
        setNewDocOwner("company");
        setNewDocNumber("");
        setNewDocAuthority("");
        setNewDocExpiry("");
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [companyId, newDocName, newDocType, newDocOwner, newDocNumber, newDocAuthority, newDocExpiry]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterOwner !== "all" && a.ownerType !== filterOwner) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterDocType !== "all" && a.document?.type !== filterDocType) return false;
      if (filterLevel !== "all" && a.alertLevel !== filterLevel) return false;
      if (filterMonth !== "all" && a.document?.expiryDate) {
        const d = new Date(a.document.expiryDate);
        if (months[d.getMonth()] !== filterMonth) return false;
      }
      if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [alerts, filterOwner, filterStatus, filterDocType, filterLevel, filterMonth, searchQuery]);

  const pendingAlerts = alerts.filter((a) => a.status === "pending").length;
  const expiredAlerts = alerts.filter((a) => a.alertLevel === "expired" && a.status === "pending").length;
  const resolvedCount = alerts.filter((a) => a.status === "dismissed").length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredAlerts.length) return new Set();
      return new Set(filteredAlerts.map((a) => a.id));
    });
  }, [filteredAlerts]);

  const handleBatchAction = useCallback(async (action: "resolve" | "dismiss") => {
    if (selectedIds.size === 0) return;
    setBatchLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch("/api/v1/compliance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, alertId: id }),
        });
      }
      setAlerts((prev) =>
        prev.map((a) => (selectedIds.has(a.id) ? { ...a, status: "dismissed", resolvedAt: new Date().toISOString() } : a))
      );
      setSelectedIds(new Set());
    } catch {
      // silently fail
    } finally {
      setBatchLoading(false);
    }
  }, [selectedIds]);

  return (
    <div>
      <PageHeader
        title={tc("title")}
        breadcrumbs={[
          { label: tn("items.dashboard"), href: `/${locale}/company` },
          { label: tc("title") },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-5 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[13px] font-bold flex items-center gap-2 hover:bg-white/60 transition-all"
            >
              <Plus className="w-4 h-4" />
              {tc("addDocument")}
            </button>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? tc("scanning") : tc("scanNow")}
            </button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("alertLevels.expired")}</p>
              <p className="text-on-surface text-[24px] font-bold">{expiredAlerts}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("pending")}</p>
              <p className="text-on-surface text-[24px] font-bold">{pendingAlerts}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("documentTypes.commercial_registration")}</p>
              <p className="text-on-surface text-[24px] font-bold">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="floating-glass p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">{tc("resolved")}</p>
              <p className="text-on-surface text-[24px] font-bold">{resolvedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="floating-glass rounded-[2rem] p-5 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-on-surface-variant/60 shrink-0" />
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="px-3 py-2 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[12px] font-medium focus:outline-none focus:border-primary">
            <option value="all">{tc("allOwners")}</option>
            <option value="company">{tc("ownerTypes.company")}</option>
            <option value="employee">{tc("ownerTypes.employee")}</option>
          </select>
          <select value={filterDocType} onChange={(e) => setFilterDocType(e.target.value)} className="px-3 py-2 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[12px] font-medium focus:outline-none focus:border-primary">
            <option value="all">{tc("allTypes")}</option>
            {Object.entries({
              commercial_registration: tc("documentTypes.commercial_registration"),
              municipality_license: tc("documentTypes.municipality_license"),
              zakat_certificate: tc("documentTypes.zakat_certificate"),
              chamber_subscription: tc("documentTypes.chamber_subscription"),
              iqama: tc("documentTypes.iqama"),
              passport: tc("documentTypes.passport"),
              work_license: tc("documentTypes.work_license"),
              professional_certificate: tc("documentTypes.professional_certificate"),
            }).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[12px] font-medium focus:outline-none focus:border-primary">
            <option value="all">{tc("allStatus")}</option>
            <option value="pending">{tc("pending")}</option>
            <option value="dismissed">{tc("dismissed")}</option>
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-3 py-2 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[12px] font-medium focus:outline-none focus:border-primary">
            <option value="all">{tc("allLevels")}</option>
            <option value="90_days">{tc("alertLevels.90_days")}</option>
            <option value="60_days">{tc("alertLevels.60_days")}</option>
            <option value="30_days">{tc("alertLevels.30_days")}</option>
            <option value="expired">{tc("alertLevels.expired")}</option>
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[12px] font-medium focus:outline-none focus:border-primary">
            <option value="all">{tc("allMonths")}</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="text"
            placeholder={tc("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[12px] font-medium focus:outline-none focus:border-primary flex-1 min-w-[120px] placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-on-surface">{tc("title")}</h3>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant/50 text-[12px]">{tc("selectedCount", { count: selectedIds.size })}</span>
              <button
                onClick={() => handleBatchAction("resolve")}
                disabled={batchLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold hover:bg-emerald-200 disabled:opacity-50"
              >
                {tc("resolveSelected")}
              </button>
              <button
                onClick={() => handleBatchAction("dismiss")}
                disabled={batchLoading}
                className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold hover:bg-red-200 disabled:opacity-50"
              >
                {tc("dismissSelected")}
              </button>
            </div>
          )}
        </div>
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-on-surface-variant font-medium text-[14px]">{tc("allClear")}</p>
            <p className="text-on-surface-variant/50 text-[12px] mt-1">{tc("noAlertsMatch")}</p>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: "select",
                header: "",
                render: (item: AlertItem) => (
                  <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" />
                ),
              },
              {
                key: "alertLevel",
                header: tc("level"),
                render: (item: AlertItem) => {
                  const cfg = alertLevelConfig[item.alertLevel] || alertLevelConfig["90_days"]!;
                  const Icon = cfg.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {tc(`alertLevels.${item.alertLevel}`)}
                    </span>
                  );
                },
              },
              {
                key: "title",
                header: tc("title_field"),
                render: (item: AlertItem) => (
                  <div>
                    <p className="text-on-surface text-[14px] font-bold">{item.title}</p>
                    {item.description && (
                      <p className="text-on-surface-variant/50 text-[12px]">{item.description}</p>
                    )}
                  </div>
                ),
              },
              {
                key: "ownerType",
                header: tc("owner"),
                render: (item: AlertItem) => (
                  <span className="text-on-surface-variant/70 text-[13px] flex items-center gap-1">
                    {item.ownerType === "company" ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {tc(`ownerTypes.${item.ownerType}`)}
                  </span>
                ),
              },
              {
                key: "channel",
                header: tc("channel"),
                render: (item: AlertItem) => (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">{item.channel}</span>
                ),
              },
              {
                key: "status",
                header: tc("status"),
                render: (item: AlertItem) => (
                  <StatusBadge status={item.status === "dismissed" ? "resolved" : item.status} />
                ),
              },
              {
                key: "actions",
                header: "",
                render: (item: AlertItem) =>
                  item.status === "pending" ? (
                    <button
                      onClick={() => handleResolve(item.id)}
                      disabled={resolving === item.id}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
                      title={tc("dismiss")}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : null,
              },
            ]}
            data={filteredAlerts}
            emptyTitle={tc("noAlerts")}
            emptyDescription={tc("noAlertsDesc")}
          />
        )}
      </div>

      {/* Documents Table */}
      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <h3 className="text-[18px] font-bold text-on-surface mb-5">{tc("documentTypes.commercial_registration")}</h3>
        {documents.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-on-surface-variant font-medium text-[14px]">{tc("noDocuments")}</p>
            <p className="text-on-surface-variant/50 text-[12px] mt-1">{tc("noDocumentsDesc")}</p>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: "name",
                header: tc("documentName"),
                render: (item: DocumentItem) => (
                  <div>
                    <p className="text-on-surface text-[14px] font-bold">{item.name}</p>
                    <p className="text-on-surface-variant/50 text-[11px]">
                      {tc(`documentTypes.${item.type}`)}
                    </p>
                  </div>
                ),
              },
              {
                key: "documentNumber",
                header: tc("documentNumber"),
                render: (item: DocumentItem) => (
                  <span className="text-on-surface-variant/70 text-[13px] font-mono">{item.documentNumber || "—"}</span>
                ),
              },
              {
                key: "ownerType",
                header: tc("owner"),
                render: (item: DocumentItem) => (
                  <span className="text-on-surface-variant/70 text-[13px]">{tc(`ownerTypes.${item.ownerType}`)}</span>
                ),
              },
              {
                key: "expiryDate",
                header: tc("expiry"),
                render: (item: DocumentItem) => {
                  if (!item.expiryDate) return <span className="text-on-surface-variant/50 text-[13px]">—</span>;
                  const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const cls = daysLeft <= 0 ? "text-red-600 font-bold" : daysLeft <= 30 ? "text-red-600" : daysLeft <= 60 ? "text-yellow-600" : "text-on-surface-variant/70";
                  return <span className={`${cls} text-[13px]`}>{formatDate(item.expiryDate)}</span>;
                },
              },
              {
                key: "status",
                header: tc("status"),
                render: (item: DocumentItem) => <StatusBadge status={item.status} />,
              },
            ]}
            data={documents}
            emptyTitle={tc("noDocuments")}
            emptyDescription={tc("noDocumentsDesc")}
          />
        )}
      </div>

      {/* Professional Certificates */}
      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[18px] font-bold text-on-surface">{tc("professionalCertificates")}</h3>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{tc("professionalCertificatesDesc")}</p>
          </div>
          <Award className="w-8 h-8 text-primary/30" />
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-on-surface">{tc("qiwaPlaceholder")}</p>
            <p className="text-[11px] text-on-surface-variant/50 mt-0.5">{tc("professionalCertificatesDesc")}</p>
          </div>
        </div>
      </div>

      {/* Add Document Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddDialog(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-on-surface">{tc("addDocument")}</h3>
              <button onClick={() => setShowAddDialog(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-on-surface-variant/50 text-[13px] mb-6">{tc("addDocumentDesc")}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tc("documentName")}</label>
                <input type="text" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tc("documentType")}</label>
                <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary">
                  {Object.entries({
                    commercial_registration: tc("documentTypes.commercial_registration"),
                    municipality_license: tc("documentTypes.municipality_license"),
                    zakat_certificate: tc("documentTypes.zakat_certificate"),
                    chamber_subscription: tc("documentTypes.chamber_subscription"),
                    iqama: tc("documentTypes.iqama"),
                    passport: tc("documentTypes.passport"),
                    work_license: tc("documentTypes.work_license"),
                    professional_certificate: tc("documentTypes.professional_certificate"),
                  }).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tc("owner")}</label>
                <select value={newDocOwner} onChange={(e) => setNewDocOwner(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="company">{tc("ownerTypes.company")}</option>
                  <option value="employee">{tc("ownerTypes.employee")}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tc("documentNumber")}</label>
                <input type="text" value={newDocNumber} onChange={(e) => setNewDocNumber(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tc("issuingAuthority")}</label>
                <input type="text" value={newDocAuthority} onChange={(e) => setNewDocAuthority(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tc("expiry")}</label>
                <input type="date" value={newDocExpiry} onChange={(e) => setNewDocExpiry(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddDialog(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/60 text-on-surface text-[13px] font-bold hover:bg-gray-50 transition-colors">
                {tc("cancel")}
              </button>
              <button onClick={handleAddDocument} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? tc("saving") : tc("addDocument")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
