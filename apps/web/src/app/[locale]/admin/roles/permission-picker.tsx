"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@intilaqa/ui";

type Permission = { id: string; key: string; description: string | null };

const groupDefs: { key: string; icon: string; permKeys: string[] }[] = [
  { key: "groupUsers", icon: "👤", permKeys: ["manage_users", "manage_roles"] },
  { key: "groupOrganization", icon: "🏢", permKeys: ["manage_clients", "manage_companies", "manage_subscriptions"] },
  { key: "groupWorkforce", icon: "👥", permKeys: ["manage_employees", "manage_attendance", "employee_self_service"] },
  { key: "groupFinance", icon: "💰", permKeys: ["manage_payroll"] },
  { key: "groupSystem", icon: "⚙️", permKeys: ["manage_settings", "view_reports"] },
];

export function PermissionPicker({
  permissions,
  selectedIds,
  name = "permissions",
}: {
  permissions: Permission[];
  selectedIds: string[];
  name?: string;
}) {
  const t = useTranslations("roles");
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(groupDefs.map((g) => g.key)));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectedIds));

  const permMap = useMemo(() => {
    const m = new Map<string, Permission>();
    permissions.forEach((p) => m.set(p.key, p));
    return m;
  }, [permissions]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const togglePerm = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroupPerms = (permKeys: string[]) => {
    const ids = permKeys.map((k) => permMap.get(k)?.id).filter(Boolean) as string[];
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const allIds = permissions.map((p) => p.id);
  const selectAll = () => setSelected(new Set(allIds));
  const deselectAll = () => setSelected(new Set());

  const filteredGroups = search
    ? groupDefs
        .map((g) => ({
          ...g,
          permKeys: g.permKeys.filter((k) => {
            const p = permMap.get(k);
            return p && (k.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
          }),
        }))
        .filter((g) => g.permKeys.length > 0)
    : groupDefs;

  return (
    <div className="space-y-3">
      {/* Header: search + bulk actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPermissions")}
            className="w-full ps-10 pe-10 py-2 rounded-xl bg-white/50 border border-outline-variant/30 text-on-surface text-[13px] placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-on-surface-variant/40 hover:text-on-surface-variant/60" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-on-surface-variant/50">
            {t("selectedCount", { count: selected.size })}
          </span>
          <button type="button" onClick={selectAll} className="text-[12px] font-bold text-primary hover:underline">{t("selectAll")}</button>
          <span className="text-on-surface-variant/20">|</span>
          <button type="button" onClick={deselectAll} className="text-[12px] font-bold text-on-surface-variant/50 hover:underline">{t("deselectAll")}</button>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-2">
        {filteredGroups.map((group) => {
          const groupIds = group.permKeys.map((k) => permMap.get(k)?.id).filter(Boolean) as string[];
          const selectedInGroup = groupIds.filter((id) => selected.has(id)).length;
          const allSelected = groupIds.length > 0 && groupIds.every((id) => selected.has(id));
          const someSelected = selectedInGroup > 0 && !allSelected;
          const isExpanded = expandedGroups.has(group.key);
          const groupLabel = t(group.key as any);

          return (
            <div key={group.key} className="rounded-2xl border border-outline-variant/20 bg-white/40 overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleGroupPerms(group.permKeys)}
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                    allSelected
                      ? "bg-primary border-primary text-white"
                      : someSelected
                        ? "bg-primary/20 border-primary text-primary"
                        : "border-outline-variant/40 bg-white/50 hover:border-primary/40"
                  )}
                >
                  {(allSelected || someSelected) && <Check className="w-3 h-3" />}
                </button>
                <span className="text-base">{group.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-bold text-on-surface">{groupLabel}</span>
                  <span className="text-[11px] text-on-surface-variant/40 ms-2">
                    {selectedInGroup}/{groupIds.length}
                  </span>
                </div>
                <button type="button" onClick={() => toggleGroup(group.key)} className="text-on-surface-variant/30 hover:text-on-surface-variant/60 transition-colors">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Permissions */}
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1">
                  {group.permKeys.map((key) => {
                    const perm = permMap.get(key);
                    if (!perm) return null;
                    const isChecked = selected.has(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                          isChecked
                            ? "bg-primary/5 border border-primary/15"
                            : "hover:bg-white/60 border border-transparent"
                        )}
                      >
                        <input
                          type="checkbox"
                          name={name}
                          value={perm.id}
                          checked={isChecked}
                          onChange={() => togglePerm(perm.id)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                          isChecked
                            ? "bg-primary border-primary text-white"
                            : "border-outline-variant/40 bg-white/50"
                        )}>
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-on-surface leading-tight">{perm.key}</div>
                          {perm.description && (
                            <div className="text-[11px] text-on-surface-variant/45 leading-tight mt-0.5">{perm.description}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-[13px] text-on-surface-variant/40">
            {t("noPermissionsFound")}
          </div>
        )}
      </div>
    </div>
  );
}
