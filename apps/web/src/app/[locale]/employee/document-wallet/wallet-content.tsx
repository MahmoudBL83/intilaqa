"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Upload, FileText, AlertTriangle, Download, Trash2, Plus,
  X, CheckCircle, Shield, Award,
} from "lucide-react";
import { DataTable, StatusBadge, EmptyState } from "@intilaqa/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: string;
  expiryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const typeLabel = (type: string, tw: (k: string) => string) => tw("doc_" + type) || type;

export function DocumentWalletContent({
  employeeId,
  employeeName,
  documents: initialDocs,
  expiringDocuments,
  certificates,
}: {
  employeeId: string;
  employeeName: string;
  documents: Document[];
  expiringDocuments: Document[];
  certificates: Array<{ id: string; name: string; profession: string | null; isVerified: boolean; status: string; expiryDate: Date | null }>;
}) {
  const tw = useTranslations("documentWallet");
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [showUpload, setShowUpload] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("iqama");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocExpiry, setNewDocExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpload = useCallback(async () => {
    if (!newDocName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create", employeeId,
          name: newDocName, type: newDocType,
          fileUrl: newDocUrl || undefined,
          expiryDate: newDocExpiry || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments((prev) => [data.document, ...prev]);
        setShowUpload(false);
        setNewDocName("");
        setNewDocUrl("");
        setNewDocExpiry("");
        setSuccess(tw("uploadSuccess"));
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(tw("uploadError") || "Upload failed");
      }
    } catch {
      setError(tw("networkError") || "Network error");
    } finally {
      setSaving(false);
    }
  }, [employeeId, newDocName, newDocType, newDocUrl, newDocExpiry, tw]);

  const handleDelete = useCallback(async (docId: string) => {
    setDeleting(docId);
    try {
      const res = await fetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", documentId: docId }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setSuccess(tw("deleteSuccess"));
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch {
      setError(tw("deleteError") || "Delete failed");
    } finally {
      setDeleting(null);
    }
  }, [tw]);

  const handleDownload = useCallback(async (doc: Document) => {
    if (doc.url) {
      window.open(doc.url, "_blank");
      return;
    }
    try {
      const res = await fetch(`/api/v1/documents?id=${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.open(data.url, "_blank");
      }
    } catch {
      // silently fail
    }
  }, []);

  const expiring = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const days = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > -30;
  }).length;

  const columns = [
    {
      key: "name",
      header: tw("documentName"),
      render: (doc: Document) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="font-bold text-[14px] text-on-surface">{doc.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: tw("documentType"),
      render: (doc: Document) => (
        <span className="text-[13px] text-on-surface-variant">{typeLabel(doc.type, tw)}</span>
      ),
    },
    {
      key: "expiryDate",
      header: tw("expiryDate"),
      render: (doc: Document) => {
        if (!doc.expiryDate) return <span className="text-[13px] text-on-surface-variant/50">—</span>;
        const days = Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const color = days <= 0 ? "text-red-600 font-bold" : days <= 30 ? "text-red-500" : days <= 60 ? "text-yellow-600" : "";
        return <span className={`text-[13px] ${color}`}>{new Date(doc.expiryDate).toLocaleDateString()}</span>;
      },
    },
    {
      key: "status",
      header: tw("status"),
      render: (doc: Document) => <StatusBadge status={doc.status} />,
    },
    {
      key: "actions",
      header: tw("actions"),
      render: (doc: Document) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDownload(doc)}
            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
            title={tw("download")}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-all disabled:opacity-50"
            title={tw("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success / Error */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-100 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-[13px]">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-100 border border-red-200">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-red-800 text-[13px]">{error}</p>
        </div>
      )}

      {/* Expiring Banner */}
      {expiring > 0 && (
        <div className="floating-glass rounded-[2rem] p-6 border-s-4 border-yellow-500 bg-yellow-50/30">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-on-surface text-[16px]">{tw("actionsRequired")}</h3>
              <p className="text-on-surface-variant/50 text-[13px] mt-1">
                {tw("expiringCount", { count: expiring })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="floating-glass rounded-[2rem] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{tw("uploadDocument")}</h2>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{tw("addDocumentToWallet")}</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {tw("upload")}
          </button>
        </div>

        {showUpload && (
          <div className="border-t border-white/20 pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tw("documentName")}</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={tw("documentName") || "e.g. Iqama 2025"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tw("documentType")}</label>
                  <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary">
                    {["iqama","passport","work_license","professional_certificate","certificate","contract","other"].map((k) => <option key={k} value={k}>{typeLabel(k, tw)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tw("expiryDate")}</label>
                  <input type="date" value={newDocExpiry} onChange={(e) => setNewDocExpiry(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{tw("fileUrl")}</label>
                <input type="url" value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleUpload} disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                  {saving ? tw("saving") || "Saving..." : tw("uploadDocument")}
                </button>
                <button onClick={() => setShowUpload(false)} className="px-4 py-3 rounded-xl bg-white/30 border border-white/60 text-on-surface text-[13px] font-bold hover:bg-white/50 transition-all">
                  {tw("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="floating-glass rounded-[2rem] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{tw("myDocuments")}</h2>
            <p className="text-on-surface-variant/50 text-[13px] mt-0.5">{tw("documentCount", { count: documents.length })}</p>
          </div>
        </div>
        {documents.length === 0 ? (
          <EmptyState icon={<FileText className="w-10 h-10" />} title={tw("noDocuments")} description={tw("startUploadingDocuments")} />
        ) : (
          <DataTable columns={columns as any} data={documents as any} emptyTitle={tw("noDocuments")} emptyDescription="" />
        )}
      </div>

      {/* Stats & Recommended */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="floating-glass rounded-[2rem] p-6">
          <h3 className="font-bold text-on-surface text-[16px] mb-4">{tw("walletStats")}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[13px]">{tw("totalDocuments")}</span>
              <span className="font-bold text-primary text-[16px]">{documents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[13px]">{tw("expiringDocuments")}</span>
              <span className="font-bold text-yellow-600 text-[16px]">{expiring}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[13px]">{tw("complianceScore")}</span>
              <span className="font-bold text-primary text-[16px]">{documents.length > 0 ? Math.round(((documents.length - expiring) / documents.length) * 100) : 100}%</span>
            </div>
          </div>
        </div>

        <div className="floating-glass rounded-[2rem] p-6">
          <h3 className="font-bold text-on-surface text-[16px] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {tw("recommendedDocuments")}
          </h3>
          <ul className="space-y-2 text-[13px] text-on-surface-variant">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Iqama (Resident Permit)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Passport Copy
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Professional License
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Educational Certificates
            </li>
          </ul>
        </div>
      </div>

      {/* Professional Certificates */}
      {certificates.length > 0 && (
        <div className="mt-6 floating-glass rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-[16px] font-bold text-on-surface">Professional Certificates</h3>
          </div>
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/30 border border-white/40">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-[13px]">{cert.name}</p>
                  {cert.profession && <p className="text-on-surface-variant/50 text-[11px]">{cert.profession}</p>}
                </div>
                <div className="text-right shrink-0">
                  {cert.expiryDate && (
                    <p className="text-[12px] font-bold text-on-surface-variant/70">
                      {new Date(cert.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  <StatusBadge status={cert.status} />
                </div>
                {cert.isVerified && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
