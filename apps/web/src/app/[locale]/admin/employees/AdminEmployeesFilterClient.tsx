"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AdvancedFilterBuilder } from "@intilaqa/ui";
import type {
  FilterField,
  FilterCondition,
  FilterGroup,
} from "@intilaqa/ui";
import { ChevronDown } from "lucide-react";

interface FilteredResult {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AdminEmployeesFilterClientProps {
  locale: string;
}

export function AdminEmployeesFilterClient({ locale }: AdminEmployeesFilterClientProps) {
  const tc = useTranslations("common");
  const te = useTranslations("employees");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [currentFilterGroup, setCurrentFilterGroup] = useState<FilterGroup | null>(null);

  const filterFields: FilterField[] = [
    { key: "name", label: tc("name"), type: "string", operators: ["contains", "equals", "startsWith", "endsWith"] },
    { key: "email", label: tc("email"), type: "string", operators: ["contains", "equals"] },
    { key: "position", label: te("position"), type: "string", operators: ["equals", "contains"] },
    { key: "isActive", label: tc("status"), type: "select", operators: ["equals"], options: [{ label: tc("active"), value: "true" }, { label: tc("inactive"), value: "false" }] },
    { key: "isSaudi", label: "Saudi", type: "select", operators: ["equals"], options: [{ label: tc("yes"), value: "true" }, { label: tc("no"), value: "false" }] },
    { key: "joinDateFrom", label: tc("joinDateFrom"), type: "date", operators: ["gte"] },
    { key: "joinDateTo", label: tc("joinDateTo"), type: "date", operators: ["lte"] },
    { key: "salaryMin", label: tc("minSalary"), type: "number", operators: ["gte"] },
    { key: "salaryMax", label: tc("maxSalary"), type: "number", operators: ["lte"] },
    { key: "docExpiryMonth", label: tc("docExpiryMonth"), type: "select", operators: ["equals"], options: [
      { label: tc("january"), value: "1" }, { label: tc("february"), value: "2" }, { label: tc("march"), value: "3" },
      { label: tc("april"), value: "4" }, { label: tc("may"), value: "5" }, { label: tc("june"), value: "6" },
      { label: tc("july"), value: "7" }, { label: tc("august"), value: "8" }, { label: tc("september"), value: "9" },
      { label: tc("october"), value: "10" }, { label: tc("november"), value: "11" }, { label: tc("december"), value: "12" },
    ]},
  ];

  const handleFilterChange = useCallback((group: FilterGroup) => {
    setCurrentFilterGroup(group);
    setFilterCount(
      (group.conditions as FilterCondition[]).filter((c) => c.field).length
    );
  }, []);

  const handleApply = useCallback(async () => {
    if (!currentFilterGroup) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/employees/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: currentFilterGroup.conditions.map((cond: any) => ({
            field: cond.field,
            operator: cond.operator,
            value: cond.value,
          })),
          logic: currentFilterGroup.logic,
          take: 10,
          skip: 0,
        }),
      });

      if (!response.ok) throw new Error("Filter request failed");
      const result: FilteredResult = await response.json();

      // Build query string with results
      const params = new URLSearchParams();
      // You could encode the filter results in the URL or just reset pagination
      window.location.href = `?${params.toString()}`;
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilterGroup]);

  const handleReset = useCallback(() => {
    setFilterCount(0);
    setCurrentFilterGroup(null);
    window.location.href = window.location.pathname;
  }, []);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-on-surface font-semibold text-[14px]">
            {tc("advancedFilters")}
          </span>
          {filterCount > 0 && (
            <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-[12px] font-bold">
              {filterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 rounded-2xl bg-white/20 border border-white/40 backdrop-blur-xl">
          <AdvancedFilterBuilder
            fields={filterFields}
            onFilterChange={handleFilterChange}
            onApply={handleApply}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
