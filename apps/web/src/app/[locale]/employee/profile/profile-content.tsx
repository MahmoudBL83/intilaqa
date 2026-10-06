"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  User, Mail, Briefcase, Building2, CalendarDays, BadgeDollarSign,
  FileText, Flag, UserCheck, Download, Edit2, X, Check, Loader2,
} from "lucide-react";
import { PageHeader, FormSection, StatusBadge } from "@intilaqa/ui";
import { updateProfileAction } from "./actions";

type UserData = { name: string; email: string; role: string };
type EmployeeData = { employeeId: string | null; position: string | null; joinDate: string; salary: number; isSaudi: boolean; nationality: string | null; contractStartDate: string | null; contractEndDate: string | null; department: string | null; company: string | null };
type ContractData = { type: string; startDate: string; endDate: string | null; salary: number; status: string; documentUrl: string | null } | null;
type Props = { locale: string; user: UserData; employee: EmployeeData; contract: ContractData };

const formatDate = (dateStr: string, locale: string) => new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" });

export function ProfileContent({ locale, user, employee, contract }: Props) {
  const t = useTranslations();
  const nav = useTranslations("nav");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [nationality, setNationality] = useState(employee.nationality || "");
  const [position, setPosition] = useState(employee.position || "");

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("nationality", nationality);
    fd.set("position", position);
    await updateProfileAction(fd);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={nav("items.profile")}
        breadcrumbs={[{ label: nav("items.dashboard"), href: `/${locale}/employee` }, { label: nav("items.profile") }]}
        actions={
          !editing ? (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all">
              <Edit2 className="w-4 h-4" /> {t("common.edit")}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/30 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/50 transition-all">
                <X className="w-4 h-4" /> {t("common.cancel")}
              </button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {t("common.save")}
              </button>
            </div>
          )
        }
      />

      <FormSection title={t("common.personalInfo") || "Personal Information"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editing ? (
            <>
              <div>
                <label className="block text-on-surface-variant/50 text-[11px] font-bold uppercase mb-1">{t("common.name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px]" />
              </div>
              <InfoRow icon={Mail} label={t("common.email") || "Email"} value={user.email} />
              <div>
                <label className="block text-on-surface-variant/50 text-[11px] font-bold uppercase mb-1">{t("common.nationality")}</label>
                <input value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px]" />
              </div>
              {employee.position !== null && (
              <div>
                <label className="block text-on-surface-variant/50 text-[11px] font-bold uppercase mb-1">{t("common.position")}</label>
                <input value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px]" />
              </div>
              )}
            </>
          ) : (
            <>
              <InfoRow icon={User} label={t("common.name") || "Name"} value={user.name} />
              <InfoRow icon={Mail} label={t("common.email") || "Email"} value={user.email} />
              <InfoRow icon={UserCheck} label={t("common.role") || "Role"} value={user.role} />
              {employee.employeeId && <InfoRow icon={FileText} label={t("common.employeeId") || "Employee ID"} value={employee.employeeId} />}
              {employee.nationality && <InfoRow icon={Flag} label={t("common.nationality") || "Nationality"} value={employee.nationality} />}
              <InfoRow icon={Flag} label={t("common.saudiNational") || "Saudi National"} value={employee.isSaudi ? t("common.yes") : t("common.no")} />
            </>
          )}
        </div>
      </FormSection>

      <div className="mt-6">
        <FormSection title={t("common.workInfo") || "Work Information"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employee.position && <InfoRow icon={Briefcase} label={t("common.position") || "Position"} value={employee.position} />}
            {employee.department && <InfoRow icon={Building2} label={t("common.department") || "Department"} value={employee.department} />}
            {employee.company && <InfoRow icon={Building2} label={t("common.company") || "Company"} value={employee.company} />}
            <InfoRow icon={CalendarDays} label={t("common.joinDate") || "Join Date"} value={formatDate(employee.joinDate, locale)} />
            <InfoRow icon={BadgeDollarSign} label={t("common.salary") || "Salary"} value={`${Number(employee.salary).toLocaleString(locale)} SAR`} />
          </div>
        </FormSection>
      </div>

      {contract && (
        <div className="mt-6">
          <FormSection title={t("common.contractInfo") || "Contract Information"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={FileText} label={t("common.contractType") || "Contract Type"} value={contract.type === "permanent" ? t("common.permanent") || "Permanent" : contract.type.replace("_", " ")} />
              <InfoRow icon={CalendarDays} label={t("common.startDate") || "Start Date"} value={formatDate(contract.startDate, locale)} />
              {contract.endDate && <InfoRow icon={CalendarDays} label={t("common.endDate") || "End Date"} value={formatDate(contract.endDate, locale)} />}
              <InfoRow icon={BadgeDollarSign} label={t("common.contractSalary") || "Contract Salary"} value={`${Number(contract.salary).toLocaleString(locale)} SAR`} />
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/30 border border-white/40">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><UserCheck className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase tracking-wider">{t("common.status") || "Status"}</p>
                  <StatusBadge status={contract.status} />
                </div>
              </div>
            </div>
            {contract.documentUrl && (
              <div className="mt-5 pt-5 border-t border-white/20">
                <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary/90 transition-all">
                  <Download className="w-4 h-4" /> {t("common.download") || "Download Contract"}
                </a>
              </div>
            )}
          </FormSection>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/30 border border-white/40">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-on-surface-variant/50 text-[11px] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-on-surface text-[14px] font-bold mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
