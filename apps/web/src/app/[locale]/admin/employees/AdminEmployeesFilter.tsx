"use client";

import { useState, useCallback } from "react";
import { AdvancedFilterBuilder } from "@intilaqa/ui";
import type {
  FilterField,
  FilterCondition,
  FilterGroup,
} from "@intilaqa/ui";
import { ChevronDown } from "lucide-react";

interface Employee {
  id: string;
  userName: string;
  userEmail: string;
  companyName: string;
  position: string;
  employeeId: string;
  statusDisplay: string;
}

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [currentFilterGroup, setCurrentFilterGroup] = useState<FilterGroup | null>(null);

  const filterFields: FilterField[] = [
    {
      key: "name",
      label: "Name",
      type: "string",
      operators: ["contains", "equals", "startsWith", "endsWith"],
    },
    {
      key: "email",
      label: "Email",
      type: "string",
      operators: ["contains", "equals"],
    },
    {
      key: "position",
      label: "Position",
      type: "string",
      operators: ["equals", "contains"],
    },
    {
      key: "isActive",
      label: "Status",
      type: "select",
      operators: ["equals"],
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      key: "isSaudi",
      label: "Saudi",
      type: "select",
      operators: ["equals"],
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    {
      key: "joinDateFrom",
      label: "Join Date From",
      type: "date",
      operators: ["gte"],
    },
    {
      key: "joinDateTo",
      label: "Join Date To",
      type: "date",
      operators: ["lte"],
    },
    {
      key: "salaryMin",
      label: "Min Salary",
      type: "number",
      operators: ["gte"],
    },
    {
      key: "salaryMax",
      label: "Max Salary",
      type: "number",
      operators: ["lte"],
    },
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
            Advanced Filters
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
